import "../../../styles/PhotoShoot/PhotoCapture/PhotoCapture.css";
import type { ImageDataList } from '../../../types/types.ts';
import ImageGrid from './ImageGrid.tsx';
import {useState, useEffect} from "react";
import Camera from './Camera.tsx';

function PhotoCapture() {
    const [imageDataList, setImageDataList] = useState<ImageDataList[]>([]);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // Initial data setup
        const initialData: ImageDataList[] = [
            { id: 0, ratio: '16:9', base64Img: '' },
            { id: 1, ratio: '16:9', base64Img: '' },
            { id: 2, ratio: '3:4', base64Img: '' },
            { id: 3, ratio: '3:4', base64Img: '' },
            { id: 4, ratio: '4:3', base64Img: '' },
            { id: 5, ratio: '4:3', base64Img: '' },
            { id: 6, ratio: '1:1', base64Img: '' },
            { id: 7, ratio: '1:1', base64Img: '' },
        ];
        setImageDataList(initialData);
    }, []);

    const handleCapture = (base64Img: string, capturedIndex: number) => {
        setImageDataList(list =>
            list.map((item, index) =>
                index === capturedIndex
                    ? { ...item, base64Img: base64Img }
                    : item
            )
        );
    };

    const handleComplete = () => {
        if (currentPhotoIndex < imageDataList.length - 1) {
            setCurrentPhotoIndex(prevIndex => prevIndex + 1);
        } else {
            setIsComplete(true);
            // All photos taken, maybe navigate away or show a completion message
            console.log("All photos captured:", imageDataList);
        }
    };

    const currentRatio = imageDataList[currentPhotoIndex]?.ratio;

    return (
        <div className="photo-capture-layout">
            <div className="photo-capture-child-1">
                <span>{`${currentPhotoIndex + 1}/${imageDataList.length}`}</span>
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
                <ImageGrid imageDataList={imageDataList} currentPhotoIndex={currentPhotoIndex} />
            </div>
        </div>
    );
}

export default PhotoCapture;