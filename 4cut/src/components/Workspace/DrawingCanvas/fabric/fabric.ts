import * as fabric from 'fabric';

export function createFabricCanvas(
  canvasEl: HTMLCanvasElement,
  width: number,
  height: number,
  backgroundColor: string
): fabric.Canvas {
  const canvas = new fabric.Canvas(canvasEl, {
    width,
    height,
    backgroundColor,
  });
  canvas.selection = true; // 선택 박스 활성화
  return canvas;
}

// 배경색 동기화 함수
export function syncFabricBackgroundColor(canvas: fabric.Canvas, color: string) {
  canvas.backgroundColor = color;
  canvas.renderAll();
} 