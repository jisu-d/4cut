import { useCallback, useEffect, useState } from 'react';

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
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  // 터치 이벤트 핸들러 (모바일)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
   //e.preventDefault(); // 기본 터치 동작 방지
    
    if (e.touches.length === 2) {
      // 두 손 터치: 핀치 줌 + 패닝 시작
      setIsDragging(false); // 단일 터치 드래그 비활성화
      setLastTouchDistance(getTouchDistance(e.touches));
      setLastTouchCenter(getTouchCenter(e.touches));
    } else {
      // 한 손 터치: 패닝 비활성화 (두 손으로만 조작)
      setIsDragging(false);
      setLastTouchDistance(0);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    //e.preventDefault(); // 기본 터치 동작 방지
    
    if (e.touches.length === 2) {
      // 두 손 터치: 핀치 줌 + 패닝
      const currentDistance = getTouchDistance(e.touches);
      const currentCenter = getTouchCenter(e.touches);
      
      if (lastTouchDistance > 0) {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        
        // 줌 처리
        const scaleFactor = currentDistance / lastTouchDistance;
        const newScale = Math.max(minScale, Math.min(maxScale, scale * scaleFactor));
        
        // 터치 중심점을 기준으로 줌
        const touchX = currentCenter.x - rect.left;
        const touchY = currentCenter.y - rect.top;
        
        // 논리 좌표(캔버스 내부 좌표계)
        const logicalX = (touchX - position.x) / scale;
        const logicalY = (touchY - position.y) / scale;
        
        // 패닝 처리 (터치 중심점 이동)
        const centerDeltaX = currentCenter.x - lastTouchCenter.x;
        const centerDeltaY = currentCenter.y - lastTouchCenter.y;
        
        setScale(newScale);
        setPosition(prevPosition => ({
          x: touchX - logicalX * newScale + centerDeltaX,
          y: touchY - logicalY * newScale + centerDeltaY,
        }));
        
        setLastTouchDistance(currentDistance);
        setLastTouchCenter(currentCenter);
      }
    }
  }, [lastTouchDistance, lastTouchCenter, minScale, maxScale, scale, position]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    //e.preventDefault(); // 기본 터치 동작 방지
    
    setIsDragging(false);
    setLastTouchDistance(0);
    setLastTouchCenter({ x: 0, y: 0 });
  }, []);

  // 마우스 이벤트 핸들러 (PC)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 중간 클릭(휠 클릭)으로만 드래그 시작
    if (e.button === 1) {
      //e.preventDefault(); // 기본 마우스 동작 방지
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) {
      setIsDragging(false);
    }
  }, []);

  // 마우스 휠 줌
  const handleWheel = useCallback((e: React.WheelEvent) => {
    //e.preventDefault(); // 기본 스크롤 동작 방지
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? (1 - zoomSpeed) : (1 + zoomSpeed);

    setScale(prevScale => {
        const newScale = Math.max(minScale, Math.min(maxScale, prevScale * delta));

        setPosition(prevPosition => {
            const logicalX = (mouseX - prevPosition.x) / prevScale;
            const logicalY = (mouseY - prevPosition.y) / prevScale;

            return {
                x: mouseX - logicalX * newScale,
                y: mouseY - logicalY * newScale,
            };
        });

        return newScale;
    });
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
        //e.preventDefault();
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
    resetView,
  };
};