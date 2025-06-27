// src/components/Dashboard.js
// import React, { useState } from 'react';
import '../styles/Workspace/Workspace.css';

import Dashboard from '../components/Workspace/Dashboard';
import AppContext from '../contexts/AppContext';
import {useEffect, useMemo, useState} from 'react';
import ExportContent from '../components/Workspace/export/ExportContent';
import DrawingCanvas from '../components/Workspace/DrawingCanvas/DrawingCanvas';

import type {AppContextType, CanvasSize, HSL, ListCutImage, ListDrawingItem, UserLayerDataType, ImgData} from '../types/types'
import * as fabric from 'fabric';

function Workspace() {
  const [cutImages, setCutImages] = useState<ListCutImage[]>([]);

  const [drawingData, setDrawingData] = useState<ListDrawingItem>({});
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);

  const [userLayerDataType, setUserLayerDataType] = useState<UserLayerDataType[]>([
    {
      id: '1',
      text: 'cutData',
      LayerType: 'Cut',
      checked: true,
      selected: true,
    },
    {
      id: '2',
      text: 'layer1',
      LayerType: 'Drawing',
      checked: true,
      selected: false,
    }
  ])
  const [imgData, setImgData] = useState<ImgData>({})

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
      {
        id: 'cut1',
        AspectRatio: '3:4',
        jsonData: {
          left: 100,
          top: 100,
          width: 120,
          height: 160,
          angle: 0,
          selectable: true
        },
        checked: false,
      },
      {
        id: 'cut2',
        AspectRatio: '1:1',
        jsonData: {
          left: 100,
          top: 150,
          width: 120,
          height: 120,
          angle: 0,
          selectable: true
        },
        checked: false,
      },
      {
        id: 'cut3',
        AspectRatio: '4:3',
        jsonData: {
          left: 100,
          top: 200,
          width: 160,
          height: 120,
          angle: 0,
          selectable: true
        },
        checked: false,
      },
      {
        id: 'cut4',
        AspectRatio: '16:9',
        jsonData: {
          left: 100,
          top: 250,
          width: 180,
          height: 101.25,
          angle: 0,
          selectable: true
        },
        checked: false,
      },
    ]);

    setDrawingData({
      layer1: [
        { 
          brushType: "pen",
          bryshSize: 10,
          mouseData: [[1, 2], [2, 3], [3, 2]]
        },
        {
          brushType: "marker",
          bryshSize: 10,
          mouseData: [[10, 20], [20, 30], [30, 20]]
        }
      ]
    });

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
      userLayerDataType: {
        userLayerDataType: userLayerDataType,
        setUserLayerDataType: setUserLayerDataType
      },
      cutImageData: {
        cutImageData: cutImages,
        setCutImageData: setCutImages,
      },
      DrawingData: {
        drawingData: drawingData,
        setDrawingData: setDrawingData,
      },
      imgData: {
        imgData: imgData,
        setImgData: setImgData
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
  }), [
    // 레이어 관련
    cutImages, 
    userLayerDataType, 
    drawingData, 
    // 색상 관련
    hsl, 
    alpha, 
    historyColor, 
    // 캔버스 관련
    canvasSize, 
    backgroundColor,
  ]);

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