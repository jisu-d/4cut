import React, { useContext, useState, useEffect, useRef } from 'react';
import '../../../styles/Workspace/DrawingCanvas/CanvasToolBar.css';
import AppContext from '../../../contexts/AppContext';

import type {UserLayerDataType} from '../../../types/types'

interface CanvasToolBarProps {
  activeTool: "pen" | "select" | "eraser";
  onToolChange: React.Dispatch<React.SetStateAction<"pen" | "select" | "eraser">>;
}

const CanvasToolBar: React.FC<CanvasToolBarProps> = ({ 
  activeTool, 
  onToolChange, 
}) => {
  const appContext = useContext(AppContext);
  const contextUserLayerDataType = appContext?.layer?.userLayerDataType.userLayerDataType;
  const { brushData, setBrushData } = appContext?.brush;
  
  // 애니메이션 상태
  const [showSlider, setShowSlider] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  // 마지막으로 선택된 도구 상태 (슬라이더가 닫힐 때 유지)
  const [lastActiveTool, setLastActiveTool] = useState<"pen" | "eraser">("pen");
  
  // 슬라이더 부드럽게 만들기 위한 로컬 상태
  const [localPenSize, setLocalPenSize] = useState(brushData.brushSize);
  const [localEraserSize, setLocalEraserSize] = useState(brushData.eraserSize);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 현재 선택된 레이어가 Cut 타입인지 확인
  const selectedLayer = contextUserLayerDataType?.find((layer: UserLayerDataType) => layer.active);
  const isCutLayerSelected = selectedLayer?.LayerType === 'Cut' || selectedLayer?.LayerType === 'Img';

  useEffect(() => {
    if (isCutLayerSelected) {
      onToolChange("select");
    }
  }, [isCutLayerSelected, onToolChange]);

  // brushData 변경 시 로컬 상태 동기화
  useEffect(() => {
    setLocalPenSize(brushData.brushSize);
    setLocalEraserSize(brushData.eraserSize);
  }, [brushData.brushSize, brushData.eraserSize]);

  // 슬라이더 표시/숨김 애니메이션 처리
  useEffect(() => {
    if (activeTool === "pen" || activeTool === "eraser") {
      setShowSlider(true);
      setIsRemoving(false);
      setLastActiveTool(activeTool);
    } else {
      setIsRemoving(true);
      const timer = setTimeout(() => {
        setShowSlider(false);
      }, 300); // slideOut 애니메이션 시간과 동일
      return () => clearTimeout(timer);
    }
  }, [activeTool]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectTool = () => {
    if(!isCutLayerSelected){
      onToolChange('select');
    }
  };

  const handlePenTool = () => {
    if(!isCutLayerSelected){
      onToolChange('pen');
    }
  };

  const handleEraserTool = () => {
    if(!isCutLayerSelected){
      onToolChange('eraser');
    }
  };

  const handleSizeChange = (value: number) => {
    if (lastActiveTool === "pen") {
      setLocalPenSize(value);
      // 디바운스로 전역 상태 업데이트
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        setBrushData(prev => ({ ...prev, brushSize: value }));
      }, 100);
    } else if (lastActiveTool === "eraser") {
      setLocalEraserSize(value);
      // 디바운스로 전역 상태 업데이트
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        setBrushData(prev => ({ ...prev, eraserSize: value }));
      }, 100);
    }
  };

  return (
    <div className="canvas-tool-bar">
      <div className="tool-buttons">
        <button
          onClick={handleSelectTool}
          onTouchStart={handleSelectTool}
          className={activeTool === "select" ? "active" : ""}
          title="선택 도구"
        >
          {/* 선택 아이콘 */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.833 0.891602V7.49993H16.6663C16.6663 4.09993 14.1247 1.29993 10.833 0.891602ZM3.33301 12.4999C3.33301 16.1833 6.31634 19.1666 9.99967 19.1666C13.683 19.1666 16.6663 16.1833 16.6663 12.4999V9.1666H3.33301V12.4999ZM9.16634 0.891602C5.87467 1.29993 3.33301 4.09993 3.33301 7.49993H9.16634V0.891602Z" fill="inherit" />
          </svg>
        </button>
        
        <button
          onClick={handlePenTool}
          onTouchStart={handlePenTool}
          className={activeTool === "pen" ? "active" : ""}
          disabled={isCutLayerSelected}
          title={isCutLayerSelected ? "Cut 레이어에서는 펜 도구를 사용할 수 없습니다" : "펜 도구"}
        >
          {/* 펜 아이콘 */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.5 14.3751V17.5001H5.625L14.8417 8.28342L11.7167 5.15842L2.5 14.3751ZM17.2583 5.86675C17.3356 5.78966 17.3969 5.69808 17.4387 5.59727C17.4805 5.49646 17.502 5.38839 17.502 5.27925C17.502 5.17011 17.4805 5.06204 17.4387 4.96123C17.3969 4.86042 17.3356 4.76885 17.2583 4.69175L15.3083 2.74175C15.2312 2.6645 15.1397 2.60321 15.0389 2.56139C14.938 2.51957 14.83 2.49805 14.7208 2.49805C14.6117 2.49805 14.5036 2.51957 14.4028 2.56139C14.302 2.60321 14.2104 2.6645 14.1333 2.74175L12.6083 4.26675L15.7333 7.39175L17.2583 5.86675Z" fill="inherit" />
          </svg>
        </button>
        
        <button
          onClick={handleEraserTool}
          onTouchStart={handleEraserTool}
          className={activeTool === "eraser" ? "active" : ""}
          disabled={isCutLayerSelected}
          title={isCutLayerSelected ? "Cut 레이어에서는 지우개 도구를 사용할 수 없습니다" : "지우개 도구"}
        >
          {/* 지우개 아이콘 */}
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="7" width="20" height="10" rx="2" transform="rotate(-45 10 12)" fill="none" stroke="inherit"/>
            <line x1="12" y1="16" x2="5" y2="9" stroke="inherit"/>
          </svg>
        </button>
      </div>
      
      {/* 크기 슬라이더 - 애니메이션과 함께 표시/숨김 */}
      {showSlider && (
        <div className={`size-slider-container ${isRemoving ? 'removing' : ''}`}>
          <input
            type="range"
            min="1"
            max="20"
            value={lastActiveTool === "pen" ? localPenSize : localEraserSize}
            onChange={(e) => handleSizeChange(Number(e.target.value))}
            className="vertical-slider"
          />
          <span className="size-value">
            {lastActiveTool === "pen" ? localPenSize : localEraserSize}
          </span>
        </div>
      )}
    </div>
  );
};

export default CanvasToolBar;