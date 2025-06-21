import React, { useState } from 'react';
import '../../../styles/Workspace/brushes/BrushesContent.css';
import BrushCategoryButton from './BrushCategoryButton';
import BrushItem from './BrushItem';

const BrushesContent = () => {
    const [selectedCategory, setSelectedCategory] = useState('최근 사용');
    const [selectedBrush, setSelectedBrush] = useState('기본');

    const categories = ['최근 사용', '스케치', '잉크', '그리기'];

    const brushes: { [key: string]: { id: string, name: string }[] } = {
        '최근 사용': [
            { id: 'basic', name: '기본' },
            { id: 'thick-pencil', name: '두꺼운 연필' },
            { id: 'ink', name: '먹' },
            // 이거 화면 넘어가면 스크롤을 가능하게 
            // 되야 하는데 어케 하는지 모르겠음 ㅅㅂ 안됨...
            //{ id: 'ink1', name: '먹1' },
            //{ id: 'ink2', name: '먹2' },
            //{ id: 'ink3', name: '먹3' },
            //{ id: 'ink4', name: '먹4' },
            //{ id: 'ink5', name: '먹5' },
            //{ id: 'ink6', name: '먹6' },
            //{ id: 'ink7', name: '먹7' },
            //{ id: 'ink8', name: '먹8' },
            //{ id: 'ink9', name: '먹9' },
            //{ id: 'ink10', name: '먹10' },
            //{ id: 'ink11', name: '먹11' },
            //{ id: 'ink12', name: '먹12' },
        ],
        '스케치': [
            { id: 'thick-pencil', name: '두꺼운 연필' },
        ],
        '잉크': [
            { id: 'ink', name: '먹' },
        ],
        '그리기': [
            { id: 'basic', name: '기본' },
        ],
    };

    const handleSelectBrush = (brushName: string) => {
        setSelectedBrush(brushName);
    }

    const visibleBrushes = brushes[selectedCategory] || [];

    return (
        <div className="brushes-container">
             <svg style={{ display: 'none' }}>
                <filter id="noise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
                </filter>
                <filter id="ink-displace">
                    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" result="turbulence"/>
                    <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="10" xChannelSelector="R" yChannelSelector="G"/>
                </filter>
            </svg>
            <div className="brushes-title">브러시</div>
            <div className="brushes-content-wrapper">
                <div className="brush-categories">
                    {categories.map(category => (
                        <BrushCategoryButton
                            key={category}
                            category={category}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                        />
                    ))}
                </div>
                <div className="brush-list-container">
                    {visibleBrushes.map((brush) => (
                        <BrushItem
                            key={brush.id + brush.name}
                            brush={brush}
                            selected={selectedBrush === brush.name}
                            onClick={() => handleSelectBrush(brush.name)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BrushesContent;
