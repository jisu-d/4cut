import React from 'react';

import type {AppContextType} from '../types/types'

// 기본값 정의
const AppContext = React.createContext<AppContextType>({
  addImg : {
    imagesData: [],
    setImageData: () => {}
  },
  export: {
    Image: {
      processedImage: null,
      setProcessedImage: () => {}
    },
    frameInfo: {
      isPublic: { // 공개 비공개 여부
        isPublic: false,
        setIsPublic: () => {}
      },
      author: { // 제작자 -> 로그인 되어있으면 자동 입력 id등 으로
        author: '',
        setAuthor: () => {}
      },
      frameName: { // 프레임 이름
        frameName: '',
        setFrameName: () => {}
      },
      authorPw: { // 제작자 구분 비밀번호
        authorPw: '',
        setAuthorPw: () => {}
      },
      desc: { // 프레임 설명
        desc: '',
        setDesc: () => {}
      },
    }
  },
  brush: {
    brushData: {
      brushType: 'pen',
      brushSize: 1,
      eraserSize: 1,
      brushPath: '',
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
    fabricCanvasRef: { current: null },
  },
});

export default AppContext;