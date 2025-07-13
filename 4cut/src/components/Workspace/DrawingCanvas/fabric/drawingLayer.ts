import * as fabric from 'fabric';
import type { DrawingItem, BrushType } from '../../../../types/types';

import {imageStampBrush} from './imageStampBrush'
import {brushType} from '../../../../assets/brush/brushType'

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
      stroke, strokeWidth, fill, left, top, width, height, angle, scaleX, scaleY, strokeLineCap, strokeLineJoin, opacity
    } = drawingData.jsonData.options || {};

    return new fabric.Path(pathData, {
      stroke, strokeWidth, fill, left, top, width, height, angle, scaleX, scaleY, strokeLineCap, strokeLineJoin, opacity
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
function handleModifiedEvent(obj: fabric.Path | fabric.Group, drawingData: DrawingItem, onDrawingTransform: (id: string, newProps: any) => void) {
  let points: {x: number, y: number}[] = [];
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
        points,
        options: {
          ...((obj as any).toObject()),
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
}

class DrawingLayerManager {
  private canvas: fabric.Canvas;
  private drawingMap: Map<string, fabric.Path | fabric.Group>;

  constructor(canvas: fabric.Canvas, layerId: string) {
    this.canvas = canvas;
    if (!canvas._drawingLayerObjects) {
      canvas._drawingLayerObjects = new Map();
    }
    if (!canvas._drawingLayerObjects.has(layerId)) {
      canvas._drawingLayerObjects.set(layerId, new Map());
    }
    this.drawingMap = canvas._drawingLayerObjects.get(layerId)!;
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
  private async createDrawing(drawingData: DrawingItem, active: boolean, visible: boolean, zIndex:number, onDrawingTransform?: (id: string, newProps: any) => void): Promise<fabric.Path | fabric.Group> {
    //const obj = createFabricDrawing(drawingData);
    //const obj = await createGroupedImages(drawingData.jsonData.points, 'http://localhost:5173/src/assets/brush/brush1.png');
    // visible, active 속성에 따라 제어

    let obj: fabric.Path | fabric.Group

    
    if(drawingData.brushType === 'pen'){
      obj = createFabricDrawing(drawingData);
    } else{
      const matchedBrush = brushType.find(b => b.brushType === drawingData.brushType) as BrushType
      obj = await imageStampBrush(drawingData, matchedBrush);
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
        obj.on('modified', () => handleModifiedEvent(obj, drawingData, onDrawingTransform));
      }else if(obj instanceof fabric.Group){
        obj.on('modified', () => handleModifiedEvent(obj, drawingData, onDrawingTransform));
      }
    }
    return obj;
  }

  // 사용하지 않는 드로잉 객체 제거
  //private removeUnusedDrawings(drawings: DrawingItem[]) {
  //  for (const [id, obj] of this.drawingMap.entries()) {
  //    if (!drawings.find(d => d.id === id)) {
  //      
  //      this.canvas.remove(obj);
  //      this.drawingMap.delete(id);
  //    }
  //  }
  //}

  // 메인 동기화 메서드
  syncDrawings(
    drawings: DrawingItem[],
    onDrawingTransform: (id: string, newProps: any) => void,
    active: boolean,
    visible: boolean,
    zIndex: number
  ) {
    // TODO 이런 방식으로 레이어를 삭제하는 방식은 처음 drawings데이터를 받을때 부터 코드를 수정해야함, 
    // 현재 외부에서 함수 호출로 canvas map에서 삭제하는 방식으로 하고 있음
    //this.removeUnusedDrawings(drawings);
    
    // 2. drawings 처리
    drawings.forEach(async drawing => {
      let obj = this.drawingMap.get(drawing.id);
      if (!obj) {
        // 새 드로잉 객체 생성
        obj = await this.createDrawing(drawing, active, visible, zIndex, onDrawingTransform);
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
  onDrawingTransform: (id: string, newProps: any) => void,
  active: boolean,
  visible: boolean,
  zIndex: number,
) {
  const manager = new DrawingLayerManager(canvas, layerId);
  manager.syncDrawings(drawingItems, onDrawingTransform, active, visible, zIndex);
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
