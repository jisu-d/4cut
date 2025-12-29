import { useEffect, useRef, useState, useCallback } from 'react';
import type { ImgPlaceData } from '../../../types/types';

interface ComposedResult {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    generateGifBlob: () => Promise<Blob | null>;
    isReady: boolean;
}

export const useGifComposer = (
    frameImg: HTMLImageElement | null, 
    slotImages: (HTMLImageElement | null)[], 
    imgPlaceData: ImgPlaceData[]
): ComposedResult => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isReady, setIsReady] = useState(false);
    const requestRef = useRef<number | null>(null);
    
    // 데이터 저장소
    const decodedFramesRef = useRef<{ 
        bitmaps: ImageBitmap[]
    }[]>([]);
    
    // 워커 관리
    const workersRef = useRef<Worker[]>([]);
    
    // 중복 실행 방지
    const activeGifBlobsRef = useRef<(Blob | null)[]>([]);

    const latestSlotImagesRef = useRef(slotImages);
    const latestImgPlaceDataRef = useRef(imgPlaceData);

    useEffect(() => {
        latestSlotImagesRef.current = slotImages;
        latestImgPlaceDataRef.current = imgPlaceData;
    }, [slotImages, imgPlaceData]);


    // ----------------------------------------------------------------------
    // 1. 워커 관리 Effect (순차 실행 적용)
    // ----------------------------------------------------------------------
    useEffect(() => {
        const gifSlots = imgPlaceData.filter(slot => slot.gifBlob);
        const totalGifs = gifSlots.length;

        if (totalGifs === 0) {
            setIsReady(true);
            return;
        }

        const currentBlobs = imgPlaceData.map(slot => slot.gifBlob || null);
        const prevBlobs = activeGifBlobsRef.current;
        
        const isSame = currentBlobs.length === prevBlobs.length && 
                       currentBlobs.every((blob, i) => blob === prevBlobs[i]);

        // 데이터가 같고 워커가 모두 정상 실행 중이라면 패스 (이미 완료된 상태면 isReady 유지)
        if (isSame && workersRef.current.length > 0) {
            return;
        }

        // --- 새 작업 시작 ---

        // 1. 기존 워커 정리
        workersRef.current.forEach(w => w.terminate());
        workersRef.current = [];

        // 2. 상태 초기화
        activeGifBlobsRef.current = currentBlobs;
        decodedFramesRef.current = new Array(imgPlaceData.length).fill(null);
        setIsReady(false); // 다시 로딩 시작

        let completedCount = 0;
        let isUnmounted = false; // 마운트 상태 추적

        // 3. 워커 순차 실행 함수
        const startWorkersSequentially = async () => {
            // 인덱스와 슬롯을 매핑
            const targets = imgPlaceData.map((slot, index) => ({ slot, index })).filter(t => t.slot.gifBlob);

            for (const { slot, index } of targets) {
                if (isUnmounted) return; // 컴포넌트 사라지면 중단

                if (slot.gifBlob) {
                    decodedFramesRef.current[index] = { bitmaps: [] };

                    const worker = new Worker(new URL('./gifDecode.worker.ts', import.meta.url), { type: 'module' });
                    workersRef.current.push(worker);
                    
                    worker.onmessage = async (e) => {
                        const { success, index: idx, bitmap, isPartial, isComplete } = e.data;
                        
                        if (success) {
                            if (!decodedFramesRef.current[idx]) {
                                    decodedFramesRef.current[idx] = { bitmaps: [] };
                            }
                            const targetStorage = decodedFramesRef.current[idx];

                            if (isPartial && targetStorage && bitmap) {
                                targetStorage.bitmaps.push(bitmap);
                            } else if (isComplete) {
                                completedCount++;
                                if (completedCount === totalGifs) {
                                    setIsReady(true);
                                }
                                worker.terminate();
                            }
                        }
                    };

                    worker.postMessage({ gifBlob: slot.gifBlob, index });
                }

                // [핵심] 다음 워커 실행 전 200ms 대기 (브라우저 부하 분산)
                await new Promise(resolve => setTimeout(resolve, 20));
            }
        };

        startWorkersSequentially();

        // Cleanup: 이펙트가 정리될 때(새 데이터 들어옴 or Unmount) 플래그 설정
        return () => {
            isUnmounted = true;
        };

    }, [imgPlaceData]);


    // ----------------------------------------------------------------------
    // 1.5. Unmount Cleanup (진짜 종료)
    // ----------------------------------------------------------------------
    useEffect(() => {
        return () => {
            workersRef.current.forEach(w => w.terminate());
            workersRef.current = [];
            
            decodedFramesRef.current.forEach(item => {
                if (item && item.bitmaps) {
                    item.bitmaps.forEach(bmp => bmp.close());
                }
            });
        };
    }, []);


    // ----------------------------------------------------------------------
    // 2. 애니메이션 루프
    // ----------------------------------------------------------------------
    useEffect(() => {
        if (!frameImg) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const MAX_WIDTH = 3304;
        let scale = 1;
        if (frameImg.naturalWidth > MAX_WIDTH) {
            scale = MAX_WIDTH / frameImg.naturalWidth;
        }
        const canvasWidth = Math.floor(frameImg.naturalWidth * scale);
        const canvasHeight = Math.floor(frameImg.naturalHeight * scale);
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        let frameIndex = 0;
        let lastTime = 0;
        const frameInterval = 33; // 30fps

        const animate = (time: number) => {
            if (time - lastTime >= frameInterval) {
                lastTime = time;
                frameIndex++;

                ctx.clearRect(0, 0, canvasWidth, canvasHeight);

                const currentSlotImages = latestSlotImagesRef.current;
                const currentImgPlaceData = latestImgPlaceDataRef.current;

                currentImgPlaceData.forEach((slot, idx) => {
                    const gifData = decodedFramesRef.current[idx];
                    const staticImg = currentSlotImages[idx];
                    let source: CanvasImageSource | null = null;

                    if (gifData && gifData.bitmaps && gifData.bitmaps.length > 0) {
                        source = gifData.bitmaps[frameIndex % gifData.bitmaps.length];
                    } else if (staticImg) {
                        source = staticImg;
                    }

                    if (source) {
                        ctx.save();
                        
                        let adjustedLeft = slot.left;
                        let adjustedTop = slot.top;

                        // 90도 회전 시 좌표 보정
                        if (slot.angle && Math.abs(slot.angle) % 180 === 90) {
                            const xOffset = (slot.height - slot.width) / 2;
                            const yOffset = (slot.width - slot.height) / 2;
                            adjustedLeft += xOffset;
                            adjustedTop += yOffset;
                        }

                        const scaledLeft = adjustedLeft * scale;
                        const scaledTop = adjustedTop * scale;
                        const scaledWidth = slot.width * scale;
                        const scaledHeight = slot.height * scale;
                        const cx = scaledLeft + scaledWidth / 2;
                        const cy = scaledTop + scaledHeight / 2;

                        ctx.translate(cx, cy);
                        ctx.rotate((slot.angle * Math.PI) / 180);
                        ctx.translate(-cx, -cy);
                        ctx.drawImage(source, scaledLeft, scaledTop, scaledWidth, scaledHeight);
                        ctx.restore();
                    }
                });

                ctx.drawImage(frameImg, 0, 0, canvasWidth, canvasHeight);
            }
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [frameImg]);


    // ----------------------------------------------------------------------
    // 3. GIF Blob 생성 (Worker 위임)
    // ----------------------------------------------------------------------
    const generateGifBlob = useCallback(async (): Promise<Blob | null> => {
        if (!frameImg) return null;
        
        try {
            // 1. Worker에 보낼 데이터 준비 (메인 스레드 부하 최소화)
            // HTMLImageElement는 Worker로 직접 못 보내므로 ImageBitmap으로 변환
            const frameBitmap = await createImageBitmap(frameImg);
            
            const slotBitmaps = await Promise.all(
                latestSlotImagesRef.current.map(async (img) => {
                    return img ? await createImageBitmap(img) : null;
                })
            );

            // 2. Worker 생성 및 요청
            return new Promise((resolve, reject) => {
                const worker = new Worker(new URL('./blobGenerator.worker.ts', import.meta.url), { type: 'module' });
                
                worker.onmessage = (e) => {
                    const { success, blob, error } = e.data;
                    if (success) {
                        resolve(blob);
                    } else {
                        console.error("Worker GIF gen failed:", error);
                        resolve(null);
                    }
                    worker.terminate(); // 작업 완료 후 즉시 종료
                    
                    // 비트맵 리소스 해제 (메모리 누수 방지)
                    frameBitmap.close();
                    slotBitmaps.forEach(bmp => bmp && bmp.close());
                };

                worker.onerror = (err) => {
                    console.error("Worker Error:", err);
                    reject(err);
                    worker.terminate();
                };

                worker.postMessage({
                    type: 'GENERATE_GIF',
                    frameBitmap,
                    slotBitmaps,
                    gifFrames: decodedFramesRef.current, // 디코딩된 프레임 데이터 (이미 비트맵 배열)
                    imgPlaceData: latestImgPlaceDataRef.current
                });
            });

        } catch (e) {
            console.error("GIF Blob generation failed in setup", e);
            return null;
        }
    }, [frameImg]);

    return { canvasRef, generateGifBlob, isReady };
};