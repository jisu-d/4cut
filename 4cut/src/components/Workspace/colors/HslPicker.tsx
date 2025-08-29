import {type ChangeEvent, useContext, useRef} from 'react';
import '../../../styles/Workspace/colors/HslPicker.css'; // 새로 생성한 CSS 파일 임포트
import AppContext from '../../../contexts/AppContext';

const HslPicker = () => {
  // const [hue, setHue] = useState<number>(0); // 0-360 범위의 색조
  const rangeRef = useRef<HTMLInputElement>(null);

  const context = useContext(AppContext);
  if (!context.colors) return null;
  const { hsl, setHsl } = context.colors.chosenColor.hslData;
  const addHistoryColor = context.colors.history.addHistoryColor;

  const handleHueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHsl({...hsl, h: Number(event.target.value)})
  };

  return (
    <div className="color-picker-container" style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '20px auto' }}>
      <input
        type="range"
        min="0"
        max="360"
        value={hsl.h}
        onChange={handleHueChange}
        className="color-picker-range" // CSS 파일에서 이 클래스를 사용합니다
        ref={rangeRef}
        onMouseUp={() => { if (addHistoryColor) addHistoryColor(); }}
        onTouchEnd={() => { if (addHistoryColor) addHistoryColor(); }}
      />
    </div>
  );
};

export default HslPicker;