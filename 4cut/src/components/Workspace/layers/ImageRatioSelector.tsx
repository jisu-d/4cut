import {useContext} from 'react';
import '../../../styles/Workspace/layers/ImageRatioSelector.css';
import type {AspectRatio, UserLayerDataType} from '../../../types/types'
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

// 비율에 따라 height 계산 함수
function getSizeByRatio(ratio: string, width: number): { width: number, height: number } {
    switch (ratio) {
        case '4:3': return { width, height: width * 3 / 4 };
        case '3:4': return { width, height: width * 4 / 3 };
        case '1:1': return { width, height: width };
        case '16:9': return { width, height: width * 9 / 16 };
        default: return { width, height: width };
    }
}

const ImageRatioSelector = () => {
    const context = useContext(AppContext);
    if (!context.layer) {
        return <div>레이어 데이터를 불러오는 중...</div>;
    }
    const { cutImageData, setCutImageData } = context.layer.cutImageData;
    const userLayerDataType = context.layer.userLayerDataType.userLayerDataType;

    const handleClick = (idx: number) => {
        const CutSelected = userLayerDataType.filter((item) => item.LayerType == "Cut")[0]
        if (!CutSelected.selected) return


        setCutImageData(prev => prev.map((item, i) => {
            if (i === idx) {
                const newRatio = nextRatio(item.AspectRatio);
                const width = item.size?.width ?? 200;
                const { height } = getSizeByRatio(newRatio, width);
                return {
                    ...item,
                    AspectRatio: newRatio,
                    size: { width, height },
                    checked: true
                };
            }
            return { ...item, checked: false };
        }));
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