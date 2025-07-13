import React, {useEffect, useRef, useState} from 'react';
import '../../../styles/Workspace/colors/ColorHistoryBar.css';

interface ColorHistoryBarProps {
  historyColor: {
    hslData: { hsl: { h: number; s: number; l: number } };
    alphaData: { alpha: number };
  }[];
  onSelectColor?: (color: { hslData: { hsl: { h: number; s: number; l: number } }, alphaData: { alpha: number } }) => void;
}

const ColorHistoryBar: React.FC<ColorHistoryBarProps> = ({ historyColor, onSelectColor }) => {
  const historyListRef = useRef<HTMLDivElement>(null);
  const [maxVisible, setMaxVisible] = useState(15);

  useEffect(() => {
    if (!historyListRef.current) return;
    const update = () => {
      const width = historyListRef.current!.offsetWidth - 24; // 양쪽 패딩
      const count = Math.max(1, Math.floor(width / 50)); // 32px + 8px gap
      setMaxVisible(count);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className='color-history-list' ref={historyListRef}>
      {historyColor.slice(-maxVisible).reverse().map((color, index) => (
        <div key={index} className='color-history-item'>
          <div
            className='color-history-item-color'
            style={{ backgroundColor: `hsl(${color.hslData.hsl.h}, ${color.hslData.hsl.s}%, ${color.hslData.hsl.l}%)` }}
            onClick={e => { e.stopPropagation(); onSelectColor && onSelectColor(color); }}
            onTouchEnd={e => { e.stopPropagation(); onSelectColor && onSelectColor(color); }}
            title={`hsl(${color.hslData.hsl.h}, ${color.hslData.hsl.s}%, ${color.hslData.hsl.l}%)`}
          ></div>
        </div>
      ))}
    </div>
  );
};

export default ColorHistoryBar; 