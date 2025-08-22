import type { RefObject } from "react";

/**
 * 캔버스 커서로 
 * @param e Mouse, Touch - 이벤트
 * @param canvasRef 캔버스 ref
 * @param scale 화면 scale - 줌
 * @returns {x, y} 변환된 좌표
 */

export function getPointerFromEvent(e: React.MouseEvent | React.TouchEvent, canvasRef: RefObject<HTMLCanvasElement | null>, scale: number) {
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