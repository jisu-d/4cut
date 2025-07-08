import { useState, useCallback, useEffect } from 'react';
import type { RefObject } from 'react';
import type { DrawingItem, ListDrawingItem, UserLayerDataType, BrushData, HSL } from '../../../../types/types';
import * as fabric from 'fabric';

interface UseDrawingManagerProps {
  contextUserLayerDataType: UserLayerDataType[] | undefined;
  activeTool: string;
  brushData: BrushData;
  hsl: HSL;
  alpha: number;
  setDrawingData?: React.Dispatch<React.SetStateAction<ListDrawingItem>>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  fabricCanvasRef?: RefObject<fabric.Canvas | null>;
  scale?: number;
}

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

// 좌표 변환 
function getPointerFromEvent(e: React.MouseEvent | React.TouchEvent, canvasRef: RefObject<HTMLCanvasElement | null>, scale?: number) {
  let clientX, clientY;
  if ('touches' in e && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if ('clientX' in e) {
    clientX = e.clientX;
    clientY = e.clientY;
  } else {
    return null;
  }
  const rect = canvasRef.current?.getBoundingClientRect();
  if (!rect || !scale) return null;
  const x = (clientX - rect.left) / scale;
  const y = (clientY - rect.top) / scale;
  return { x, y };
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

export function useDrawingManager({
  contextUserLayerDataType,
  activeTool,
  brushData,
  hsl,
  alpha,
  setDrawingData,
  canvasRef,
  fabricCanvasRef,
  scale,
}: UseDrawingManagerProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([]);
  const [drawingLayerName, setDrawingLayerName] = useState<string | null>(null);
  const [tempPathObj, setTempPathObj] = useState<fabric.Path | null>(null);

  // 드로잉 시작
  const handleCanvasPointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!contextUserLayerDataType || activeTool !== 'pen') return;
    // Drawing 레이어, 선택되어 있는 레이어를 찾는다
    const selectedLayer = contextUserLayerDataType.find(layer => layer.active && layer.LayerType === 'Drawing');
    if (!selectedLayer) return;
    const pointer = getPointerFromEvent(e, canvasRef, scale);
    if (!pointer) return;
    setIsDrawing(true);
    setDrawingPoints([pointer]);
    setDrawingLayerName(selectedLayer.id);
  }, [contextUserLayerDataType, activeTool, canvasRef, scale]);

  // 드로잉 중 이동
  const handleCanvasPointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pointer = getPointerFromEvent(e, canvasRef, scale);
    if (!pointer) return;
    setDrawingPoints(prev => [...prev, pointer]);
  }, [isDrawing, canvasRef, scale]);

  // 드로잉 끝
  const handleCanvasPointerUp = useCallback(() => {
    if (!isDrawing || !drawingLayerName || drawingPoints.length < 2) {
      setIsDrawing(false);
      setDrawingPoints([]);
      setDrawingLayerName(null);
      return;
    }
    if (setDrawingData) {
      setDrawingData((prev: ListDrawingItem) => {
        const newId = `drawing-${Date.now()}`;
        const newDrawing: DrawingItem = {
          id: newId,
          brushType: 'test',
          jsonData: {
            points: drawingPoints,
            options: {
              stroke: hslToHex(hsl.h, hsl.s, hsl.l),
              strokeWidth: brushData.brushSize,
              strokeLineCap: 'round',
              strokeLineJoin: 'round',
              fill: '',
              left: Math.min(...drawingPoints.map(p => p.x)) - brushData.brushSize / 2,
              top: Math.min(...drawingPoints.map(p => p.y)) - brushData.brushSize / 2,
              width: Math.max(...drawingPoints.map(p => p.x)) - Math.min(...drawingPoints.map(p => p.x)) + brushData.brushSize,
              height: Math.max(...drawingPoints.map(p => p.y)) - Math.min(...drawingPoints.map(p => p.y)) + brushData.brushSize,
              angle: 0,
              scaleX: 1,
              scaleY: 1,
              opacity: alpha,
            }
          }
        };
        
        return {
          ...prev,
          [drawingLayerName]: [
            ...(prev[drawingLayerName]),
            newDrawing
          ]
        };
      });
    }
    setIsDrawing(false);
    setDrawingPoints([]);
    setDrawingLayerName(null);
  }, [isDrawing, drawingLayerName, drawingPoints, setDrawingData]);

  // 드로잉 중일 때 임시 path를 캔버스에 실시간으로 표시
  useEffect(() => {
    if (!fabricCanvasRef?.current) return;
    
    // 드로잉 중이고, 포인트가 2개 이상일 때만
    if (isDrawing && drawingPoints.length > 1) {
      // points -> pathData 변환
      const pathData = pointsToPathData(drawingPoints);
      
      // 기존 임시 path가 있으면 제거
      if (tempPathObj) {
        fabricCanvasRef.current.remove(tempPathObj);
      }
      
      // 새로운 Path 객체 생성
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
      
      // 새로운 Path 객체 추가
      fabricCanvasRef.current.add(newPathObj);
      setTempPathObj(newPathObj);
      
      fabricCanvasRef.current.requestRenderAll();
    } else if (!isDrawing && tempPathObj) {
      // 드로잉이 끝나면 임시 path 제거
      fabricCanvasRef.current.remove(tempPathObj);
      setTempPathObj(null);
    }
  }, [brushData, isDrawing, drawingPoints, fabricCanvasRef]); // tempPathObj 의존성 제거

  return {
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp
  };
}