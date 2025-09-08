import { useContext } from 'react';
import '../../../styles/PhotoShoot/FrameComposer/ImageGrid.css';
import { useOrientation } from '../../../hooks/useOrientation';
import PhotoCaptureContext from '../../../contexts/PhotoCaptureContextType';
import type { CaptureImageData } from '../../../types/types';

const ImageGrid = () => {
    const orientation = useOrientation();
    const { CaptureImgData, FrameData } = useContext(PhotoCaptureContext);
    const { captureImageData } = CaptureImgData;
    const { imgPlaceData, updateSlotImage } = FrameData;

    const handleImageClick = (clickedImage: CaptureImageData) => {
        // 1. 클릭된 이미지가 이미 슬롯에 있는지 확인 (취소/제거 로직)
        const existingSlotIndex = imgPlaceData.findIndex(slot => slot.imgSrc === clickedImage.base64Img);

        if (existingSlotIndex !== -1) {
            // 이미 슬롯에 있는 이미지이므로 제거
            updateSlotImage(existingSlotIndex, null);
            return; // 제거 후 함수 종료
        }

        // 2. 이미지가 슬롯에 없다면, 비율이 맞고 비어있는 첫 번째 슬롯을 찾습니다. (추가 로직)
        const targetSlotIndex = imgPlaceData.findIndex(slot => 
            slot.ratio === clickedImage.ratio && slot.imgSrc === null
        );

        if (targetSlotIndex !== -1) {
            // 적합한 슬롯을 찾으면 이미지 업데이트
            updateSlotImage(targetSlotIndex, clickedImage.base64Img);
        } else {
            // 적합한 슬롯을 찾지 못하면 알림
            alert('비율이 맞는 빈 슬롯이 없습니다.');
        }
    };

    return (
        <div className={`image-grid-container ${orientation}`}>
            {captureImageData.map((image, index) => (
                <div key={index} className="image-item" onClick={() => handleImageClick(image)}>
                    <img src={image.base64Img} alt={`captured image ${index + 1}`} />
                </div>
            ))}
        </div>
    );
};

export default ImageGrid;