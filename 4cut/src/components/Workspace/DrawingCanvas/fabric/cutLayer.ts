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
      { const size = Math.min(width, height);
      return { width: size, height: size }; }
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
  private scaleX: number;
  private scaleY: number;

  constructor(canvas: fabric.Canvas, scale: { scaleX: number, scaleY: number }) {
    this.canvas = canvas;
    if (!canvas._aspectRects) {
      canvas._aspectRects = new Map();
    }
    this.rectMap = canvas._aspectRects;
    this.scaleX = scale.scaleX;
    this.scaleY = scale.scaleY;
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
  }, active: boolean, 
                     visible: boolean, onRectClick?: (id: string) => void, onRectTransform?: (id: string, position: {x:number, y:number}, size: {width:number, height:number}, angle: number) => void) {
    const rect = new fabric.Rect({
      ...rectData,
      fill: 'rgb(255, 255, 255)',
      stroke: cut.checked ? 'red' : 'black',
      strokeWidth: 1.5,
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
      rect.on('mousedown', () => {
        onRectClick(cut.id)
      });
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

    // checked면 선택 상태로
    if (cut.checked) {
      this.canvas.setActiveObject(rect);
    }

    this.canvas.add(rect);
    this.rectMap.set(cut.id, rect);
  }

  // 기존 rect를 업데이트하는 메서드
  private updateRect(rect: fabric.Rect, cut: ListCutImage, rectData: {
    left: number;
    top: number;
    width: number;
    height: number;
    angle: number;
  }, active: boolean, visible: boolean, zIndex:number): void {
    rect.set({
      ...rectData,
      stroke: cut.checked ? 'red' : 'black',
      selectable: active,
      evented: active,
      visible: visible
    });

    //if (this.lastZIndex !== zIndex) {
    //  this.lastZIndex = zIndex;
    //  this.fullSync(cuts, onRectClick, onRectTransform, active, visible, zIndex);
    //  return;
    //}
    
    rect.set('scaleX', 1);
    rect.set('scaleY', 1);
    rect.setCoords();

    this.canvas.moveObjectTo(rect, zIndex)
    
    this.updateControls(rect, active);

    // checked면 선택 상태로
    if (cut.checked) {
      this.canvas.setActiveObject(rect);
    }
  }

  // rect 데이터를 계산하는 메서드 
  private calculateRectData(cut: ListCutImage): {
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
    
    // 화면 좌표로 변환
    return {
      left: jsonData.left * this.scaleX,
      top: jsonData.top * this.scaleY,
      width: width * this.scaleX,
      height: height * this.scaleY,
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
    onRectClick: (id: string) => void,
    onRectTransform: (id: string, position: {x:number, y:number}, size: {width:number, height:number}, angle: number) => void,
    active: boolean,
    visible: boolean,
    zIndex: number
  ): void {
    // 사용하지 않는 rect 제거
    this.removeUnusedRects(cuts);

    // cuts 처리
    cuts.forEach((cut, idx) => {
      const rect = this.rectMap.get(cut.id);
      const rectData = this.calculateRectData(cut);

      // TODO 겹칠때 각 요소의 zindex를 겹치지 않도록 하기 위해서 만들어 놨지만 안된다ㄷㄷ
      const tempZIndex = zIndex + (idx / 100)

      if (!rect) {
        // 새로운 rect 생성
        this.createRect(cut, rectData, active, visible, onRectClick, onRectTransform);

      } else {
        // 기존 rect 업데이트
        this.updateRect(rect, cut, rectData, active, visible, tempZIndex);
      }
    });

    this.canvas.renderAll();
  }
}

// 기존 함수를 클래스 래퍼로 유지 (하위 호환성)
export function syncAspectRatioRects(
  canvas: fabric.Canvas,
  cuts: ListCutImage[],
  onRectClick: (id: string) => void,
  onRectTransform: (
      id: string, 
      position: {x:number, y:number}, 
      size: {width:number, height:number}, 
      angle: number) => void,
  active: boolean,
  visible: boolean,
  zindx: number,
  scale: { scaleX: number, scaleY: number }
) {
  const manager = new CutLayerManager(canvas, scale);
  manager.syncRects(cuts, onRectClick, onRectTransform, active, visible, zindx);
}
