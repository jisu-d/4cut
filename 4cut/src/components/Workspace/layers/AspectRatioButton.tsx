import React from 'react';
import '../../../styles/Workspace/layers/AspectRatioButton.css';

import type {AspectRatio} from '../../../types/types'

interface AspectRatioButtonProps {
    currentRatio: AspectRatio;
    isActive: boolean;
    onClick: () => void;
}

const AspectRatioButton: React.FC<AspectRatioButtonProps> = ({ currentRatio, isActive, onClick }) => {
    const getRatioClassName = (ratio: AspectRatio): string => {
        switch (ratio) {
            case '4:3': 
                return 'ratio-4-3';
            case '3:4': 
                return 'ratio-3-4';
            case '1:1': 
                return 'ratio-1-1';
            case '16:9': 
                return 'ratio-16-9';
            default: 
                return '';
        }
    };

    return (
        <div
            onClick={onClick}
            className={`aspect-ratio-button ${getRatioClassName(currentRatio)} ${isActive ? 'active' : ''}`}
        >
            {currentRatio}
        </div>
    );
};

export default AspectRatioButton;