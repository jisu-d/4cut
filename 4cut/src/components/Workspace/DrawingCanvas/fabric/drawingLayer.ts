import * as fabric from 'fabric';
import type { DrawingItem } from '../../../../types/types';

// Canvas에 _drawingObjects 속성 추가를 위한 타입 확장
// (캔버스 단위로 드로잉 객체를 관리)
declare module 'fabric' {
  interface Canvas {
    _drawingObjects?: Map<string, fabric.Path>;
  }
}

// Drawing 객체(brush stroke 등) 생성 함수 예시
function createFabricDrawing(drawingData: DrawingItem): fabric.Path {
  if (
    drawingData.jsonData &&
    drawingData.jsonData.points &&
    Array.isArray(drawingData.jsonData.points) &&
    drawingData.jsonData.points.length > 0
  ) {
    const pathData = pointsToPathData(drawingData.jsonData.points);
    console.log(222);
    

    // 주요 옵션만 추출
    const {
      stroke, strokeWidth, fill, left, top, width, height, angle, scaleX, scaleY,
    } = drawingData.jsonData.options || {};

    const pathOptions = {
      stroke, strokeWidth, fill, left, top, width, height, angle, scaleX, scaleY,
    };

    return new fabric.Path(pathData, pathOptions);
  }
  return new fabric.Path('');
}

// points 배열을 SVG PathData로 변환하는 유틸 함수
function pointsToPathData(points: {x: number, y: number}[]): string {
  if (!points || points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

class DrawingLayerManager {
  private canvas: fabric.Canvas;
  private drawingMap: Map<string, fabric.Path>;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    if (!canvas._drawingObjects) {
      canvas._drawingObjects = new Map();
    }
    this.drawingMap = canvas._drawingObjects;
  }

  // 기존 드로잉 객체를 업데이트
  private updateDrawing(obj: fabric.Path, active: boolean, visible: boolean, drawingData: DrawingItem) {
    obj.set({
      visible: visible,
      evented: active,
      selectable: active,
    });
    obj.setCoords();
  }

  // 드로잉 객체 생성
  private createDrawing(drawingData: DrawingItem, active: boolean, visible: boolean, onDrawingTransform?: (id: string, newProps: any) => void): fabric.Path {
    const obj = createFabricDrawing(drawingData);
    // visible, active 속성에 따라 제어
    obj.set({
      visible: visible,
      evented: active,
      selectable: active,
    });
    
    // 변형 이벤트
    if (onDrawingTransform) {
      obj.on('modified', () => {
        // fabric.Path의 path 데이터를 points 배열로 변환
        console.log(obj.toObject());
        
        let points: {x: number, y: number}[] = [];
        if (obj instanceof fabric.Path) {
          const pathArr = obj.get('path');
          if (Array.isArray(pathArr)) {
            pathArr.forEach((seg: any, idx: number) => {
              if (seg[0] === 'M' || seg[0] === 'L') {
                points.push({ x: seg[1], y: seg[2] });
              }
            });
          }
        }

        onDrawingTransform(
          drawingData.id,
          {
            jsonData: {
              points,
              options: {
                ...obj.toObject(),
                left: obj.left,
                top: obj.top,
                width: obj.width,
                height: obj.height,
                angle: obj.angle,
                scaleX: obj.scaleX,
                scaleY: obj.scaleY,
              }
            }
          }
        );
      });
    }
    return obj;
  }

  // 사용하지 않는 드로잉 객체 제거
  private removeUnusedDrawings(drawings: any[]) {
    for (const [id, obj] of this.drawingMap.entries()) {
      if (!drawings.find(d => d.id === id)) {
        this.canvas.remove(obj);
        this.drawingMap.delete(id);
      }
    }
  }

  // 메인 동기화 메서드
  syncDrawings(
    drawings: DrawingItem[],
    onDrawingTransform?: (id: string, newProps: any) => void,
    active: boolean = true,
    visible: boolean = true
  ) {
    // 1. 사용하지 않는 드로잉 제거
    this.removeUnusedDrawings(drawings);

    // 2. drawings 처리
    drawings.forEach(drawing => {
      let obj = this.drawingMap.get(drawing.id);
      
      if (!obj) {
        // 새 드로잉 객체 생성
        obj = this.createDrawing(drawing, active, visible, onDrawingTransform);
        this.canvas.add(obj);
        this.drawingMap.set(drawing.id, obj);

      } else {
        // 기존 드로잉 객체 업데이트
        this.updateDrawing(obj, active, visible, drawing);
      }
    });
    this.canvas.renderAll();
  }
}

// 기존 cutLayer.ts처럼 외부에서 호출할 수 있는 함수 제공
export function syncDrawingLayer(
  canvas: fabric.Canvas,
  drawingItems: DrawingItem[],
  onDrawingTransform?: (id: string, newProps: any) => void,
  active: boolean = true,
  visible: boolean = true
) {
  const manager = new DrawingLayerManager(canvas);
  manager.syncDrawings(drawingItems, onDrawingTransform, active, visible);
}
