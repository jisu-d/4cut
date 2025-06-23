// src/components/Dashboard.js
// import React, { useState } from 'react';
import '../styles/Workspace/Workspace.css';

import Dashboard from '../components/Workspace/Dashboard';
import AppContext from '../contexts/AppContext';
import {useEffect, useMemo, useState} from 'react';
import ExportContent from '../components/Workspace/export/ExportContent';
import DrawingCanvas from '../components/Workspace/DrawingCanvas/DrawingCanvas';

import type {AppContextType, CanvasSize, HSL, ListCutImage, ListItem} from '../types/types'

function Workspace() {
  const [cutImages, setCutImages] = useState<ListCutImage[]>([]);
  const [layers, setLayers] = useState<ListItem[]>([]);
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);

  const [hsl, setHsl] = useState<HSL>({h:0, s:0, l:0})
  const [alpha, setAlpha] = useState<number>(0)
  const [historyColor, setHistoryColor] = useState<{
    hslData: { hsl: HSL },
    alphaData: { alpha: number }
  }[]>([]);

  // 캔버스 크기 상태 추가
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 1652, height: 4920 });
  
  // 캔버스 배경색 상태 추가
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');

  // 마우스 업 등에서 호출: 현재 색상/알파를 historyColor에 추가
  const addHistoryColor = () => {
    setHistoryColor((prev) => {
      const next = [...prev, { hslData: { hsl }, alphaData: { alpha } }];
      if (next.length > 15) {
        return next.slice(next.length - 15);
      }
      return next;
    });
  };

  useEffect(() => { // 임시 데이터
    setCutImages([
      { AspectRatio: '3:4', checked: false },
      { AspectRatio: '3:4', checked: false },
      { AspectRatio: '3:4', checked: false },
      { AspectRatio: '3:4', checked: false },
    ]);

    setLayers([
      { id: '1', text: '뽀짝한그림', checked: true },
      { id: '2', text: '심쿵한 그림', checked: true },
      { id: '3', text: '항목 3', checked: true },
      { id: '4', text: '항목 4', checked: true },
    ]);

    setCanvasSize({
      width: 1652,
      height: 4920
    });

    setBackgroundColor('#4F46E5');
  }, []);

  const appProvidedValue: AppContextType = useMemo(() => ({
    addImg: null,
    export: null,
    brush: null,
    layer: {
      cutImageData: {
        cutImageData: cutImages,
        setCutImageData: setCutImages,
      },
      layerData: {
        layerData: layers,
        setLayerData: setLayers,
      },
    },
    colors: {
      chosenColor: {
        hslData : {
          hsl: hsl,
          setHsl : setHsl
        },
        alphaData: {
          alpha: alpha,
          setAlpha: setAlpha
        }
      },
      history:{
        historyColor: historyColor,
        setHistoryColor: setHistoryColor,
        addHistoryColor: addHistoryColor
      }
    },
    canvas: {
      canvasSize: canvasSize,
      setCanvasSize: setCanvasSize,
      backgroundColor: backgroundColor,
      setBackgroundColor: setBackgroundColor
    }
  }), [cutImages, layers, hsl, alpha, historyColor, canvasSize, backgroundColor]);

  const openExportPopup = () => setIsExportPopupOpen(true);
  const closeExportPopup = () => setIsExportPopupOpen(false);

  return (
    <div className='main-layout'>
      <AppContext.Provider value={appProvidedValue}>
        <div className='tools-panel'>
          <Dashboard openExportPopup={openExportPopup} isExportPopupOpen={isExportPopupOpen} />
        </div>
        <div className='canvas-area'>
          {/* 캔버스 관련 내용이 여기에 들어갈 수 있습니다 */}
          <DrawingCanvas />
        </div>
      </AppContext.Provider>
      {isExportPopupOpen && (
        <div className="popup-overlay" onClick={closeExportPopup}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <ExportContent />
          </div>
        </div>
      )}
    </div>
  );
}

export default Workspace;