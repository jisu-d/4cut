import { useState, useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type {DrawingItem, ListDrawingItem, UserLayerDataType, BrushData, HSL} from '../../../../types/types';
import * as fabric from 'fabric';

import { createImageStampGroup, addImageStampToGroup } from './imageStampBrush.ts';


// HSL을 hex로 변환하는 함수
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}


// points 배열을 SVG PathData로 변환하는 유틸 함수 - 부드러운 곡선으로 변경
function pointsToPathData(points: {x: number, y: number}[]): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  
  let d = `M ${points[0].x} ${points[0].y}`;
  
  // 부드러운 곡선을 위해 3개 이상의 점이 있을 때만 곡선 사용
  if (points.length >= 3) {
    for (let i = 1; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      // 중간점을 제어점으로 사용하여 부드러운 곡선 생성
      d += ` Q ${current.x} ${current.y}, ${(current.x + next.x) / 2} ${(current.y + next.y) / 2}`;
    }
    // 마지막 점까지 직선으로 연결
    const lastPoint = points[points.length - 1];
    d += ` L ${lastPoint.x} ${lastPoint.y}`;
  } else {
    // 점이 2개일 때는 직선
    d += ` L ${points[1].x} ${points[1].y}`;
  }
  
  return d;
}

interface UseDrawingManagerProps {
  contextUserLayerDataType: UserLayerDataType[] | undefined;
  activeTool: string;
  brushData: BrushData;
  hsl: HSL;
  alpha: number;
  setDrawingData: React.Dispatch<React.SetStateAction<ListDrawingItem>>;
  contextfabricCanvasRef: RefObject<fabric.Canvas | null>;
  pointerRef: React.RefObject<{x:number, y:number}>;
  canvasScale: { scaleX: number, scaleY: number };
}

export function useDrawingManager({
  contextUserLayerDataType,
  activeTool,
  brushData,
  hsl,
  alpha,
  setDrawingData,
  contextfabricCanvasRef,
  pointerRef,
  canvasScale,
}: UseDrawingManagerProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false); // isErasing 상태 추가
  const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([]);
  const [drawingLayerName, setDrawingLayerName] = useState<string | null>(null);
  const tempPathObj = useRef<fabric.Path | fabric.Group | null>(null);

  // 드로잉 시작
  const handleCanvasPointerDown = useCallback(() => {
    if (!pointerRef) return;

    const selectedLayer = contextUserLayerDataType?.find(layer => layer.active);
    if (!selectedLayer) return;

    if (activeTool === 'pen') {
      if (selectedLayer.LayerType !== 'Drawing') return;
      setIsDrawing(true);
      setDrawingPoints([pointerRef.current]);
      setDrawingLayerName(selectedLayer.id);
    } else if (activeTool === 'eraser') {
      if (selectedLayer.LayerType !== 'Drawing') return;
      setIsErasing(true);
      setDrawingLayerName(selectedLayer.id);
    }
  }, [pointerRef, contextUserLayerDataType, activeTool]);

  // 드로잉 중 이동
  const handleCanvasPointerMove = useCallback(() => {
    if (!pointerRef.current) return;

    if (isDrawing) {
      setDrawingPoints(prev => [...prev, pointerRef.current]);
    }
  }, [pointerRef, isDrawing]);

  // 드로잉 끝
  const handleCanvasPointerUp = useCallback(() => {
    if (isDrawing) {
      
      if (!drawingLayerName || drawingPoints.length < 2) {
        setIsDrawing(false);
        setDrawingPoints([]);
        setDrawingLayerName(null);
        return;
      }
      if (setDrawingData) {
        setDrawingData((prev: ListDrawingItem) => {
          const newId = `drawing-${Date.now()}`;

          const unscaledDrawingPoints = drawingPoints.map(p => ({
            x: p.x / canvasScale.scaleX,
            y: p.y / canvasScale.scaleY,
          }));

          const unscaledBrushSize = brushData.brushSize / ((canvasScale.scaleX + canvasScale.scaleY) / 2);

          const newDrawing: DrawingItem = {
            id: newId,  
            brushType: brushData.brushType,
            jsonData: {
              points: unscaledDrawingPoints,
              options: {
                stroke: hslToHex(hsl.h, hsl.s, hsl.l),
                strokeWidth: unscaledBrushSize,
                strokeLineCap: 'round',
                strokeLineJoin: 'round',
                fill: '',
                left: (Math.min(...drawingPoints.map(p => p.x)) - brushData.brushSize / 2) / canvasScale.scaleX,
                top: (Math.min(...drawingPoints.map(p => p.y)) - brushData.brushSize / 2) / canvasScale.scaleY,
                width: (Math.max(...drawingPoints.map(p => p.x)) - Math.min(...drawingPoints.map(p => p.x)) + brushData.brushSize) / canvasScale.scaleX,
                height: (Math.max(...drawingPoints.map(p => p.y)) - Math.min(...drawingPoints.map(p => p.y)) + brushData.brushSize) / canvasScale.scaleY,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                opacity: alpha,
                globalCompositeOperation: 'source-over'
              }
            }
          };
          
          return {
            ...prev,
            [drawingLayerName]: [
              newDrawing,
              ...(prev[drawingLayerName] || []),
            ]
          };
        });
      }
      
      setIsDrawing(false);
      setDrawingPoints([]);
      setDrawingLayerName(null);
    } else if (isErasing) {
      setIsErasing(false);
      setDrawingLayerName(null);
    }
  }, [isDrawing, isErasing, drawingLayerName, drawingPoints, setDrawingData, brushData, hsl, alpha, canvasScale.scaleX, canvasScale.scaleY]);

  // 드로잉 중일 때 임시 path를 그리고, 업데이트하는 Hook
  useEffect(() => {
    const fabricCanvas = contextfabricCanvasRef?.current;
    if (!fabricCanvas || !isDrawing) {
      return;
    }

    let isCancelled = false;

    const drawAsync = async () => {
      if (drawingPoints.length === 0) return;

      if (brushData.brushType === 'pen') {
        if (tempPathObj.current) fabricCanvas.remove(tempPathObj.current);
        
        const pathData = pointsToPathData(drawingPoints);
        const newPathObj = new fabric.Path(pathData, {
          stroke: hslToHex(hsl.h, hsl.s, hsl.l),
          strokeWidth: brushData.brushSize,
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
          fill: '',
          selectable: false,
          evented: false,
          opacity: alpha,
        });

        if (isCancelled) return;
        fabricCanvas.add(newPathObj);
        tempPathObj.current = newPathObj;
      } else if (brushData) {
        if (!tempPathObj.current) {
          const group = await createImageStampGroup(
            drawingPoints[0],
              brushData,
            { stroke: hslToHex(hsl.h, hsl.s, hsl.l), strokeWidth: brushData.brushSize, opacity: alpha }
          );
          if (isCancelled) return;
          fabricCanvas.add(group);
          tempPathObj.current = group;
        } else {
          const group = tempPathObj.current as fabric.Group;
          const lastPoint = drawingPoints[drawingPoints.length - 2];
          const newPoint = drawingPoints[drawingPoints.length - 1];


          if (lastPoint && newPoint) {
            await addImageStampToGroup(
                group,
                newPoint,
                lastPoint, // lastPoint 전달
                brushData,
              { stroke: hslToHex(hsl.h, hsl.s, hsl.l), strokeWidth: brushData.brushSize, opacity: alpha }
            );
            if (isCancelled) return;
          }
          fabricCanvas.requestRenderAll();
        }
      }
    };

    drawAsync();

    return () => {
      isCancelled = true;
    };
  }, [isDrawing, drawingPoints, contextfabricCanvasRef, brushData, hsl, alpha]);

  // 드로잉이 끝났을 때 임시 path를 정리하는 Hook
  useEffect(() => {
    if (!isDrawing && tempPathObj.current && contextfabricCanvasRef?.current) {
      contextfabricCanvasRef.current.remove(tempPathObj.current);
      contextfabricCanvasRef.current.requestRenderAll();
      tempPathObj.current = null;
    }
  }, [isDrawing, contextfabricCanvasRef]);

  return {
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp
  };
}
