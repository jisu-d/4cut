import {useState, useContext} from 'react';
import '../../../styles/Workspace/brushes/BrushesContent.css';
import BrushCategoryButton from './BrushCategoryButton';
import BrushItem from './BrushItem';

import type {BrushType} from '../../../types/types'

import AppContext from '../../../contexts/AppContext';

import {brushType} from "../../../assets/brush/brushType.ts";

const BrushesContent = () => {
    const appContext = useContext(AppContext);
    const [selectedCategory, setSelectedCategory] = useState('최근 사용');
    //const [selectedBrush, setSelectedBrush] = useState('pen');

    const { brushData, setBrushData} = appContext.brush

    const categories = ['최근 사용', '스케치', '잉크', '그리기'];

    // 이거 화면 넘어가면 스크롤을 가능하게 
    // 되야 하는데 어케 하는지 모르겠음 ㅅㅂ 안됨...
    const brushes: { [key: string]: { id: string, name: string }[] } = {
        '최근 사용': [
            { id: 'pen', name: '기본' },
            { id: 'brush', name: '두꺼운 연필' },
            { id: 'painter', name: '먹' },
            { id: 'Powder', name: '먹' },
        ],
        '스케치': [
            { id: 'brush', name: '두꺼운 연필' },
        ],
        '잉크': [
            { id: 'painter', name: '먹' },
            { id: 'Powder', name: '먹' },
        ],
        '그리기': [
            { id: 'pen', name: '기본' },
        ],
    };

    const handleSelectBrush = (brush: {
        id:string
        name:string
    }) => {
        let found: BrushType = {brushType:'pen', brushPath: ''};
        if(brush.id !== 'pen'){
            found = brushType.find(b => b.brushType === brush.id) as BrushType
        }
        //setSelectedBrush(brush.id);
        setBrushData(prev => ({
            ...prev,
            brushType: brush.id,
            brushPath: found.brushPath,
        }))
    }

    const visibleBrushes = brushes[selectedCategory];

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
                            selected={brushData.brushType === brush.id}
                            onClick={() => handleSelectBrush(brush)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BrushesContent;
