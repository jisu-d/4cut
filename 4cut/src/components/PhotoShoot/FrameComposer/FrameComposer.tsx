import '../../../styles/PhotoShoot/FrameComposer/FrameComposer.css';
import ImageComposer  from './ImageComposer.tsx';
import ImageGrid from "./ImageGrid.tsx";
import NextButton from "./NextButton.tsx";

const FrameComposer = () => {
    return (
        <div className="frame-composer-container">
            <ImageComposer />
            <div className='selection-panel'>
                <ImageGrid />
                <NextButton />
            </div>
        </div>
    )
}
export default FrameComposer;