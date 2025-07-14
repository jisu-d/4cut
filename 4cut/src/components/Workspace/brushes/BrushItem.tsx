import React from 'react';
import '../../../styles/Workspace/brushes/BrushItem.css';
import {brushType} from "../../../assets/brush/brushType.ts";

const BrushItem = ({ brush, selected, onClick }: { brush: {id:string; name:string}, selected: boolean, onClick: () => void }) => {
    const found = brushType.find(b => b.brushType === brush.id);

    return (
        <div className={`brush-item ${selected ? 'selected' : ''}`} onClick={onClick}>
            <div className="brush-item-name">{brush.name}</div>
            <div className="brush-preview-container">
                <img src={found?.brushPath} style={{
                    width: '20px'
                }} alt="" />
            </div>
        </div>
    );
};

export default BrushItem; 