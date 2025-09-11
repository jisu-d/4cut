export type AspectRatio = '4:3' | '3:4' | '1:1' | '16:9';
import type { PathProps, TOptions } from 'fabric';
import * as fabric from 'fabric';

export interface DrawingItem {
  id: string;
  brushType: string;
  jsonData: {
    points: { x: number; y: number }[];
    options: Partial<TOptions<PathProps>>;
  };
}

export interface BrushType {
  brushType: string;
  brushPath: string
}

export interface ListDrawingItem {
  [layerName: string]: DrawingItem[]
}

export interface ImagesData {
  src: string;
  alt: string;
}


export interface ListCutImage {
  id: string; // 각 컷의 고유 id
  AspectRatio: AspectRatio;
  jsonData: {
    left: number;
    top: number;
    width: number;
    height: number;
    angle: number;
    selectable: boolean;
  }
  checked: boolean;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface HistoryColor {
  hslData: {
    hsl: HSL
  }
  alphaData: {
    alpha: number;
  }
}

export interface UserLayerDataType {
  id: string;
  text: string;
  LayerType: "Drawing" | 'Cut' | 'Img';
  visible: boolean; // 화면에 보이는 여부
  active: boolean; // 현재 선택/수정 가능한 레이어 여부
}

export interface ImgDataItem {
  id: string,
  url: string,
  left: number,
  top: number,
  scaleX: number,
  scaleY: number,
  angle: number
}

export interface ImgData {
  [imgkey: string]: ImgDataItem
}


export interface DrawingStroke {
  brushType: string; // "pen", "eraser", "marker" 등 브러시 종류를 나타내는 문자열
  mouseData: [number, number][]; // 해당 스트로크를 구성하는 모든 좌표 데이터
}

export interface LayersData {
  [layerName: string]: DrawingStroke[];
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface BrushData {
  brushType: string;
  brushPath: string;
  brushSize: number;
  eraserSize: number;
}

export interface AppContextType {
  addImg: {
    imagesData: ImagesData[];
    setImageData: React.Dispatch<React.SetStateAction<ImagesData[]>>
  },
  export: null,
  brush: {
    brushData: BrushData;
    setBrushData: React.Dispatch<React.SetStateAction<BrushData>>;
  },
  layer: {
    userLayerDataType: { // 화면 직접 적으로 표시할 데이터 
      userLayerDataType: UserLayerDataType[];
      setUserLayerDataType: React.Dispatch<React.SetStateAction<UserLayerDataType[]>>;
    }
    DrawingData: { // 그림 그리는 레이어 - Drawing
      drawingData: ListDrawingItem;
      setDrawingData: React.Dispatch<React.SetStateAction<ListDrawingItem>>;
    }
    cutImageData: { // 컷 이미지가 들어갈 공간의 정보를 담은 데이터 타입 - Cut
      cutImageData: ListCutImage[];
      setCutImageData: React.Dispatch<React.SetStateAction<ListCutImage[]>>;
    },
    imgData: { // 이미지 데이터 타입 - Img
      imgData: ImgData
      setImgData: React.Dispatch<React.SetStateAction<ImgData>>;
    }
  },
  colors: {
    chosenColor: {
      hslData: {
        hsl: HSL
        setHsl: React.Dispatch<React.SetStateAction<HSL>>;
      }
      alphaData: {
        alpha: number;
        setAlpha: React.Dispatch<React.SetStateAction<number>>;
      }
    }
    history:{
      historyColor: HistoryColor[];
      setHistoryColor: React.Dispatch<React.SetStateAction<HistoryColor[]>>;
      addHistoryColor: () => void;
    }
  },
  canvas: {
    canvasSize: CanvasSize
    setCanvasSize: React.Dispatch<React.SetStateAction<CanvasSize>>;
    backgroundColor: string;
    setBackgroundColor: React.Dispatch<React.SetStateAction<string>>;
    fabricCanvasRef: React.RefObject<fabric.Canvas | null>;
  },
}


export interface CaptureImageData {
  id: number;
  ratio: '16:9' | '4:3' | '3:4' | '1:1',
  base64Img: string
}

export interface ImgPlaceData {
  ratio: '16:9' | '4:3' | '3:4' | '1:1';
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  imgSrc: string | null;
}

export type ModeType = 'frame' | 'capture' | 'compose';

export interface PhotoCaptureContextType {
  Mode: {
    mode: ModeType;
    setmode: React.Dispatch<React.SetStateAction<ModeType>>;
  }
  CaptureImgData: { // 촬영할 이미지
    captureImageData: CaptureImageData[];
    setCaptureImgData: React.Dispatch<React.SetStateAction<CaptureImageData[]>>;
  };
  FrameData: {
    url: string;
    ImgPlaceData: {
      imgPlaceData: ImgPlaceData[];
      setimageData:React.Dispatch<React.SetStateAction<ImgPlaceData[]>>;
    }
    updateSlotImage: (slotIndex: number, newImageSrc: string | null) => void;
  }
}
