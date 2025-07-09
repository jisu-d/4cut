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
  const [lastTouchCenter, setLastTouchCenter] = useState<Position>({ x: 0, y: 0 });

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

  // 두 터치 포인트의 중심점 계산
  const getTouchCenter = (touches: React.TouchList) => {
    if (touches.length < 2) return { x: 0, y: 0 };
    const touch1 = touches[0];
    const touch2 = touches[1];
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  // 터치 이벤트 핸들러 (모바일)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 두 손 터치: 캔버스 이동 모드
      
      setIsDragging(true);
      const touchCenter = getTouchCenter(e.touches);
      setDragStart({
        x: touchCenter.x - position.x,
        y: touchCenter.y - position.y
      });
      setLastTouchDistance(getTouchDistance(e.touches));
      setLastTouchCenter(touchCenter);
    }
  }, [position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && isDragging) {
      // 두 손 터치: 캔버스 이동 + 핀치 줌
      
      const currentCenter = getTouchCenter(e.touches);
      const currentDistance = getTouchDistance(e.touches);
      
      // 핀치 줌 (두 손가락 중심점 기준)
      if (lastTouchDistance > 0) {
        const scaleFactor = currentDistance / lastTouchDistance;
        const newScale = Math.max(minScale, Math.min(maxScale, scale * scaleFactor));
        
        // 터치 중심점을 기준으로 줌
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const touchX = currentCenter.x - rect.left;
        const touchY = currentCenter.y - rect.top;
        
        // 논리 좌표(캔버스 내부 좌표계)
        const logicalX = (touchX - position.x) / scale;
        const logicalY = (touchY - position.y) / scale;
        
        setScale(newScale);
        setPosition({
          x: touchX - logicalX * newScale,
          y: touchY - logicalY * newScale,
        });
      } else {
        // 캔버스 이동 (줌이 없을 때)
        setPosition({
          x: currentCenter.x - dragStart.x,
          y: currentCenter.y - dragStart.y
        });
      }
      
      setLastTouchDistance(currentDistance);
      setLastTouchCenter(currentCenter);
    }
  }, [lastTouchDistance, isDragging, dragStart, minScale, maxScale, scale, position]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setLastTouchDistance(0);
      setLastTouchCenter({ x: 0, y: 0 });
    }
  }, [isDragging]);

  // 마우스 이벤트 핸들러 (PC)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) { // 중간 클릭 (스크롤 클릭)
      
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

  // 마우스 휠 줌 (이미 마우스 위치 기준으로 구현됨)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setScale(prevScale => {
      const delta = e.deltaY > 0 ? (1 - zoomSpeed) : (1 + zoomSpeed);
      const newScale = Math.max(minScale, Math.min(maxScale, prevScale * delta));
      // 논리 좌표(캔버스 내부 좌표계)
      const logicalX = (mouseX - position.x) / prevScale;
      const logicalY = (mouseY - position.y) / prevScale;
      setPosition({
        x: mouseX - logicalX * newScale,
        y: mouseY - logicalY * newScale,
      });
      return newScale;
    });
  }, [zoomSpeed, minScale, maxScale, position]);

  // 리셋 함수
  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // 키보드 이벤트 (Ctrl + 0으로 리셋)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '0' && e.ctrlKey) {
        
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