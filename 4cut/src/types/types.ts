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

// 각각의 컴포넌트 만들때 타입 정의 하는 걸로
export interface AppContextType {
  addImg : null,
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
  colors: null
}