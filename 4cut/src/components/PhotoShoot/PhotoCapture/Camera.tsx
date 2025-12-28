import {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import '../../../styles/PhotoShoot/PhotoCapture/Camera.css';

import { useOrientation } from '../../../hooks/useOrientation.ts';

interface CameraProps {
    ratio: string;
    photoIndex: number;
    onCapture: (base64Img: string | null, capturedIndex: number, gifBlob: Blob | null) => void;
    onComplete: () => void;
}

function Camera({ ratio, photoIndex, onCapture, onComplete }: CameraProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const tempCanvasRef = useRef<HTMLCanvasElement | null>(null); // [최적화] 임시 캔버스 재사용
    const timeoutRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);

    const gifFramesRef = useRef<ImageData[]>([]);
    const gifIntervalRef = useRef<number | null>(null);
    const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const [countdown, setCountdown] = useState<number | null>(null);
    const [showCanvas, setShowCanvas] = useState(false);
    const [isStreamReady, setIsStreamReady] = useState(false);

    // [DEBUG]
    const [debugInfo, setDebugInfo] = useState({ 
        width: 0, height: 0, currentWidth: 0, currentHeight: 0, loadCount: 0 
    });
    
    // 회전 여부 판단 헬퍼 함수
    const checkIsRotated = useCallback((vW: number, vH: number) => {
        const initW = debugInfo.width;
        const initH = debugInfo.height;
        return (initW > 0 && initH > 0) && ((initW > initH) !== (vW > vH));
    }, [debugInfo.width, debugInfo.height]);

    // [DEBUG] Monitor resolution changes
    useEffect(() => {
        const interval = setInterval(() => {
            if (videoRef.current) {
                const v = videoRef.current;
                // 값 변화가 있을 때만 상태 업데이트
                if (debugInfo.currentWidth !== v.videoWidth || debugInfo.currentHeight !== v.videoHeight) {
                    setDebugInfo(prev => ({ 
                        ...prev, 
                        currentWidth: v.videoWidth, 
                        currentHeight: v.videoHeight 
                    }));
                }
            }
        }, 500);
        return () => clearInterval(interval);
    }, [debugInfo.currentWidth, debugInfo.currentHeight]);

    const orientation = useOrientation();

    // 프리뷰 렌더링 (Canvas에 직접 그리기)
    useEffect(() => {
        let animationFrameId: number;

        const render = () => {
            if (!videoRef.current || !previewCanvasRef.current) return;
            const video = videoRef.current;
            const canvas = previewCanvasRef.current;
            const ctx = canvas.getContext('2d');

            const vW = video.videoWidth;
            const vH = video.videoHeight;
            const isRotated = checkIsRotated(vW, vH);

            // PC 등 회전이 필요 없을 때는 캔버스에 그리지 않음 (성능 최적화)
            // 비디오 태그가 직접 보이기 때문
            if (!isRotated) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            if (video.readyState >= 2 && ctx) {
                // 캔버스 크기는 회전된 해상도에 맞춤
                const targetW = vH; // 회전 시 w <-> h
                const targetH = vW;

                if (canvas.width !== targetW || canvas.height !== targetH) {
                    canvas.width = targetW;
                    canvas.height = targetH;
                }

                ctx.save();
                
                // 1. 좌우 반전 (Mirroring)
                ctx.translate(targetW, 0);
                ctx.scale(-1, 1);

                // 2. 그리기 (회전 없이 원본 그대로)
                ctx.drawImage(video, 0, 0, vW, vH);

                ctx.restore();
            }
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [checkIsRotated]);

    // 캡처 파라미터 계산
    const getCaptureParams = useCallback(() => {
        if (!videoRef.current) return null;
        const video = videoRef.current;
        const [width, height] = ratio.split(':').map(Number);

        const vW = video.videoWidth;
        const vH = video.videoHeight;
        const isRotated = checkIsRotated(vW, vH);

        const sourceWidth = isRotated ? vH : vW;
        const sourceHeight = isRotated ? vW : vH;

        if (!sourceWidth || !sourceHeight) return null;

        const videoRatio = sourceWidth / sourceHeight;
        const targetRatio = width / height;

        let sWidth, sHeight, sx, sy;

        if (videoRatio > targetRatio) {
            sHeight = sourceHeight;
            sWidth = sHeight * targetRatio;
            sx = (sourceWidth - sWidth) / 2;
            sy = 0;
        } else {
            sWidth = sourceWidth;
            sHeight = sWidth / targetRatio;
            sx = 0;
            sy = (sourceHeight - sHeight) / 2;
        }

        return { sx, sy, sWidth, sHeight, canvasWidth: sWidth, canvasHeight: sHeight };
    }, [ratio, checkIsRotated]);


    const capturePhoto = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        const params = getCaptureParams();
        if (!params) return;

        const { sx, sy, sWidth, sHeight, canvasWidth, canvasHeight } = params;

        // 1. 임시 캔버스 준비 (재사용)
        if (!tempCanvasRef.current) {
            tempCanvasRef.current = document.createElement('canvas');
        }
        const tempCanvas = tempCanvasRef.current;
        
        const vW = video.videoWidth;
        const vH = video.videoHeight;
        const isRotated = checkIsRotated(vW, vH);
        
        const fullW = isRotated ? vH : vW;
        const fullH = isRotated ? vW : vH;

        if (tempCanvas.width !== fullW || tempCanvas.height !== fullH) {
            tempCanvas.width = fullW;
            tempCanvas.height = fullH;
        }
        
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
            tempCtx.save();
            tempCtx.translate(fullW, 0);
            tempCtx.scale(-1, 1);
            
            // 회전 없이 그리기
            tempCtx.drawImage(video, 0, 0, vW, vH);
            
            tempCtx.restore();
        }

        // 2. 최종 캔버스에 크롭하여 그리기
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(tempCanvas, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);
            
            const base64Img = canvas.toDataURL('image/jpeg');
            onCapture(base64Img, photoIndex, null);
            
            setShowCanvas(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = window.setTimeout(() => {
                setShowCanvas(false);
                onComplete();
            }, 500);

            // GIF 생성 로직
            if (gifFramesRef.current.length > 0) {
                const framesToEncode = [...gifFramesRef.current];
                const firstFrame = framesToEncode[0];
                const width = firstFrame.width;
                const height = firstFrame.height;
                const worker = new Worker(new URL('./gif.worker.ts', import.meta.url), { type: 'module' });

                worker.onmessage = (e) => {
                    const { success, blob, error } = e.data;
                    if (success && blob) {
                        console.log(`GIF encoded via Worker for index ${photoIndex}, size: ${blob.size}`);
                        onCapture(null, photoIndex, blob);
                    } else {
                        console.error("Worker GIF encoding failed:", error);
                    }
                    worker.terminate();
                };

                worker.onerror = (err) => {
                    console.error("Worker error:", err);
                    worker.terminate();
                };

                worker.postMessage({
                    width,
                    height, // firstFrame에서 가져온 width, height 사용
                    frames: framesToEncode,
                    delay: 100
                });
            }
        }
    }, [photoIndex, onCapture, onComplete, getCaptureParams, checkIsRotated]);

    // Effect 1: Setup camera stream
    useEffect(() => {
        const video = videoRef.current;
        let stream: MediaStream;

        const handleMetadataLoaded = () => {
            setIsStreamReady(true);
            if (video) {
                setDebugInfo(prev => ({
                    ...prev,
                    width: video.videoWidth,
                    height: video.videoHeight,
                    loadCount: prev.loadCount + 1
                }));
            }
        };

        async function setupCamera() {
            if (!video) return;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'user',
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    } 
                });
                video.srcObject = stream;
                video.addEventListener('loadedmetadata', handleMetadataLoaded);
            } catch (err) {
                console.error("Error accessing camera: ", err);
            }
        }

        setupCamera();

        return () => {
            if (video) video.removeEventListener('loadedmetadata', handleMetadataLoaded);
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (gifIntervalRef.current) clearInterval(gifIntervalRef.current);
        };
    }, []);

    // Effect 2: Countdown Timer & GIF Capture
    useEffect(() => {
        if (!isStreamReady) return;

        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        if (gifIntervalRef.current) { clearInterval(gifIntervalRef.current); gifIntervalRef.current = null; }

        setCountdown(6);
        gifFramesRef.current = [];
        setShowCanvas(false);

        intervalRef.current = window.setInterval(() => {
            setCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
        }, 1000);

        const params = getCaptureParams();
        
        if (params) {
            const MAX_GIF_WIDTH = 400;
            const scale = params.canvasWidth > MAX_GIF_WIDTH ? MAX_GIF_WIDTH / params.canvasWidth : 1;
            const gifWidth = Math.floor(params.canvasWidth * scale);
            const gifHeight = Math.floor(params.canvasHeight * scale);

            gifIntervalRef.current = window.setInterval(() => {
                if (!videoRef.current) return;
                
                const vW = videoRef.current.videoWidth;
                const vH = videoRef.current.videoHeight;
                const isRotated = checkIsRotated(vW, vH);
                const fullW = isRotated ? vH : vW;
                const fullH = isRotated ? vW : vH;

                // [최적화] 오프스크린 캔버스 초기화 및 재사용
                if (!offscreenCanvasRef.current) {
                    offscreenCanvasRef.current = document.createElement('canvas');
                }
                const offCanvas = offscreenCanvasRef.current;
                
                // [최적화] 임시 캔버스 재사용
                if (!tempCanvasRef.current) {
                    tempCanvasRef.current = document.createElement('canvas');
                }
                const tempC = tempCanvasRef.current;

                if (tempC.width !== fullW || tempC.height !== fullH) {
                    tempC.width = fullW;
                    tempC.height = fullH;
                }

                const tempCtx = tempC.getContext('2d', { willReadFrequently: true });
                if (tempCtx) {
                    tempCtx.save();
                    tempCtx.translate(fullW, 0);
                    tempCtx.scale(-1, 1);
                    // 회전 없이 그리기
                    tempCtx.drawImage(videoRef.current, 0, 0, vW, vH);
                    tempCtx.restore();
                }

                if (offCanvas.width !== gifWidth || offCanvas.height !== gifHeight) {
                    offCanvas.width = gifWidth;
                    offCanvas.height = gifHeight;
                }

                const ctx = offCanvas.getContext('2d', { willReadFrequently: true });
                if (ctx) {
                    ctx.drawImage(tempC, params.sx, params.sy, params.sWidth, params.sHeight, 0, 0, gifWidth, gifHeight);
                    const imageData = ctx.getImageData(0, 0, gifWidth, gifHeight);
                    gifFramesRef.current.push(imageData);
                }
            }, 100);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (gifIntervalRef.current) clearInterval(gifIntervalRef.current);
        };
    }, [isStreamReady, getCaptureParams, photoIndex, checkIsRotated]);

    // Effect 4: Photo Capture Trigger
    useEffect(() => {
        if (countdown === 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (gifIntervalRef.current) clearInterval(gifIntervalRef.current);
            capturePhoto();
            setCountdown(null);
        }
    }, [countdown, capturePhoto]);

    const videoStyle = {
        aspectRatio: ratio.replace(':', ' / '),
    };

    const classNameForRatio = useMemo(() => {
        const [width, height] = ratio.split(':').map(Number);
        const numericRatio = width / height;

        if (numericRatio > 1) {
            return orientation === 'portrait' ? 'fit-to-width' : 'fit-to-height';
        }

        return 'fit-to-height';

    }, [ratio, orientation]);

    // 회전 여부 판단 (렌더링 시 사용)
    const initW = debugInfo.width;
    const initH = debugInfo.height;
    const curW = debugInfo.currentWidth;
    const curH = debugInfo.currentHeight;
    
    // 이부분도 checkIsRotated 활용 가능하지만, 렌더링 중이라 직접 호출하거나 변수 사용
    // 여기서는 debugInfo 상태값을 직접 참조하여 계산
    const isRotated = (initW > 0 && initH > 0) && 
                      ((initW > initH) !== (curW > curH));

    return (
        <div className={`camera-container ${showCanvas ? 'canvas-visible' : ''}`}>
             {/* DEBUG UI */}
             {/*
             <div style={{
                position: 'absolute', top: '70px', right: '10px',
                backgroundColor: 'rgba(0,0,0,0.6)', color: '#0f0',
                fontSize: '12px', padding: '8px', zIndex: 9999, pointerEvents: 'none',
                whiteSpace: 'pre-wrap', textAlign: 'left', borderRadius: '4px'
            }}>
                [DEBUG]<br/>
                Init: {debugInfo.width}x{debugInfo.height}<br/>
                Cur: {debugInfo.currentWidth}x{debugInfo.currentHeight}<br/>
                Loads: {debugInfo.loadCount}<br/>
                Rotated: {isRotated ? 'YES' : 'NO'}<br/>
                Idx: {photoIndex} / Cnt: {countdown}
            </div>
            */}


            <div 
                style={{ ...videoStyle }} 
                className={`video-container ${classNameForRatio}`}
            >
                {/* PC 등 회전이 필요 없을 땐 비디오를 직접 보여줌 (가장 확실함) */}
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="camera-video"
                    style={{ 
                        display: isRotated ? 'none' : 'block',
                        transform: 'scaleX(-1)'
                    }} 
                ></video>
                
                {/* 회전 보정이 필요할 때만 캔버스 프리뷰 사용 */}
                <canvas 
                    ref={previewCanvasRef} 
                    className="camera-video"
                    style={{ 
                        display: isRotated ? 'block' : 'none',
                        objectFit: 'cover' 
                    }}
                />
            </div>
            <div style={videoStyle} className={`canvas-container ${classNameForRatio}`}>
                <canvas ref={canvasRef} className="captured-image"></canvas>
            </div>
            {countdown !== null && countdown > 0 && !showCanvas && (
                <div className="countdown">{countdown}</div>
            )}
        </div>
    );
}

export default Camera;