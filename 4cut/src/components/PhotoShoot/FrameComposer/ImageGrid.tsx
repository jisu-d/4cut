import {useContext, useMemo} from 'react';
import '../../../styles/PhotoShoot/FrameComposer/ImageGrid.css';
import { useOrientation } from '../../../hooks/useOrientation';
import PhotoCaptureContext from '../../../contexts/PhotoCaptureContextType';
import type { CaptureImageData } from '../../../types/types';

const ImageGrid = () => {
    const orientation = useOrientation();
    const { CaptureImgData, FrameData } = useContext(PhotoCaptureContext);
    const { captureImageData } = CaptureImgData;
    const { imgPlaceData } = FrameData.ImgPlaceData;
    const { updateSlotImage } = FrameData;

    const imageToSlotMap = useMemo(() => {
        const map = new Map<string, number>();
        imgPlaceData.forEach((slot, index) => {
            if (slot.imgSrc) {
                map.set(slot.imgSrc, index);
            }
        });
        return map;
    }, [imgPlaceData]);

    const handleImageClick = (clickedImage: CaptureImageData) => {
        // 1. 클릭된 이미지가 이미 슬롯에 있는지 확인합니다.
        const existingSlotIndex = imgPlaceData.findIndex(slot => slot.imgSrc === clickedImage.base64Img);

        if (existingSlotIndex !== -1) {
            // 이미 슬롯에 있다면, 해당 이미지를 슬롯에서 제거합니다 (imgSrc를 null로 설정).
            updateSlotImage(existingSlotIndex, null, null);
            return;
        }

        // 2. 이미지가 슬롯에 없다면, 비율이 맞는 첫 번째 빈 슬롯을 찾습니다.
        const targetSlotIndex = imgPlaceData.findIndex(slot =>
            slot.ratio === clickedImage.ratio && slot.imgSrc === null
        );

        if (targetSlotIndex !== -1) {
            // 적합한 슬롯을 찾으면, 새 이미지로 업데이트합니다.
            updateSlotImage(targetSlotIndex, clickedImage.base64Img, clickedImage.gifBlob);
        } else {
            console.log('비율이 맞는 빈 슬롯이 없습니다.')
        }
    };

    return (
        <div className={`image-grid-container ${orientation}`}>
            {captureImageData.map((image, index) => {
                const slotIndex = imageToSlotMap.get(image.base64Img);

                return (
                    <div key={index} className="image-item" onClick={() => handleImageClick(image)}>
                        <img src={image.base64Img} alt={`captured image ${index + 1}`} />
                        {typeof slotIndex !== 'undefined' && (
                            <div className="slot-indicator">{slotIndex + 1}</div>
                        )}
                    </div>
                )
            })}
        </div>
    );
};

export default ImageGrid;
