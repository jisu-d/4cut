import { useCallback, useEffect, useRef, useState } from 'react';

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
  const dragStartRef = useRef<Position>({ x: 0, y: 0 });
  const lastTouchDistanceRef = useRef(0);
  const lastTouchCenterRef = useRef<Position>({ x: 0, y: 0 });

  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const positionRef = useRef(position);
  positionRef.current = position;


  const getTouchDistance = (touches: React.TouchList) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const getTouchCenter = (touches: React.TouchList) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // e.preventDefault();
    if (e.touches.length === 2) {
      setIsDragging(false);
      lastTouchDistanceRef.current = getTouchDistance(e.touches);
      lastTouchCenterRef.current = getTouchCenter(e.touches);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // e.preventDefault();
    if (e.touches.length !== 2) return;

    const currentDistance = getTouchDistance(e.touches);
    const currentCenter = getTouchCenter(e.touches);
    const lastTouchDistance = lastTouchDistanceRef.current;

    if (lastTouchDistance > 0) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      
      // --- Zoom Logic ---
      const scaleFactor = currentDistance / lastTouchDistance;
      const newScale = Math.max(minScale, Math.min(maxScale, scaleRef.current * scaleFactor));

      // --- Panning + Zooming Logic ---
      const zoomCenterX = currentCenter.x - rect.left;
      const zoomCenterY = currentCenter.y - rect.top;

      // The logical coordinates (where on the "infinite" canvas the zoom is happening)
      const logicalX = (zoomCenterX - positionRef.current.x) / scaleRef.current;
      const logicalY = (zoomCenterY - positionRef.current.y) / scaleRef.current;

      // Pan delta from the movement of the center of the two fingers
      const panDeltaX = currentCenter.x - lastTouchCenterRef.current.x;
      const panDeltaY = currentCenter.y - lastTouchCenterRef.current.y;

      // Calculate the new position
      const newPosX = zoomCenterX - logicalX * newScale + panDeltaX;
      const newPosY = zoomCenterY - logicalY * newScale + panDeltaY;

      setScale(newScale);
      setPosition({ x: newPosX, y: newPosY });

      lastTouchDistanceRef.current = currentDistance;
      lastTouchCenterRef.current = currentCenter;
    }
  }, [minScale, maxScale]);

  const handleTouchEnd = useCallback(() => {
    // e.preventDefault();
    setIsDragging(false);
    lastTouchDistanceRef.current = 0;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      // e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - positionRef.current.x,
        y: e.clientY - positionRef.current.y,
      };
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  }, [isDragging]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) {
      setIsDragging(false);
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // e.preventDefault();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? (1 - zoomSpeed) : (1 + zoomSpeed);

    const currentScale = scaleRef.current;
    const newScale = Math.max(minScale, Math.min(maxScale, currentScale * delta));

    const currentPosition = positionRef.current;
    const logicalX = (mouseX - currentPosition.x) / currentScale;
    const logicalY = (mouseY - currentPosition.y) / currentScale;

    const newPosition = {
      x: mouseX - logicalX * newScale,
      y: mouseY - logicalY * newScale,
    };

    setScale(newScale);
    setPosition(newPosition);

  }, [zoomSpeed, minScale, maxScale]);

  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        // e.preventDefault();
        resetView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetView]);

  return {
    scale,
    position,
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
