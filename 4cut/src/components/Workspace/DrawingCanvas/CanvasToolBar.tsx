import React, { useContext } from 'react';
import '../../../styles/Workspace/DrawingCanvas/CanvasToolBar.css';
import AppContext from '../../../contexts/AppContext';
import { useEffect } from 'react';

import type {UserLayerDataType} from '../../../types/types'

interface CanvasToolBarProps {
  activeTool: "pen" | "select";
  onToolChange: React.Dispatch<React.SetStateAction<"pen" | "select">>;
}

const CanvasToolBar: React.FC<CanvasToolBarProps> = ({ 
  activeTool, 
  onToolChange, 
}) => {
  const appContext = useContext(AppContext);
  const contextUserLayerDataType = appContext?.layer?.userLayerDataType.userLayerDataType;
  
  // 현재 선택된 레이어가 Cut 타입인지 확인
  const selectedLayer = contextUserLayerDataType?.find((layer: UserLayerDataType) => layer.active);
  const isCutLayerSelected = selectedLayer?.LayerType === 'Cut';

  useEffect(() => {
    if (isCutLayerSelected) {
      onToolChange("select");
    }
  }, [isCutLayerSelected]);


  const handleSelectTool = () => {
    onToolChange('select');
  };

  const handlePenTool = () => {
    onToolChange('pen');
  };

  return (
    <div className="canvas-tool-bar">
      <button
        onClick={handleSelectTool}
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
        className={activeTool === "pen" ? "active" : ""}
        disabled={isCutLayerSelected}
        title={isCutLayerSelected ? "Cut 레이어에서는 펜 도구를 사용할 수 없습니다" : "펜 도구"}
      >
        {/* 펜 아이콘 */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2.5 14.3751V17.5001H5.625L14.8417 8.28342L11.7167 5.15842L2.5 14.3751ZM17.2583 5.86675C17.3356 5.78966 17.3969 5.69808 17.4387 5.59727C17.4805 5.49646 17.502 5.38839 17.502 5.27925C17.502 5.17011 17.4805 5.06204 17.4387 4.96123C17.3969 4.86042 17.3356 4.76885 17.2583 4.69175L15.3083 2.74175C15.2312 2.6645 15.1397 2.60321 15.0389 2.56139C14.938 2.51957 14.83 2.49805 14.7208 2.49805C14.6117 2.49805 14.5036 2.51957 14.4028 2.56139C14.302 2.60321 14.2104 2.6645 14.1333 2.74175L12.6083 4.26675L15.7333 7.39175L17.2583 5.86675Z" fill="inherit" />
        </svg>
      </button>
    </div>
  );
};

export default CanvasToolBar; 