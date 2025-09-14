import * as fabric from 'fabric';
import type { BrushData, DrawingItem } from '../../../../types/types'

// 이미지 캐시 맵 (원본 이미지)
const imageCache = new Map<string, HTMLImageElement>();
// 틴트된 이미지 캐시 맵 (색상별로 캐시)
const tintedImageCache = new Map<string, HTMLImageElement>();

// 두 점 사이를 일정 간격으로 보간하는 함수
function interpolatePoints(points: { x: number, y: number }[], minDist: number = 5): { x: number, y: number }[] {
  if (points.length < 2) return points;
  const result: { x: number, y: number }[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.floor(dist / minDist);
    for (let s = 1; s <= steps; s++) {
      result.push({
        x: prev.x + (dx * s) / (steps + 1),
        y: prev.y + (dy * s) / (steps + 1),
      });
    }
    result.push(curr);
  }
  return result;
}

// loadedImage의 검정색 부분을 원하는 색상으로 바꿔주는 함수
function tintImage(
  image: HTMLImageElement,
  color: string,
  threshold: number = 50
): HTMLImageElement {
  const cacheKey = `${image.src}-${color}-${threshold}`;
  if (tintedImageCache.has(cacheKey)) {
    return tintedImageCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // hex 색상 → rgb 변환
  const hexToRgb = (hex: string) => {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };
  const { r: tr, g: tg, b: tb } = hexToRgb(color);

  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a > 0 && r < threshold && g < threshold && b < threshold) {
      data[i] = tr;
      data[i + 1] = tg;
      data[i + 2] = tb;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  const tintedImg = new window.Image();
  tintedImg.src = canvas.toDataURL();
  tintedImageCache.set(cacheKey, tintedImg);
  return tintedImg;
}

// 이미지 로딩을 Promise로 처리하는 함수
async function loadImage(brushType: BrushData): Promise<HTMLImageElement> {
  if (imageCache.has(brushType.brushType)) {
    return imageCache.get(brushType.brushType)!;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(brushType.brushType, img);
      resolve(img);
    };
    img.onerror = (e) => reject(new Error(`이미지 로드 실패: ${brushType.brushPath}, ${e}`));
    img.src = brushType.brushPath;
  });
}

export async function imageStampBrush(
  drawingData: DrawingItem,
  brushtype: BrushData,
): Promise<fabric.Group> {
  const strokeWidth = drawingData.jsonData.options.strokeWidth ?? 20;
  const minDist: number = strokeWidth * 0.7;

  const images: fabric.FabricImage[] = [];
  // 이미지 로딩 (비동기 처리)
  const loadedImage = await loadImage(brushtype);

  // 보간된 좌표 사용
  const densePoints = interpolatePoints(drawingData.jsonData.points, minDist);

  const stroke = drawingData.jsonData.options.stroke as string;
  const tintedImage = tintImage(loadedImage, stroke);

  const maxOriginalSize = Math.max(tintedImage.width, tintedImage.height);
  const penSize = strokeWidth;
  const alpha = drawingData.jsonData.options.opacity;
  const scaleFactor = penSize / maxOriginalSize;

  for (const coord of densePoints) {
    const fabricImage = new fabric.FabricImage(tintedImage, {
      left: coord.x,
      top: coord.y ,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      scaleX: scaleFactor,
      scaleY: scaleFactor,
      opacity: alpha,
    });
    images.push(fabricImage);
  }

  return new fabric.Group(images, {
    hasControls: true,
    hasBorders: true,
    selectable: true,
    evented: true,
  });
}

// 드로잉 전용 - 그룹 생성 (마우스 다운)
export async function createImageStampGroup(
  startPoint: { x: number, y: number },
  brush: BrushData,
  options: { stroke: string, strokeWidth: number, opacity: number }
): Promise<fabric.Group> {
  const loadedImage = await loadImage(brush);
  const tintedImage = tintImage(loadedImage, options.stroke);

  const maxOriginalSize = Math.max(tintedImage.width, tintedImage.height);
  const penSize = options.strokeWidth;
  const scaleFactor = penSize / maxOriginalSize;

  const fabricImage = new fabric.FabricImage(tintedImage, {
    left: startPoint.x,
    top: startPoint.y,
    originX: 'center',
    originY: 'center',
    selectable: false,
    evented: false,
    scaleX: scaleFactor,
    scaleY: scaleFactor,
    opacity: options.opacity,
  });

  return new fabric.Group([fabricImage], {
    hasControls: true,
    hasBorders: true,
    selectable: true,
    evented: true,
  });
}

// 그룹에 이미지 추가 (마우스 무브)
export async function addImageStampToGroup(
  group: fabric.Group,
  newPoint: { x: number, y: number },
  lastPoint: { x: number, y: number }, // 이전 포인트를 인자로 추가
  brush: BrushData,
  options: { stroke: string, strokeWidth: number, opacity: number }
): Promise<void> {
  const loadedImage = await loadImage(brush);
  const tintedImage = tintImage(loadedImage, options.stroke);

  const maxOriginalSize = Math.max(tintedImage.width, tintedImage.height);
  const penSize = options.strokeWidth;
  const scaleFactor = penSize / maxOriginalSize;
  const minDist = penSize * 0.7;

  // 이전 점과 현재 점 사이를 보간
  const pointsToDraw = interpolatePoints([lastPoint, newPoint], minDist);

  // 보간된 각 점에 이미지 추가 (첫 번째 점은 이미 그려졌으므로 건너뜀)
  for (let i = 1; i < pointsToDraw.length; i++) {
    const point = pointsToDraw[i];
    const fabricImage = new fabric.FabricImage(tintedImage, {
      left: point.x,
      top: point.y,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      scaleX: scaleFactor,
      scaleY: scaleFactor,
      opacity: options.opacity,
    });
    group.add(fabricImage);
  }

  group.setCoords();
}