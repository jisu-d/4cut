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
}