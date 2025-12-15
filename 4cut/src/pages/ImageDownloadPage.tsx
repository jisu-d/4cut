import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/ImageDownloadPage/ImageDownloadPage.css';

const ImageDownloadPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [imageUrl, setImageUrl] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    const data1 = searchParams.get('data1');
    const data2 = searchParams.get('data2');

    const checkImage = (url: string): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    };

    useEffect(() => {
        if (data1 && data2) {
            setIsInitialLoading(true);
            // TODO png인지 jpg인지 파악하기
            const url = `https://i.ibb.co/${data1}/${data2}.png`;
            // Check validity before showing
            checkImage(url).then((isValid) => {
                if (isValid) {
                    setImageUrl(url);
                } else {
                    setErrorMessage('잘못되었습니다');
                    setImageUrl('');
                }
                setIsInitialLoading(false);
            });
        } else {
            setIsInitialLoading(false);
        }
    }, [data1, data2]);

    const downloadImage = () => {
        if (!imageUrl || isDownloading) return;

        setIsDownloading(true);
        fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'image.jpg';
                document.body.appendChild(a);
                a.click();
                
                // Cleanup
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            })
            .catch(error => console.error('이미지 다운로드 실패', error))
            .finally(() => setIsDownloading(false));
    };

    if (isInitialLoading) {
        return (
            <div className="container loading-container">
                <div className="spinner"></div>
                <p className="loading-text">이미지를 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="container">
            {errorMessage ? (
                <p className="error-message">{errorMessage}</p>
            ) : imageUrl ? (
                <>
                    <div className="image-wrapper">
                        <img src={imageUrl} alt="이미지" className="image" />
                    </div>
                    <button 
                        type="button" 
                        onClick={downloadImage} 
                        className="download-button"
                        disabled={isDownloading}
                        style={{ opacity: isDownloading ? 0.8 : 1, cursor: isDownloading ? 'not-allowed' : 'pointer' }}
                    >
                        {isDownloading ? '다운로드 중...' : '이미지 다운로드'}
                    </button>
                </>
            ) : null}
        </div>
    );
};

export default ImageDownloadPage;
