import { useState, useCallback, useEffect } from 'react';
import type { RefObject } from 'react';
import type { DrawingItem, ListDrawingItem, UserLayerDataType } from '../../../../types/types';
import * as fabric from 'fabric';

interface UseDrawingManagerProps {
  contextUserLayerDataType: UserLayerDataType[] | undefined;
  activeTool: string;
  setDrawingData?: React.Dispatch<React.SetStateAction<ListDrawingItem>>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  fabricCanvasRef?: React.MutableRefObject<fabric.Canvas | null>;
}

export function useDrawingManager({
  contextUserLayerDataType,
  activeTool,
  setDrawingData,
  canvasRef,
  fabricCanvasRef
}: UseDrawingManagerProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([]);
  const [drawingLayerName, setDrawingLayerName] = useState<string | null>(null);
  const [tempPathObj, setTempPathObj] = useState<fabric.Path | null>(null);

  // 드로잉 시작
  const handleCanvasPointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!contextUserLayerDataType || activeTool !== 'pen') return;
    const selectedLayer = contextUserLayerDataType.find(layer => layer.active && layer.LayerType === 'Drawing');
    if (!selectedLayer) return;
    let clientX, clientY;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setIsDrawing(true);
    setDrawingPoints([{ x, y }]);
    setDrawingLayerName(selectedLayer.text);
  }, [contextUserLayerDataType, activeTool, canvasRef]);

  // 드로잉 중 이동
  const handleCanvasPointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    let clientX, clientY;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setDrawingPoints(prev => [...prev, { x, y }]);
  }, [isDrawing, canvasRef]);

  // 드로잉 끝
  const handleCanvasPointerUp = useCallback(() => {
    if (!isDrawing || !drawingLayerName || drawingPoints.length < 2) {
      setIsDrawing(false);
      setDrawingPoints([]);
      setDrawingLayerName(null);
      return;
    }
    if (setDrawingData) {
      setDrawingData((prev: any) => {
        const newId = `drawing-${Date.now()}`;
        const newDrawing: DrawingItem = {
          id: newId,
          brushType: 'pen',
          jsonData: {
            points: drawingPoints,
            options: {
              stroke: 'black',
              strokeWidth: 2,
              fill: '',
              left: Math.min(...drawingPoints.map(p => p.x)),
              top: Math.min(...drawingPoints.map(p => p.y)),
              width: Math.max(...drawingPoints.map(p => p.x)) - Math.min(...drawingPoints.map(p => p.x)),
              height: Math.max(...drawingPoints.map(p => p.y)) - Math.min(...drawingPoints.map(p => p.y)),
              angle: 0,
              scaleX: 1,
              scaleY: 1,
            }
          }
        };
        return {
          ...prev,
          [drawingLayerName]: [
            ...(prev[drawingLayerName] || []),
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
      const pathData = `M ${drawingPoints[0].x} ${drawingPoints[0].y}` + drawingPoints.slice(1).map(p => ` L ${p.x} ${p.y}`).join('');
      let pathObj = tempPathObj;
      if (!pathObj) {
        pathObj = new fabric.Path(pathData, {
          stroke: 'black',
          strokeWidth: 2,
          fill: '',
          selectable: false,
          evented: false,
          opacity: 0.7
        });
        fabricCanvasRef.current.add(pathObj);
        setTempPathObj(pathObj);
      } else {
        pathObj.set({ path: fabric.util.parsePath(pathData) });
        fabricCanvasRef.current.requestRenderAll();
      }
    } else {
      // 드로잉이 끝나면 임시 path 제거
      if (tempPathObj && fabricCanvasRef.current) {
        fabricCanvasRef.current.remove(tempPathObj);
        setTempPathObj(null);
      }
    }
  }, [isDrawing, drawingPoints, tempPathObj, fabricCanvasRef]);

  return {
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp
  };
} 