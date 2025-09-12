import '../../../styles/Workspace/colors/ColorsContent.css'

import {hslToHex} from './HslToHex'

import GradientColorPicker from './GradientColorPicker';
import {useContext} from 'react';
import HslPicker from './HslPicker'
import AlphaPicker from './AlphaPicker'

import AppContext from '../../../contexts/AppContext';
import ColorHistoryBar from './ColorHistoryBar';
import type {HistoryColor} from '../../../types/types';

function ColorsContent() {
    const context = useContext(AppContext);
    const { hsl, setHsl } = context.colors.chosenColor.hslData;
    const { alpha, setAlpha } = context.colors.chosenColor.alphaData;
    const { historyColor, setHistoryColor } = context.colors.history;

    // const historyListRef = useRef<HTMLDivElement>(null);
    // const [maxVisible, setMaxVisible] = useState(15);
    //
    // useEffect(() => {
    //     if (!historyListRef.current) return;
    //     const update = () => {
    //         const width = historyListRef.current!.offsetWidth;
    //         const count = Math.max(1, Math.floor(width / 40)); // 32px + 8px gap
    //         setMaxVisible(Math.min(15, count));
    //     };
    //     update();
    //     window.addEventListener('resize', update);
    //     return () => window.removeEventListener('resize', update);
    // }, []);

    // 색상 히스토리 클릭 시 선택 처리
    const handleSelectColor = (color: HistoryColor) => {
        setHsl(color.hslData.hsl);
        setAlpha(color.alphaData.alpha);
        // 중복 제거 후 맨 앞으로 이동
        if (setHistoryColor) {
            setHistoryColor((prev) => {
                const filtered = prev.filter(c =>
                    !(c.hslData.hsl.h === color.hslData.hsl.h &&
                      c.hslData.hsl.s === color.hslData.hsl.s &&
                      c.hslData.hsl.l === color.hslData.hsl.l &&
                      c.alphaData.alpha === color.alphaData.alpha)
                );
                return [...filtered, color];
            });
        }
    };

    return (
        <div className='colors-panel-container'>
            <div className='colors-section'>
                <div className='colors-section-header'>색상</div>
                <div className='color-pickers-group'>
                    <GradientColorPicker />
                    <HslPicker />
                    <AlphaPicker />
                </div>
            </div>
            <div className='usage-history-section'>
                <div className='color-history-wrapper'>
                    <div className='usage-history-header'>사용기록</div>
                    <div className='current-hex-alpha-display'>
                        <span>{hslToHex(hsl.h, hsl.s, hsl.l)}</span>
                        <span>{alpha}</span>
                    </div>
                </div>
                <ColorHistoryBar historyColor={historyColor} onSelectColor={handleSelectColor} />
            </div>
        </div>
    );
}

export default ColorsContent;