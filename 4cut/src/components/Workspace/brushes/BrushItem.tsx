import React from 'react';
import '../../../styles/Workspace/brushes/BrushItem.css';

const BrushItem = ({ brush, selected, onClick }: { brush: any, selected: boolean, onClick: () => void }) => {
    const getPreviewStyle = (type: string): React.CSSProperties => {
        if (type === '기본') {
            return { backgroundColor: '#4A4A4A', borderRadius: '999px', height: '18px', width: '90%' };
        }
        if (type === '두꺼운 연필') {
            return {
                height: '24px',
                width: '90%',
                backgroundColor: '#333',
                backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent)',
                backgroundSize: '20px 20px',
                filter: 'url(#noise)',
                borderRadius: '2px',
            };
        }
        if (type === '먹') {
             return {
                height: '28px',
                width: '90%',
                backgroundColor: 'black',
                filter: 'url(#ink-displace)',
             };
        }
        return {};
    };

    return (
        <div className={`brush-item ${selected ? 'selected' : ''}`} onClick={onClick}>
            <div className="brush-item-name">{brush.name}</div>
            <div className="brush-preview-container">
                <div style={getPreviewStyle(brush.name)}></div>
            </div>
        </div>
    );
};

export default BrushItem; 