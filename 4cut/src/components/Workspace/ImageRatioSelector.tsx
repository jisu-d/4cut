import React, { useState } from 'react';
import '../../styles/Workspace/ImageRatioSelector.css';

import type {AspectRatio} from '../../types/types'

import AspectRatioButton from './AspectRatioButton'

import addIcon from '../../assets/Icon/add.svg'

function ImageRatioSelector() {

    const availableRatios: AspectRatio[] = ['4:3', '3:4', '3:4', '3:4'];

    return (    
        <div className="image-ratio-selector-section">
            <div>컷 이미지 설정</div>
            <div className="aspect-ratio-buttons-container">
                {availableRatios.map((ratio, i) => (
                    <AspectRatioButton
                        key={i} 
                        initialRatio={ratio}
                        isActive={false} 
                    />
                ))}
            </div>
            <div>
                <div>레이어 변경</div>
                <img src="" alt="" />
            </div>
            
        </div>
    );
}

export default ImageRatioSelector;