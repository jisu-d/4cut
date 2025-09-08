import React from 'react';
import '../../../styles/PhotoShoot/FrameComposer/FrameComposer.css';
import ImageComposer  from './ImageComposer.tsx';
import ImageGrid from "./ImageGrid.tsx";

const FrameComposer = () => {
    return (
        <div className="frame-composer-container">
            <ImageComposer />
            <ImageGrid  />
        </div>
    );
};

export default FrameComposer;