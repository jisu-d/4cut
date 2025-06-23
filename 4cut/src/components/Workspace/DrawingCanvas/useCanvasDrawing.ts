import {useCallback, useRef, useState} from 'react';

export interface UseCanvasDrawingOptions {
  strokeColor?: string;
  strokeWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
}

export const useCanvasDrawing = (options: UseCanvasDrawingOptions = {}) => {
  const {
    strokeColor = '#000',
    strokeWidth = 2,
    lineCap = 'round',
    lineJoin = 'round'
  } = options;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // 줌과 패닝을 고려한 캔버스 좌표 변환
  const getCanvasCoordinates = useCallback((
    e: React.TouchEvent | React.MouseEvent, 
    scale: number,
    canvasSize: { width: number; height: number }
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    
    // 클라이언트 좌표
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const rect = canvas.getBoundingClientRect();
    
    // 캔버스 컨테이너 기준 좌표
    const containerX = clientX - rect.left;
    const containerY = clientY - rect.top;
    // 1051.15283203125 61.11111068725586
    
    // transform-origin: center center를 고려한 역변환
    // CSS transform: translate(position.x, position.y) scale(scale)
    // transform-origin: center center
    
    // 1. 컨테이너 중앙점 계산
    const containerCenterX = rect.width / 2;
    const containerCenterY = rect.height / 2;
    
    // 2. 중앙점 기준 상대 좌표
    const relativeX = containerX - containerCenterX;
    const relativeY = containerY - containerCenterY;
    
    // 3. transform 역변환 (순서: scale -> translate)
    // scale을 먼저 제거
    const scaledX = relativeX / scale;
    const scaledY = relativeY / scale;

    //여기까지는 정상
    
    // translate를 더함 (패닝)
    const untransformedX = scaledX;
    const untransformedY = scaledY;
    
    // 4. 캔버스 중앙점 기준 좌표로 변환
    const canvasCenterX = canvasSize.width / 2;
    const canvasCenterY = canvasSize.height / 2;
    const canvasX = untransformedX + canvasCenterX;
    const canvasY = untransformedY + canvasCenterY;
    
    // 5. 캔버스의 실제 크기와 표시 크기의 비율
    const scaleRatioX = canvas.width / canvasSize.width;
    const scaleRatioY = canvas.height / canvasSize.height;
    
    // 6. 최종 캔버스 좌표
    const finalX = canvasX * scaleRatioX;
    const finalY = canvasY * scaleRatioY;
    
    return { x: finalX, y: finalY };
  }, []);

  const handleDrawingStart = useCallback((
    e: React.TouchEvent | React.MouseEvent,
    scale: number,
    canvasSize: { width: number; height: number }
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);

    // 정확한 캔버스 좌표 계산
    const { x, y } = getCanvasCoordinates(e, scale, canvasSize);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = strokeColor;
    
    // 줌에 따라 선 두께 조정
    const scaleRatioX = canvas.width / canvasSize.width;
    ctx.lineWidth = (strokeWidth / scale) * scaleRatioX;
    ctx.lineCap = lineCap;
    ctx.lineJoin = lineJoin;
  }, [strokeColor, strokeWidth, lineCap, lineJoin, getCanvasCoordinates]);

  const handleDrawingMove = useCallback((
    e: React.TouchEvent | React.MouseEvent,
    scale: number,
    canvasSize: { width: number; height: number }
  ) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 정확한 캔버스 좌표 계산
    const { x, y } = getCanvasCoordinates(e, scale, canvasSize);

    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing, getCanvasCoordinates]);

  const handleDrawingEnd = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
  }, []);

  // 캔버스 초기화
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  // 그리기 설정 변경
  const updateDrawingSettings = useCallback((newOptions: Partial<UseCanvasDrawingOptions>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (newOptions.strokeColor) {
      ctx.strokeStyle = newOptions.strokeColor;
    }
    if (newOptions.strokeWidth) {
      ctx.lineWidth = newOptions.strokeWidth;
    }
    if (newOptions.lineCap) {
      ctx.lineCap = newOptions.lineCap;
    }
    if (newOptions.lineJoin) {
      ctx.lineJoin = newOptions.lineJoin;
    }
  }, []);

  return {
    canvasRef,
    isDrawing,
    handleDrawingStart,
    handleDrawingMove,
    handleDrawingEnd,
    clearCanvas,
    updateDrawingSettings
  };
}; 