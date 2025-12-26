import { useEffect, useState } from 'react';
import '../../../styles/PhotoShoot/ImageGenerator/ImageGenerator.css'

interface QrResultProps {
    qrUrl: string;
    onReset: () => void;
    onHome: () => void;
}

export const QrResult = ({ qrUrl, onReset, onHome }: QrResultProps) => {
    const [timeLeft, setTimeLeft] = useState(60); // 30초 카운트다운

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onHome();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onHome]);

    return (
        <div className='qr-result-container'>
            <div className='qr-title'>QR 이미지 다운로드</div>
            <div className='qr-image-wrapper'>
                <img src={qrUrl} alt='QR Code' />
            </div>
            <div className='qr-description'>
                모바일로 사진을 다운로드하세요<br />
                <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                    {timeLeft}초 후 홈으로 이동합니다
                </span>
            </div>
            <div className='qr-btn-wrapper'>
                <button className='reset-btn' onClick={onReset}>처음으로</button>
                <button className='reset-btn' onClick={onHome}>홈으로</button>
            </div>
        </div>
    );
};
