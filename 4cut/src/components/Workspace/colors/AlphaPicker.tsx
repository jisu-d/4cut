import {type ChangeEvent, useContext, useEffect, useRef} from 'react';
import '../../../styles/Workspace/colors/AlphaPicker.css'; // 알파 슬라이더를 위한 CSS 파일 (다음 단계에서 생성)
import AppContext from '../../../contexts/AppContext';
import type {HSL} from '../../../types/types';


// HSL 객체를 hsl 문자열로 변환
const hslToString = (hsl: HSL) => `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

const AlphaPicker= () => {
    const context = useContext(AppContext);
    if (!context.colors) return null;
    const { alpha, setAlpha } = context.colors.chosenColor.alphaData;
    const { hsl } = context.colors.chosenColor.hslData;
    const addHistoryColor = context.colors.history.addHistoryColor;
    const rangeRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (rangeRef.current) {
            rangeRef.current.style.setProperty('--alpha-thumb-position', `${Math.round(alpha * 100)}%`);
        }
    }, [alpha]);

    const handleAlphaChange = (event: ChangeEvent<HTMLInputElement>) => {
        setAlpha(Number(event.target.value) / 100);
    };

    const hslString = hslToString(hsl);

    return (
        <div className="alpha-picker-container" style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '20px auto' }}>
            <div className="alpha-track-background">
                <div
                    className="alpha-gradient-overlay"
                    style={{
                        background: `linear-gradient(to right, rgba(255,255,255,0), ${hslString})`,
                        pointerEvents: 'none'
                    }}
                ></div>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={Math.round(alpha * 100)}
                onChange={handleAlphaChange}
                className="alpha-picker-range"
                ref={rangeRef}
                onMouseUp={() => { if (addHistoryColor) addHistoryColor(); }}
                onTouchEnd={() => { if (addHistoryColor) addHistoryColor(); }}
            />
        </div>
    );
};

export default AlphaPicker;