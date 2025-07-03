// src/components/Dashboard.js
// import React, { useState } from 'react';
import '../styles/Workspace/Workspace.css';

import Dashboard from '../components/Workspace/Dashboard';
import AppContext from '../contexts/AppContext';
import {useEffect, useMemo, useState, useRef} from 'react';
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
      visible: true,
      active: true,
    },
    {
      id: '2',
      text: 'layer1',
      LayerType: 'Drawing',
      visible: true,
      active: false,
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
  //TODO 이부분 최적화 -> 왜 이딴식으로 짜야할지;; 코드는 동작함
  const hslRef = useRef(hsl);
  const alphaRef = useRef(alpha);
  useEffect(() => { hslRef.current = hsl; }, [hsl]);
  useEffect(() => { alphaRef.current = alpha; }, [alpha]);

  const addHistoryColor = () => {
    setHistoryColor((prev) => {
      const next = [...prev, { hslData: { hsl: hslRef.current }, alphaData: { alpha: alphaRef.current } }];
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
        AspectRatio: '3:4',
        jsonData: {
          left: 100,
          top: 150,
          width: 120,
          height: 160,
          angle: 0,
          selectable: true
        },
        checked: false,
      },
      {
        id: 'cut3',
        AspectRatio: '3:4',
        jsonData: {
          left: 100,
          top: 200,
          width: 120,
          height: 160,
          angle: 0,
          selectable: true
        },
        checked: false,
      },
      {
        id: 'cut4',
        AspectRatio: '3:4',
        jsonData: {
          left: 100,
          top: 250,
          width: 120,
          height: 160,
          angle: 0,
          selectable: true
        },
        checked: false,
      },
    ]);

    setDrawingData({
      layer1: [
        { 
          id: 'drawing-1',
          brushType: "pen",
          jsonData: {
            points: [
              { x: 10, y: 10 },
              { x: 100, y: 10 },
              { x: 100, y: 100 },
              { x: 200, y: 100 },
              { x: 200, y: 200 },
              { x: 100, y: 200 },
              { x: 100, y: 300 },
            ],
            options: {
              stroke: 'black',
              strokeWidth: 2,
              fill: '',
              left: 10,
              top: 10,
              width: 190,
              height: 290,
              angle: 0,
              scaleX: 1,
              scaleY: 1,
            }
          }
        },
        {
          id: 'drawing-2',
          brushType: "marker",
          jsonData: {
            points: [
              { x: 20, y: 30 },
              { x: 120, y: 30 }
            ],
            options: {
              stroke: 'red',
              strokeWidth: 2,
              fill: '',
              left: 20,
              top: 30,
              width: 100,
              height: 0,
              angle: 0,
              scaleX: 1,
              scaleY: 1,
            }
          }
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