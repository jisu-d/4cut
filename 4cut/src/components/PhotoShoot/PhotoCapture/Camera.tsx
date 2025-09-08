import {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import '../../../styles/PhotoShoot/PhotoCapture/Camera.css';

import { useOrientation } from '../../../hooks/useOrientation.ts';

interface CameraProps {
    ratio: string;
    photoIndex: number;
    onCapture: (base64Img: string, capturedIndex: number) => void;
    onComplete: () => void;
}

function Camera({ ratio, photoIndex, onCapture, onComplete }: CameraProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timeoutRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);

    const [countdown, setCountdown] = useState<number | null>(null);
    const [showCanvas, setShowCanvas] = useState(false);
    const [isStreamReady, setIsStreamReady] = useState(false);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const [width, height] = ratio.split(':').map(Number);

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
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

        canvas.width = sWidth;
        canvas.height = sHeight;

        const context = canvas.getContext('2d');
        if (context) {
            context.translate(sWidth, 0);
            context.scale(-1, 1);
            context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
            const base64Img = canvas.toDataURL('image/jpeg');
            onCapture(base64Img, photoIndex);
            setShowCanvas(true);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = window.setTimeout(() => {
                setShowCanvas(false);
                onComplete();
            }, 2000);
        }
    }, [ratio, photoIndex, onCapture, onComplete]);

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
        };
    }, []);

    // Effect 2: Countdown Timer
    useEffect(() => {
        if (!isStreamReady) return;

        setCountdown(6);

        intervalRef.current = window.setInterval(() => {
            setCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isStreamReady]);

    // Effect 3: Photo Capture Trigger
    useEffect(() => {
        if (countdown === 0) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
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
        // 1. '4:3' 같은 문자열 비율을 숫자 값으로 변환합니다. (예: 4/3 = 1.33)
        const [width, height] = ratio.split(':').map(Number);
        const numericRatio = width / height;

        // 2. 사진 비율이 가로로 넓은 경우 (numericRatio > 1, 예: 4:3, 16:9)
        if (numericRatio > 1) {
            // 화면이 세로(portrait)이면 너비(w)에 맞추고,
            // 화면이 가로(landscape)이면 높이(h)에 맞춥니다.
            return orientation === 'portrait' ? 'fit-to-width' : 'fit-to-height';
        }

        // 3. 사진 비율이 세로로 길거나 정사각형인 경우 (numericRatio <= 1, 예: 3:4, 1:1)
        // 어떤 화면 방향이든 항상 높이(h)를 기준으로 맞춥니다.
        return 'fit-to-height';

    }, [ratio, orientation]);

    return (
        <div className={`camera-container ${showCanvas ? 'canvas-visible' : ''}`}>
            <div style={videoStyle} className={`video-container ${classNameForRatio}`}>
                <video ref={videoRef} autoPlay playsInline className="camera-video" style={{ transform: 'scaleX(-1)' }}></video>
            </div>
            <div className='canvas-container'>
                <canvas ref={canvasRef} className="captured-image"></canvas>
            </div>
            {countdown !== null && countdown > 0 && !showCanvas && (
                <div className="countdown">{countdown}</div>
            )}
        </div>
    );
}

export default Camera;