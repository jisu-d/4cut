import "../../../styles/PhotoShoot/PhotoCapture/PhotoCapture.css";
import ImageGrid from './ImageGrid.tsx';
import {useState, useEffect, useContext} from "react";
import Camera from './Camera.tsx';
import PhotoCaptureContext from "../../../contexts/PhotoCaptureContextType.ts";

function PhotoCapture() {
    const { CaptureImgData } = useContext(PhotoCaptureContext);
    const { captureImageData, setCaptureImgData } = CaptureImgData;

    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const handleCapture = (base64Img: string, capturedIndex: number) => {
        setCaptureImgData(prevList => // 이전 상태를 명시적으로 prevList 등으로 표현하면 가독성이 좋아집니다.
            prevList.map((item, index) =>
                index === capturedIndex
                    ? { ...item, base64Img: base64Img } // 해당 인덱스의 아이템만 base64Img를 교체
                    : item // 다른 아이템들은 그대로 반환
            )
        );
    };

    useEffect(() => {
        if (isComplete) {
            console.log("All photos captured:", captureImageData);
        }
    }, [isComplete, captureImageData]);

    const handleComplete = () => {
        if (currentPhotoIndex < captureImageData.length - 1) {
            setCurrentPhotoIndex(prevIndex => prevIndex + 1);
        } else {
            setIsComplete(true);
        }
    };

    const currentRatio = captureImageData[currentPhotoIndex]?.ratio;

    return (
        <div className="photo-capture-layout">
            <div className="photo-capture-child-1">
                <span>{`${currentPhotoIndex + 1}/${captureImageData.length}`}</span>
            </div>
            <div className="photo-capture-child-2">
                {!isComplete && currentRatio ? (
                    <Camera
                        key={currentPhotoIndex}
                        photoIndex={currentPhotoIndex}
                        ratio={currentRatio}
                        onCapture={handleCapture}
                        onComplete={handleComplete}
                    />
                ) : (
                    <div className="completion-message">촬영이 완료되었습니다!</div>
                )}
            </div>
            <div className="photo-capture-child-3">
                <ImageGrid imageDataList={captureImageData} currentPhotoIndex={currentPhotoIndex} />
            </div>
        </div>
    );
}

export default PhotoCapture;