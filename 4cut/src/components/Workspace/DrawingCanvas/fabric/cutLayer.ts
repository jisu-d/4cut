import * as fabric from 'fabric';

import type {ListCutImage, AspectRatio} from '../../../../types/types.ts'

// Canvas에 _aspectRects 속성 추가를 위한 타입 확장
declare module 'fabric' {
  interface Canvas {
    _aspectRects?: Map<string, fabric.Rect>;
  }
}

// 비율에 따른 크기 계산 함수
function calculateSizeByAspectRatio(width: number, height: number, aspectRatio: AspectRatio): { width: number; height: number } {
  switch (aspectRatio) {
    case '4:3': 
      if (width < height) {
        return { width, height: width * (3/4) };
      } else {
        return { width: height * (4/3), height };
      }
    case '3:4': 
      if (width < height) {
        return { width, height: width * (4/3) };
      } else {
        return { width: height * (3/4), height };
      }
    case '1:1': 
      const size = Math.min(width, height);
      return { width: size, height: size };
    case '16:9': 
      if (width < height) {
        return { width, height: width * (9/16) };
      } else {
        return { width: height * (16/9), height };
      }
    default:
      return { width, height };
  }
}

class CutLayerManager {
  private canvas: fabric.Canvas;
  private rectMap: Map<string, fabric.Rect>;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    if (!canvas._aspectRects) {
      canvas._aspectRects = new Map();
    }
    this.rectMap = canvas._aspectRects;
  }

  // 컨트롤 설정을 업데이트하는 메서드
  private updateControls(rect: fabric.Rect, selectable: boolean): void {
    if (selectable) {
      rect.setControlsVisibility({
        mt: false, mb: false, ml: false, mr: false,
        mtr: true, tl: true, tr: true, bl: true, br: true
      });
    } else {
      rect.setControlsVisibility({
        mt: false, mb: false, ml: false, mr: false,
        mtr: false, tl: false, tr: false, bl: false, br: false
      });
    }
  }

  // 새로운 rect를 생성하는 메서드
  private createRect(cut: ListCutImage, rectData: {
    left: number;
    top: number;
    width: number;
    height: number;
    angle: number;
  }, active: boolean, visible: boolean, onRectClick?: (id: string) => void, onRectTransform?: (id: string, position: {x:number, y:number}, size: {width:number, height:number}, angle: number) => void): fabric.Rect {
    const rect = new fabric.Rect({
      ...rectData,
      fill: 'rgb(255, 255, 255)',
      stroke: cut.checked ? 'red' : 'black',
      strokeWidth: 3,
      selectable: active,
      evented: active,
      visible: visible,
      scaleX: 1,
      scaleY: 1,
    });

    // 컨트롤 설정
    this.updateControls(rect, active);
    
    // 균등 비율 유지를 위한 설정
    rect.lockScalingX = false;
    rect.lockScalingY = false;
    rect.lockScalingFlip = true;

    // 이벤트 등록
    if (onRectClick) {
      rect.on('mousedown', () => onRectClick(cut.id));
    }

    if (onRectTransform) {
      rect.on('modified', () => {
        if (rect) {
          onRectTransform(
            cut.id,
            { x: rect.left ?? 0, y: rect.top ?? 0 },
            {
              width: rect.width! * (rect.scaleX ?? 1),
              height: rect.height! * (rect.scaleY ?? 1)
            },
            rect.angle ?? 0
          );
        }
      });
    }

    return rect;
  }

  // 기존 rect를 업데이트하는 메서드
  private updateRect(rect: fabric.Rect, cut: ListCutImage, rectData: {
    left: number;
    top: number;
    width: number;
    height: number;
    angle: number;
  }, active: boolean, visible: boolean): void {
    rect.set({
      ...rectData,
      stroke: cut.checked ? 'red' : 'black',
      selectable: active,
      evented: active,
      visible: visible
    });
    
    rect.set('scaleX', 1);
    rect.set('scaleY', 1);
    rect.setCoords();
    
    this.updateControls(rect, active);
  }

  // rect 데이터를 계산하는 메서드
  private calculateRectData(cut: ListCutImage, idx: number): {
    left: number;
    top: number;
    width: number;
    height: number;
    angle: number;
  } {
    const jsonData = cut.jsonData || {};
    let width = jsonData.width ?? 200;
    let height = jsonData.height ?? 200;
    
    // 비율에 따른 크기 계산
    const { width: calculatedWidth, height: calculatedHeight } = calculateSizeByAspectRatio(width, height, cut.AspectRatio);
    width = calculatedWidth;
    height = calculatedHeight;
    
    return {
      left: jsonData.left ?? (50 + idx * 250),
      top: jsonData.top ?? ((this.canvas.height! - height) / 2),
      width,
      height,
      angle: jsonData.angle ?? 0
    };
  }

  // 사용하지 않는 rect들을 제거하는 메서드
  private removeUnusedRects(cuts: ListCutImage[]): void {
    for (const [id, rect] of this.rectMap.entries()) {
      if (!cuts.find(cut => cut.id === id)) {
        this.canvas.remove(rect);
        this.rectMap.delete(id);
      }
    }
  }

  // 메인 동기화 메서드
  syncRects(
    cuts: ListCutImage[],
    onRectClick?: (id: string) => void,
    onRectTransform?: (id: string, position: {x:number, y:number}, size: {width:number, height:number}, angle: number) => void,
    active: boolean = true,
    visible: boolean = true
  ): void {
    // 사용하지 않는 rect 제거
    this.removeUnusedRects(cuts);

    // cuts 처리
    cuts.forEach((cut, idx) => {
      let rect = this.rectMap.get(cut.id);
      const rectData = this.calculateRectData(cut, idx);

      if (!rect) {
        // 새로운 rect 생성
        rect = this.createRect(cut, rectData, active, visible, onRectClick, onRectTransform);
        this.canvas.add(rect);
        this.rectMap.set(cut.id, rect);
      } else {
        // 기존 rect 업데이트
        this.updateRect(rect, cut, rectData, active, visible);
      }
    });
    this.canvas.renderAll();
  }
}

// 기존 함수를 클래스 래퍼로 유지 (하위 호환성)
export function syncAspectRatioRects(
  canvas: fabric.Canvas,
  cuts: ListCutImage[],
  onRectClick?: (id: string) => void,
  onRectTransform?: (id: string, position: {x:number, y:number}, size: {width:number, height:number}, angle: number) => void,
  active: boolean = true,
  visible: boolean = true
) {
  const manager = new CutLayerManager(canvas);
  manager.syncRects(cuts, onRectClick, onRectTransform, active, visible);
}
