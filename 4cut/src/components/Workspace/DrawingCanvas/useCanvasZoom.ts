import {useCallback, useEffect, useState} from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface UseCanvasZoomOptions {
  minScale?: number;
  maxScale?: number;
  zoomSpeed?: number;
}

export const useCanvasZoom = (options: UseCanvasZoomOptions = {}) => {
  const {
    minScale = 0.1,
    maxScale = 5,
    zoomSpeed = 0.1
  } = options;

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);

  // 두 터치 포인트 간의 거리 계산
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // 터치 이벤트 핸들러 (모바일)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 두 손 터치: 캔버스 이동 모드
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
      setLastTouchDistance(getTouchDistance(e.touches));
    }
  }, [position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && isDragging) {
      // 두 손 터치: 캔버스 이동 + 핀치 줌
      e.preventDefault();
      
      // 캔버스 이동
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
      
      // 핀치 줌
      const currentDistance = getTouchDistance(e.touches);
      if (lastTouchDistance > 0) {
        const scaleFactor = currentDistance / lastTouchDistance;
        setScale(prev => Math.max(minScale, Math.min(maxScale, prev * scaleFactor)));
      }
      setLastTouchDistance(currentDistance);
    }
  }, [lastTouchDistance, isDragging, dragStart, minScale, maxScale]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setLastTouchDistance(0);
    }
  }, [isDragging]);

  // 마우스 이벤트 핸들러 (PC)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) { // 중간 클릭 (스크롤 클릭)
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      // 중간 클릭 드래그: 캔버스 이동
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) { // 중간 클릭 해제
      setIsDragging(false);
    }
  }, []);

  // 마우스 휠 줌
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? (1 - zoomSpeed) : (1 + zoomSpeed);
    setScale(prev => Math.max(minScale, Math.min(maxScale, prev * delta)));
  }, [zoomSpeed, minScale, maxScale]);

  // 리셋 함수
  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // 키보드 이벤트 (Ctrl + 0으로 리셋)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '0' && e.ctrlKey) {
        e.preventDefault();
        resetView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetView]);

  return {
    scale,
    position,
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    resetView
  };
}; 