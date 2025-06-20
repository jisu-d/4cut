import React, { useContext } from 'react';
import '../../../styles/Workspace/layers/ImageRatioSelector.css';
import type { AspectRatio } from '../../../types/types'
import AspectRatioButton from './AspectRatioButton'

import AppContext from '../../../contexts/AppContext';

const nextRatio = (ratio: AspectRatio): AspectRatio => {
    switch (ratio) {
        case '4:3': return '3:4';
        case '3:4': return '1:1';
        case '1:1': return '16:9';
        case '16:9': return '4:3';
        default: return '4:3';
    }
};

const ImageRatioSelector = () => {
    const context = useContext(AppContext);
    if (!context.layer) {
        return <div>레이어 데이터를 불러오는 중...</div>;
    }
    const { cutImageData, setCutImageData } = context.layer.cutImageData;

    const handleClick = (idx: number) => {
        setCutImageData(prev => prev.map((item, i) =>
            i === idx
                ? { ...item, AspectRatio: nextRatio(item.AspectRatio) }
                : item
        ));
    };

    return (
        <div className="image-ratio-selector-section">
            <div>컷 이미지 설정</div>
            <div className="aspect-ratio-buttons-container">
                {cutImageData.map((ratio, i) => (
                    <AspectRatioButton
                        key={i}
                        currentRatio={ratio.AspectRatio}
                        isActive={ratio.checked}
                        onClick={() => handleClick(i)}
                    />
                ))}
            </div>
        </div>
    );
}

export default ImageRatioSelector;