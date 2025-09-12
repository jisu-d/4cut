import { useContext, useMemo } from 'react';
import PhotoCaptureContext from '../../../contexts/PhotoCaptureContextType';
import '../../../styles/PhotoShoot/FrameComposer/NextButton.css';

const NextButton = () => {
    const { Mode, FrameData } = useContext(PhotoCaptureContext);
    const { setmode } = Mode;
    const { imgPlaceData } = FrameData.ImgPlaceData;

    const isButtonDisabled = useMemo(() => {
        if (imgPlaceData.length === 0) {
            return true; // 슬롯이 없으면 비활성화
        }
        return imgPlaceData.some(slot => slot.imgSrc === null);
    }, [imgPlaceData]);

    const handleClick = () => {
        if (!isButtonDisabled) {
            setmode('generator');
        }
    };

    return (
        //TODO "만들기" 이 표현이 별로 인것 같음 더 생각해보기
        <button className='nextButton' onClick={handleClick} disabled={isButtonDisabled}>
            만들기
        </button>
    );
};

export default NextButton;
