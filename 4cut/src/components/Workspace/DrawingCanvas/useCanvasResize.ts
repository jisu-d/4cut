import {useCallback, useEffect, useRef, useState} from 'react';

export interface CanvasSize {
  width: number;
  height: number;
}

export interface UseCanvasResizeOptions {
  aspectRatio?: number; // 기본값 4:3 (800/600)
  maxSizeRatio?: number; // 컨테이너 대비 최대 크기 비율 (기본값 0.8)
  minWidth?: number; // 최소 너비
  minHeight?: number; // 최소 높이
}

export const useCanvasResize = (
  options: UseCanvasResizeOptions = {}
) => {
  const {
    aspectRatio = 800 / 600, // 4:3 비율
    maxSizeRatio = 0.8,
    minWidth = 200,
    minHeight = 150
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ 
    width: 800, 
    height: 600 
  });

  const updateCanvasSize = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // 컨테이너 크기의 지정된 비율로 제한
      const maxWidth = containerWidth * maxSizeRatio;
      const maxHeight = containerHeight * maxSizeRatio;

      // 원본 비율 유지하면서 크기 조정
      let newWidth = maxWidth;
      let newHeight = maxWidth / aspectRatio;

      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = maxHeight * aspectRatio;
      }

      // 최소 크기 보장
      newWidth = Math.max(newWidth, minWidth);
      newHeight = Math.max(newHeight, minHeight);

      setCanvasSize({ width: newWidth, height: newHeight });
    }
  }, [aspectRatio, maxSizeRatio, minWidth, minHeight]);

  useEffect(() => {
    updateCanvasSize();
    
    // 리사이즈 이벤트 리스너 추가
    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener('resize', handleResize);
    
    // ResizeObserver를 사용하여 컨테이너 크기 변화 감지 (선택사항)
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [aspectRatio, maxSizeRatio, minWidth, minHeight, updateCanvasSize]);

  return {
    containerRef,
    canvasSize,
    updateCanvasSize
  };
}; 