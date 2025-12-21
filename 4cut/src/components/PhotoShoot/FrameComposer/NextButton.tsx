import { useContext, useMemo } from 'react';
import PhotoCaptureContext from '../../../contexts/PhotoCaptureContextType';
import '../../../styles/PhotoShoot/FrameComposer/NextButton.css';

const NextButton = () => {
    const { Mode, FrameData, CaptureImgData } = useContext(PhotoCaptureContext);
    const { setmode } = Mode;
    const { imgPlaceData, setimageData } = FrameData.ImgPlaceData;
    const { captureImageData } = CaptureImgData;

    // 1. 사진이 다 찼는지 확인
    const isSlotFull = useMemo(() => {
        if (imgPlaceData.length === 0) return false;
        return imgPlaceData.every(slot => slot.imgSrc !== null);
    }, [imgPlaceData]);

    // 2. 선택된 사진들의 GIF가 모두 생성되었는지 확인
    const isGifReady = useMemo(() => {
        if (!isSlotFull) return false;

        const activeSlots = imgPlaceData.filter(slot => slot.imgSrc !== null);
        return activeSlots.every(slot => {
            const originalData = captureImageData.find(img => img.base64Img === slot.imgSrc);
            // GIF Blob이 생성되어 있어야 준비 완료
            return originalData && originalData.gifBlob;
        });
    }, [isSlotFull, imgPlaceData, captureImageData]);

    // 버튼 활성화 여부 (다 찼고 + GIF도 준비되어야 함)
    const isButtonDisabled = !isSlotFull || !isGifReady;

    const handleClick = () => {
        if (!isButtonDisabled) {
            // [중요] 이동 전 최신 GIF 데이터 동기화
            // (사용자가 선택했을 땐 없었지만, 그 사이 생성된 Blob을 합쳐서 넘김)
            const syncedData = imgPlaceData.map(slot => {
                if (!slot.imgSrc) return slot;
                const originalData = captureImageData.find(img => img.base64Img === slot.imgSrc);
                return {
                    ...slot,
                    gifBlob: originalData?.gifBlob || null
                };
            });
            
            setimageData(syncedData);
            setmode('generator');
        }
    };

    return (
        <button 
            className='nextButton' 
            onClick={handleClick} 
            disabled={isButtonDisabled}
        >
            {isSlotFull && !isGifReady ? "GIF 생성 중..." : "만들기"}
        </button>
    );
};

export default NextButton;
