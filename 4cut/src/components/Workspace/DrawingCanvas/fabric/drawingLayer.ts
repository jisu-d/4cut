import * as fabric from 'fabric';
import type { DrawingItem, BrushData } from '../../../../types/types';

import {imageStampBrush} from './imageStampBrush'
// Canvas에 _drawingLayerObjects 속성 추가를 위한 타입 확장
// (캔버스 단위로 레이어별 드로잉 객체를 관리)
declare module 'fabric' {
  interface Canvas {
    _drawingLayerObjects?: Map<string, Map<string, fabric.Path | fabric.Group>>;
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

    // TODO 주요 옵션만 추출 -> 이거를 이렇게 처리해야 하는 이유를 잘 모르겠음
    const {
      stroke, strokeWidth, fill, left, top, width, height,
      angle, scaleX, scaleY, strokeLineCap, strokeLineJoin, opacity,
      globalCompositeOperation,
    } = drawingData.jsonData.options || {};

    return new fabric.Path(pathData, {
      stroke, strokeWidth, fill, left, top, width, height,
      angle, scaleX, scaleY, strokeLineCap, strokeLineJoin, opacity,
      globalCompositeOperation,
    });
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

// 변형 이벤트 핸들러 함수 분리
function handleModifiedEvent(obj: fabric.Path | fabric.Group, drawingData: DrawingItem, onDrawingTransform: (id: string, newProps: any) => void, scaleX: number, scaleY: number) {
  const points: {x: number, y: number}[] = [];
  if (obj instanceof fabric.Path) {
    const pathArr = obj.get('path');
    if (Array.isArray(pathArr)) {
      pathArr.forEach((seg: any) => {
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
        points: points.map(p => ({ x: p.x / scaleX, y: p.y / scaleY })),
        options: {
          ...((obj as any).toObject()),
          left: obj.left / scaleX,
          top: obj.top / scaleY,
          width: obj.width / scaleX,
          height: obj.height / scaleY,
          angle: obj.angle,
          scaleX: obj.scaleX / scaleX,
          scaleY: obj.scaleY / scaleY,
        }
      }
    }
  );
}

class DrawingLayerManager {
  private canvas: fabric.Canvas;
  private drawingMap: Map<string, fabric.Path | fabric.Group>;
  private scaleX: number;
  private scaleY: number;

  constructor(canvas: fabric.Canvas, layerId: string, scale: { scaleX: number, scaleY: number }) {
    this.canvas = canvas;
    if (!canvas._drawingLayerObjects) {
      canvas._drawingLayerObjects = new Map();
    }
    if (!canvas._drawingLayerObjects.has(layerId)) {
      canvas._drawingLayerObjects.set(layerId, new Map());
    }
    this.drawingMap = canvas._drawingLayerObjects.get(layerId)!;
    this.scaleX = scale.scaleX;
    this.scaleY = scale.scaleY;
  }

  // 기존 드로잉 객체를 업데이트
  private updateDrawing(obj: fabric.Path | fabric.Group, active: boolean, visible: boolean, zIndex:number) {
    obj.set({
      visible: visible,
      evented: active,
      selectable: active,
    });
    this.canvas.moveObjectTo(obj, zIndex)
    obj.setCoords();
  }

  // 드로잉 객체 생성
  private async createDrawing(drawingData: DrawingItem, brushData:BrushData , active: boolean, visible: boolean, onDrawingTransform?: (id: string, newProps: any) => void): Promise<fabric.Path | fabric.Group> {
    let obj: fabric.Path | fabric.Group

    const scaledDrawingData = {
      ...drawingData,
      jsonData: {
        ...drawingData.jsonData,
        points: drawingData.jsonData.points.map(p => ({x: p.x * this.scaleX, y: p.y * this.scaleY})),
        options: {
          ...drawingData.jsonData.options,
          left: (drawingData.jsonData.options.left ?? 0) * this.scaleX,
          top: (drawingData.jsonData.options.top ?? 0) * this.scaleY,
          strokeWidth: (drawingData.jsonData.options.strokeWidth ?? 1) * this.scaleX,
          scaleX: (drawingData.jsonData.options.scaleX ?? 1),
          scaleY: (drawingData.jsonData.options.scaleY ?? 1),
        }
      }
    };

    if(drawingData.brushType === 'pen'){
      obj = createFabricDrawing(scaledDrawingData);
    } else{
      obj = await imageStampBrush(scaledDrawingData, brushData);
    }

    obj.set({
      visible: visible,
      evented: active,
      selectable: active,
    });
    
    // 변형 이벤트 
    // TODO -> 이거 오류때문에 임시로 이렇게 처리했는데 이유를 잘 모르겠음
    if (onDrawingTransform) {
      if(obj instanceof fabric.Path){
        obj.on('modified', () => handleModifiedEvent(obj, drawingData, onDrawingTransform, this.scaleX, this.scaleY));
      }else if(obj instanceof fabric.Group){
        obj.on('modified', () => handleModifiedEvent(obj, drawingData, onDrawingTransform, this.scaleX, this.scaleY));
      }
    }
    return obj;
  }

  // 사용하지 않는 드로잉 객체 제거
  private removeUnusedDrawings(drawings: DrawingItem[]) {
    const drawingIds = new Set(drawings.map(d => d.id));
    for (const [id, obj] of this.drawingMap.entries()) {
      if (!drawingIds.has(id)) {
        this.canvas.remove(obj);
        this.drawingMap.delete(id);
      }
    }
  }

  // 메인 동기화 메서드
  syncDrawings(
    drawings: DrawingItem[],
    onDrawingTransform: (id: string) => void,
    active: boolean,
    visible: boolean,
    zIndex: number,
    brushData: BrushData,
  ) {
    this.removeUnusedDrawings(drawings);
    
    // 2. drawings 처리
    drawings.forEach(async drawing => {
      let obj = this.drawingMap.get(drawing.id);
      if (!obj) {
        // 새 드로잉 객체 생성
        obj = await this.createDrawing(drawing, brushData, active, visible, onDrawingTransform);
        this.canvas.add(obj);
        this.drawingMap.set(drawing.id, obj);
      } else {
        // 기존 드로잉 객체 업데이트
        this.updateDrawing(obj, active, visible, zIndex);
      }
    });
    this.canvas.renderAll();
  }
}

// 기존 cutLayer.ts처럼 외부에서 호출할 수 있는 함수 제공
export function syncDrawingLayer(
  canvas: fabric.Canvas,
  layerId: string,
  drawingItems: DrawingItem[],
  brushData: BrushData,
  onDrawingTransform: (id: string) => void,
  active: boolean,
  visible: boolean,
  zIndex: number,
  scale: { scaleX: number, scaleY: number },
) {
  const manager = new DrawingLayerManager(canvas, layerId, scale);
  manager.syncDrawings(drawingItems, onDrawingTransform, active, visible, zIndex, brushData);
}

// id로 드로잉 오브젝트를 삭제하는 함수
export function removeDrawingById(canvas: fabric.Canvas, layerId: string) {
  if (canvas._drawingLayerObjects && canvas._drawingLayerObjects.has(layerId)) {
    const drawingMap = canvas._drawingLayerObjects.get(layerId);
    if(drawingMap){
      for (const [id, obj] of drawingMap.entries()) {
        canvas.remove(obj);
        drawingMap.delete(id);
      }
      canvas.renderAll();
    }

  }
}
