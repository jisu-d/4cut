import { useState, useCallback, useEffect } from 'react';
import type { RefObject } from 'react';
import type {DrawingItem, ListDrawingItem, UserLayerDataType, BrushData, HSL, BrushType} from '../../../../types/types';
import * as fabric from 'fabric';

import { createImageStampGroup, addImageStampToGroup } from './imageStampBrush.ts';
import {brushType} from "../../../../assets/brush/brushType.ts";

interface UseDrawingManagerProps {
  contextUserLayerDataType: UserLayerDataType[] | undefined;
  activeTool: string;
  brushData: BrushData;
  hsl: HSL;
  alpha: number;
  setDrawingData?: React.Dispatch<React.SetStateAction<ListDrawingItem>>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  contextfabricCanvasRef?: RefObject<fabric.Canvas | null>;
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
  contextfabricCanvasRef,
  scale,
}: UseDrawingManagerProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([]);
  const [drawingLayerName, setDrawingLayerName] = useState<string | null>(null);
  const [tempPathObj, setTempPathObj] = useState<fabric.Path | fabric.Group | null>(null);
  const [matchedBrush, setMatchedBrush] = useState<BrushType | null>(null);

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
    // brushType이 pen이 아니면 matchedBrush를 찾아서 저장
    if (brushData.brushType !== 'pen') {
      const found = brushType.find(b => b.brushType === brushData.brushType) || null;
      setMatchedBrush(found);
    } else {
      setMatchedBrush(null);
    }
  }, [contextUserLayerDataType, activeTool, canvasRef, scale, brushData.brushType]);

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
    if (!contextfabricCanvasRef?.current) return;
    
    const drawAsync = async () => {
      // 드로잉 중이고, 포인트가 2개 이상일 때만
      if (isDrawing && drawingPoints.length > 1) {

        // 기존 임시 path가 있으면 제거
        if (tempPathObj && contextfabricCanvasRef.current) {
          contextfabricCanvasRef.current.remove(tempPathObj);
        }
        
        // TODO brushData.brushType 따라서 브러시 실시간 표시 구현 완료
        // 하지만 최적화 필요....ㅜㅜㅜ
        if(brushData.brushType == 'pen'){
          // points -> pathData 변환
          const pathData = pointsToPathData(drawingPoints);

          if (contextfabricCanvasRef.current) {
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

            contextfabricCanvasRef.current.add(newPathObj);
            setTempPathObj(newPathObj);
          }
        } else {
          // 이미지 스탬프 브러시 처리
          if (contextfabricCanvasRef.current) {
            // 그룹이 없으면 새로 생성 (마우스 다운 시점)
            if (brushData.brushType !== 'pen' && !matchedBrush) return;
            if (!tempPathObj) {
              const group = await createImageStampGroup(
                drawingPoints[0],
                matchedBrush!,
                {
                  stroke: hslToHex(hsl.h, hsl.s, hsl.l),
                  strokeWidth: brushData.brushSize,
                  opacity: alpha,
                }
              );
              contextfabricCanvasRef.current.add(group);
              setTempPathObj(group);
            } else{
              for (let i = (tempPathObj as fabric.Group)._objects.length; i < drawingPoints.length; i++) {
                await addImageStampToGroup(
                  (tempPathObj as fabric.Group),
                  drawingPoints[i],
                  matchedBrush!,
                  {
                    stroke: hslToHex(hsl.h, hsl.s, hsl.l),
                    strokeWidth: brushData.brushSize,
                    opacity: alpha,
                  }
                );
              }
              contextfabricCanvasRef.current?.remove(tempPathObj as fabric.Group);
              contextfabricCanvasRef.current?.add(tempPathObj as fabric.Group);
              contextfabricCanvasRef.current?.requestRenderAll();
            }
          }
        }
      } else if (!isDrawing && tempPathObj) {
        // 드로잉이 끝나면 임시 path 제거
        if (contextfabricCanvasRef.current) {
          contextfabricCanvasRef.current.remove(tempPathObj);
        }
        setTempPathObj(null);
      }
    };

    drawAsync();
  }, [isDrawing, drawingPoints, contextfabricCanvasRef, brushData.brushType, matchedBrush]);

  return {
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp
  };
}