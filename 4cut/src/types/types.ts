export type AspectRatio = '4:3' | '3:4' | '1:1' | '16:9';



export interface DndListProps {
  items: ListItem[];
  setItems: React.Dispatch<React.SetStateAction<ListItem[]>>;
}

export interface ListItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ListCutImage {
  AspectRatio: '4:3' | '3:4' | '1:1' | '16:9';
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

export interface AppContextType {
  addImg: null,
  export: null,
  brush: null,
  layer: {
    cutImageData: {
      cutImageData: ListCutImage[];
      setCutImageData: React.Dispatch<React.SetStateAction<ListCutImage[]>>;
    }
    layerData: {
      layerData: ListItem[];
      setLayerData: React.Dispatch<React.SetStateAction<ListItem[]>>;
    }
  } | null,
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
  } | null,
  canvas: {
    canvasSize: CanvasSize
    setCanvasSize: React.Dispatch<React.SetStateAction<CanvasSize>>;
    backgroundColor: string;
    setBackgroundColor: React.Dispatch<React.SetStateAction<string>>;
  } | null,
}


