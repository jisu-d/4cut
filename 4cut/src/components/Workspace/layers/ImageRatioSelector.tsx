import React, { useState, useContext } from 'react';
import '../../../styles/Workspace/layers/ImageRatioSelector.css';
import type { AspectRatio, ListCutImage, ListItem } from '../../../types/types'
import AspectRatioButton from './AspectRatioButton'

import AppContext from '../../../contexts/AppContext';


const ImageRatioSelector = () => {
    const context = useContext(AppContext);
    
    if (!context.layer) {
        return <div>레이어 데이터를 불러오는 중...</div>;
    }

    const { cutImageData, setCutImageData } = context.layer.cutImageData;

    return (
        <div className="image-ratio-selector-section">
            <div>컷 이미지 설정</div>
            <div className="aspect-ratio-buttons-container">
                {cutImageData.map((ratio, i) => (
                    <AspectRatioButton
                        key={i}
                        initialRatio={ratio.AspectRatio}
                        isActive={ratio.checked} />
                ))}
            </div>
        </div>
    );
}

export default ImageRatioSelector;