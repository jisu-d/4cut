import React, {useContext, useEffect, useRef, useState} from 'react';
import AppContext from '../../../contexts/AppContext';
import '../../../styles/Workspace/colors/GradientColorPicker.css';


const GradientColorPicker: React.FC = () => {
  const context = useContext(AppContext);
  if (!context.colors) return null;
  const { hsl, setHsl } = context.colors.chosenColor.hslData;
  const addHistoryColor = context.colors.history.addHistoryColor;
  if (!addHistoryColor) return null;
  const boxRef = useRef<HTMLDivElement>(null);
  const [markerPos, setMarkerPos] = useState<{x: number, y: number}>({
    x: hsl.s / 100,
    y: 1 - (hsl.l / (100 - 50 * (hsl.s / 100)))
  });

  // HSL 값이 변경될 때 마커 위치 업데이트
  useEffect(() => {
    const x = hsl.s / 100;
    const y = 1 - (hsl.l / (100 - 50 * x));
    setMarkerPos({ x, y });
  }, [hsl]);

  // 마우스 클릭/드래그 시 s/l만 변경, h는 그대로
  const handleChange = (nx: number, ny: number) => {
    const x = Math.max(0, Math.min(1, nx));
    const y = Math.max(0, Math.min(1, ny));
    setMarkerPos({ x, y });
    const s = Math.round(x * 100);
    const l = Math.round((1 - y) * (100 - 50 * x));
    setHsl({ ...hsl, s, l });
  };

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = boxRef.current!.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    handleChange(nx, ny);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    handleChange(nx, ny);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    handleMouse(e);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    addHistoryColor();
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const nx = (e.touches[0].clientX - rect.left) / rect.width;
    const ny = (e.touches[0].clientY - rect.top) / rect.height;
    handleChange(nx, ny);
  };

  const handleTouchUp = () => {
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchUp);
    addHistoryColor();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const nx = (e.touches[0].clientX - rect.left) / rect.width;
    const ny = (e.touches[0].clientY - rect.top) / rect.height;
    handleChange(nx, ny);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchUp);
  };

  // 마커 위치: 항상 마지막 마우스 위치로 계산
  const x = markerPos.x;
  const y = markerPos.y;

  // 현재 마우스 위치에 따른 s/l 계산 (마커 위치와 동일)
  const markerS = hsl.s;
  const markerL = hsl.l;
  // 현재 hsl.h(색상)는 고정, s/l만 변경
  function hslToRgb(h: number, s: number, l: number) {
    s /= 100; l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }
  // 오른쪽 끝 색상: 현재 hsl.h, s=100, l=50
  const rightColor = hslToRgb(hsl.h, 100, 50);
  const rightColorStr = `rgb(${rightColor.r}, ${rightColor.g}, ${rightColor.b})`;
  // 마커 색상: 현재 hsl.h, markerS, markerL
  const markerColor = hslToRgb(hsl.h, markerS, markerL);
  const markerColorStr = `rgb(${markerColor.r}, ${markerColor.g}, ${markerColor.b})`;

  return (
    <div
      ref={boxRef}
      className="gradient-picker-box"
      style={{
        height: 200,
        borderRadius: '10px',
        background: `
          linear-gradient(to top, black, transparent),
          linear-gradient(to right, rgb(255, 255, 255), ${rightColorStr})
        `,
        position: 'relative',
        cursor: 'crosshair',
        boxShadow: '0 2px 12px #0002',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        style={{
          position: 'absolute',
          left: `calc(${x * 100}% - 16px)`,
          top: `calc(${y * 100}% - 16px)`,
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: `3px solid ${markerColorStr}`,
          boxSizing: 'border-box',
          pointerEvents: 'none',
          boxShadow: '0 0 0 2px #0006',
        }}
      />
    </div>
  );
};

export default GradientColorPicker;