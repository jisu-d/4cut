import React, { useState } from 'react';
import '../../styles/Workspace/AspectRatioButton.css';

import type {AspectRatio} from '../../types/types'


interface AspectRatioButtonProps {
    initialRatio: AspectRatio; 
    isActive: boolean // 선택 되어 있는지 유무
}

const AspectRatioButton: React.FC<AspectRatioButtonProps> = ({ initialRatio, isActive }) => {
    const [currentRatio, setCurrentRatio] = useState<AspectRatio>(initialRatio);
    
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

    const goToNextRatio = () => {
        let nextRatio: AspectRatio;
        switch (currentRatio) {
            case '4:3':
                nextRatio = '3:4';
                break;
            case '3:4':
                nextRatio = '1:1';
                break;
            case '1:1':
                nextRatio = '16:9';
                break;
            case '16:9':
                nextRatio = '4:3';
                break;
            default:
                nextRatio = '4:3';
        }
        setCurrentRatio(nextRatio);
    };

    return (
        <div
            onClick={goToNextRatio}
            className={`aspect-ratio-button ${getRatioClassName(currentRatio)} ${isActive ? 'active' : ''}`}
        >
            {currentRatio}
        </div>
    );
};

export default AspectRatioButton