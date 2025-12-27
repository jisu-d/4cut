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
    const timeoutRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);

    const gifFramesRef = useRef<ImageData[]>([]);
    const gifIntervalRef = useRef<number | null>(null);
    const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const [countdown, setCountdown] = useState<number | null>(null);
    const [showCanvas, setShowCanvas] = useState(false);
    const [isStreamReady, setIsStreamReady] = useState(false);

    // 캡처 파라미터 계산 (비디오 -> 캔버스 크롭 좌표 및 크기)
    const getCaptureParams = useCallback(() => {
        if (!videoRef.current) return null;
        const video = videoRef.current;
        const [width, height] = ratio.split(':').map(Number);

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        if (!videoWidth || !videoHeight) return null;

        const videoRatio = videoWidth / videoHeight;
        const targetRatio = width / height;

        let sWidth, sHeight, sx, sy;

        if (videoRatio > targetRatio) {
            sHeight = videoHeight;
            sWidth = sHeight * targetRatio;
            sx = (videoWidth - sWidth) / 2;
            sy = 0;
        } else {
            sWidth = videoWidth;
            sHeight = sWidth / targetRatio;
            sx = 0;
            sy = (videoHeight - sHeight) / 2;
        }

        return { sx, sy, sWidth, sHeight, canvasWidth: sWidth, canvasHeight: sHeight };
    }, [ratio]);


    const capturePhoto = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        const params = getCaptureParams();
        if (!params) return;

        const { sx, sy, sWidth, sHeight, canvasWidth, canvasHeight } = params;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const context = canvas.getContext('2d');
        if (context) {
            context.translate(canvasWidth, 0);
            context.scale(-1, 1);
            context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);
            
            const base64Img = canvas.toDataURL('image/jpeg');
            
            // 1. 정적 이미지만 먼저 저장하고 즉시 다음 단계(onComplete)로 진행
            onCapture(base64Img, photoIndex, null);
            setShowCanvas(true);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = window.setTimeout(() => {
                setShowCanvas(false);
                onComplete();
            }, 500);


            // 2. GIF 인코딩은 Web Worker를 사용하여 백그라운드에서 처리 (메인 스레드 차단 방지)
            if (gifFramesRef.current.length > 0) {
                const framesToEncode = [...gifFramesRef.current];
                const firstFrame = framesToEncode[0];
                const width = firstFrame.width;
                const height = firstFrame.height;

                // Web Worker 생성
                const worker = new Worker(new URL('./gif.worker.ts', import.meta.url), { type: 'module' });

                worker.onmessage = (e) => {
                    const { success, blob, error } = e.data;
                    if (success && blob) {
                        console.log(`GIF encoded via Worker for index ${photoIndex}, size: ${blob.size}`);
                        onCapture(null, photoIndex, blob);
                    } else {
                        console.error("Worker GIF encoding failed:", error);
                    }
                    worker.terminate(); // 작업 완료 후 워커 종료
                };

                worker.postMessage({
                    width,
                    height,
                    frames: framesToEncode,
                    delay: 100
                });
            }
        }
    }, [photoIndex, onCapture, onComplete, getCaptureParams]);

    // Effect 1: Setup camera stream
    useEffect(() => {
        const video = videoRef.current;
        let stream: MediaStream;

        const handleMetadataLoaded = () => {
            setIsStreamReady(true);
        };

        async function setupCamera() {
            if (!video) return;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = stream;
                video.addEventListener('loadedmetadata', handleMetadataLoaded);
            } catch (err) {
                console.error("Error accessing camera: ", err);
            }
        }

        setupCamera();

        return () => {
            if (video) {
                video.removeEventListener('loadedmetadata', handleMetadataLoaded);
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (gifIntervalRef.current) {
                clearInterval(gifIntervalRef.current);
            }
        };
    }, []);

    // Effect 2: Countdown Timer & GIF Capture
    useEffect(() => {
        if (!isStreamReady) return;

        setCountdown(6);
        gifFramesRef.current = []; // 초기화

        // 카운트다운 타이머
        intervalRef.current = window.setInterval(() => {
            setCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
        }, 1000);

        // GIF 프레임 캡처 (100ms마다)
        gifIntervalRef.current = window.setInterval(() => {
            if (!videoRef.current) return;
            
            const params = getCaptureParams();
            if (!params) return;

            // GIF 최적화를 위한 리사이징 (최대 너비 400px)
            const MAX_GIF_WIDTH = 400;
            const scale = params.canvasWidth > MAX_GIF_WIDTH ? MAX_GIF_WIDTH / params.canvasWidth : 1;
            const gifWidth = Math.floor(params.canvasWidth * scale);
            const gifHeight = Math.floor(params.canvasHeight * scale);

            // 오프스크린 캔버스 초기화 (한 번만 생성하거나 크기 변경 시 재생성)
            if (!offscreenCanvasRef.current) {
                offscreenCanvasRef.current = document.createElement('canvas');
            }
            const offCanvas = offscreenCanvasRef.current;
            if (offCanvas.width !== gifWidth || offCanvas.height !== gifHeight) {
                offCanvas.width = gifWidth;
                offCanvas.height = gifHeight;
            }

            // willReadFrequently 옵션으로 getImageData 성능 최적화
            const ctx = offCanvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
                // 좌우 반전 처리
                ctx.save();
                ctx.translate(gifWidth, 0);
                ctx.scale(-1, 1);
                // 리사이징하여 그리기
                ctx.drawImage(videoRef.current, params.sx, params.sy, params.sWidth, params.sHeight, 0, 0, gifWidth, gifHeight);
                ctx.restore();

                const imageData = ctx.getImageData(0, 0, gifWidth, gifHeight);
                gifFramesRef.current.push(imageData);
            }
        }, 100);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (gifIntervalRef.current) {
                clearInterval(gifIntervalRef.current);
            }
        };
    }, [isStreamReady, getCaptureParams]);

    // Effect 3: Photo Capture Trigger
    useEffect(() => {
        if (countdown === 0) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (gifIntervalRef.current) {
                clearInterval(gifIntervalRef.current);
            }
            capturePhoto();
            setCountdown(null);
        }
    }, [countdown, capturePhoto]);

    const videoStyle = {
        aspectRatio: ratio.replace(':', ' / '),
    };

    const orientation = useOrientation();

    const classNameForRatio = useMemo(() => {
        const [width, height] = ratio.split(':').map(Number);
        const numericRatio = width / height;

        if (numericRatio > 1) {
            return orientation === 'portrait' ? 'fit-to-width' : 'fit-to-height';
        }

        return 'fit-to-height';

    }, [ratio, orientation]);

    return (
        <div className={`camera-container ${showCanvas ? 'canvas-visible' : ''}`}>
            <div 
                style={{ ...videoStyle, transform: 'scaleX(-1)' }} 
                className={`video-container ${classNameForRatio}`}
            >
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="camera-video" 
                    // style={{ transform: 'scaleX(-1)' }} // Moved to parent container
                ></video>
            </div>            <div style={videoStyle} className={`canvas-container ${classNameForRatio}`}>
                <canvas ref={canvasRef} className="captured-image"></canvas>
            </div>
            {countdown !== null && countdown > 0 && !showCanvas && (
                <div className="countdown">{countdown}</div>
            )}
        </div>
    );
}

export default Camera;