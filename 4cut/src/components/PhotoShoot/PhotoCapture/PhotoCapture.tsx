import "../../../styles/PhotoShoot/PhotoCapture/PhotoCapture.css";
import ImageGrid from './ImageGrid.tsx';
import {useState, useEffect, useContext} from "react";
import Camera from './Camera.tsx';
import PhotoCaptureContext from "../../../contexts/PhotoCaptureContextType.ts";

function PhotoCapture() {
    const { CaptureImgData, Mode } = useContext(PhotoCaptureContext);
    const { captureImageData, setCaptureImgData } = CaptureImgData;
    const { setmode } = Mode

    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const handleCapture = (base64Img: string | null, capturedIndex: number, gifBlob: Blob | null) => {
        setCaptureImgData(prevList =>
            prevList.map((item, index) =>
                index === capturedIndex
                    ? { 
                        ...item, 
                        base64Img: base64Img !== null ? base64Img : item.base64Img, 
                        gifBlob: gifBlob !== null ? gifBlob : item.gifBlob 
                      }
                    : item
            )
        );
    };

    useEffect(() => {
        if (isComplete) {
            // console.log("All photos captured:", captureImageData);
            setmode('compose')
        }
    }, [isComplete, setmode]);

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
                <span className="photo-count-badge">{`${currentPhotoIndex + 1}/${captureImageData.length}`}</span>
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