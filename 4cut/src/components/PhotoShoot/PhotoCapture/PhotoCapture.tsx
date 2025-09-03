
import "../../../styles/PhotoShoot/PhotoCapture/PhotoCapture.css";
import ImageGrid from './ImageGrid.tsx';

function PhotoCapture() {
    const baseRatios = ['16/9', '3/4', '4/3', '4/3'];
    const duplicatedRatios = baseRatios.flatMap(ratio => [ratio, ratio]);

    return (
        <div className="photo-capture-layout">
            <div className="photo-capture-child-1">
                <span>4/3</span>
            </div>
            <div className="photo-capture-child-2"></div>
            <div className="photo-capture-child-3">
                <ImageGrid ratios={duplicatedRatios} />
            </div>
        </div>
    );
}

export default PhotoCapture;