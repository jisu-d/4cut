import React from 'react';

import type {AppContextType} from '../types/types'

// 기본값 정의
const AppContext = React.createContext<AppContextType>({
  addImg : {
    imagesData: [],
    setImageData: () => {}
  },
  export: null,
  brush: {
    brushData: {
      brushType: 'pen',
      brushSize: 1,
      eraserSize: 1,
    },
    setBrushData: () => {}
  },
  layer: {
    userLayerDataType: {
      userLayerDataType: [],
      setUserLayerDataType: () => {},
    },
    DrawingData: {
      drawingData: {},
      setDrawingData: () => {},
    },
    cutImageData: {
      cutImageData: [],
      setCutImageData: () => {},
    },
    imgData: {
      imgData: {},
      setImgData: () => {},
    },
  },
  colors: {
    chosenColor: {
      hslData: {
        hsl: { h: 0, s: 0, l: 0 },
        setHsl: () => {},
      },
      alphaData: {
        alpha: 1,
        setAlpha: () => {},
      },
    },
    history: {
      historyColor: [],
      setHistoryColor: () => {},
      addHistoryColor: () => {},
    },
  },
  canvas: {
    canvasSize: { width: 800, height: 600 },
    setCanvasSize: () => {},
    backgroundColor: '#ffffff',
    setBackgroundColor: () => {},
  },
});

export default AppContext;