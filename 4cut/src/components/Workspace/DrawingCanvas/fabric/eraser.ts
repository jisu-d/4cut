import * as fabric from 'fabric';
import type { ListDrawingItem } from '../../../../types/types';

/**
 * 지우개 크기를 시각적으로 보여주는 원형 커서를 생성합니다.
 * @param size - 지우개 커서의 직경 (px)
 * @returns SVG 데이터 URL
 */

export function createEraserCursor(size: number): string {
  // 크기가 너무 작아도 최소 3px를 보장하여 유효한 원이 그려지도록 함
  const safeSize = Math.max(Math.round(size), 3);
  const strokeWidth = 1; // 커서 테두리 두께
  const half = safeSize / 2;
  // 반지름은 전체 크기에서 테두리 두께를 뺀 후 절반
  const radius = (safeSize - strokeWidth) / 2; 

  const circle = `
    <svg
      width="${safeSize}"
      height="${safeSize}"
      viewBox="0 0 ${safeSize} ${safeSize}"
    >
      <circle
        cx="${half}"
        cy="${half}"
        r="${radius}"
        fill="rgba(255, 255, 255, 0.5)" // 반투명 흰색 채우기
        stroke="black"
        stroke-width="${strokeWidth}"
      />
    </svg>
  `;
  const encodedSvg = encodeURIComponent(circle);
  return `data:image/svg+xml,${encodedSvg}`;
}