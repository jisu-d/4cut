import * as fabric from 'fabric';
import type { BrushType, DrawingItem } from '../../../../types/types'

// 이미지 캐시 맵 추가
const imageCache = new Map<string, HTMLImageElement>();

// 두 점 사이를 일정 간격으로 보간하는 함수
function interpolatePoints(points: {x: number, y: number}[], minDist: number = 5): {x: number, y: number}[] {
  if (points.length < 2) return points;
  const result: {x: number, y: number}[] = [points[0]];
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
  threshold: number = 50 // 검정색 판정 임계값 (0~255)
): HTMLImageElement {
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
    // 검정색(혹은 어두운 부분)만 색 변경
    const [r, g, b, a] = [data[i], data[i+1], data[i+2], data[i+3]];
    if (a > 0 && r < threshold && g < threshold && b < threshold) {
      data[i] = tr;
      data[i+1] = tg;
      data[i+2] = tb;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // canvas를 다시 이미지로 변환
  const tintedImg = new window.Image();
  tintedImg.src = canvas.toDataURL();
  return tintedImg;
}

export async function imageStampBrush(
    drawingData: DrawingItem,
    brushtype: BrushType,
  ): Promise<fabric.Group> {
    // strokeWidth 값에 따라 minDist를 동적으로 조절
    const strokeWidth = drawingData.jsonData.options.strokeWidth ?? 20;
    // TODO -> 굵기에 따라 얼마나 촘촘이 할지 결정
    const minDist: number = strokeWidth * 0.7

    const images: fabric.FabricImage[] = [];
    // 이미지 캐시 사용
    let loadedImage: HTMLImageElement;
    if (imageCache.has(brushtype.brushType)) {
      loadedImage = imageCache.get(brushtype.brushType)!;
    } else {
      loadedImage = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          imageCache.set(brushtype.brushType, img);
          resolve(img);
        };
        img.onerror = (e) => reject(new Error(`이미지 로드 실패: ${brushtype.brushPath}, ${e}`));
        img.src = brushtype.brushPath;
      });
    }
  
    // 보간된 좌표 사용
    const densePoints = interpolatePoints(drawingData.jsonData.points, minDist);

    const stroke = drawingData.jsonData.options.stroke as string;
    // loadedImage를 원하는 색상으로 변환
    // TODO 이미지 색상 변환 https://fabricjs.com/api/classes/fabricimage/ 참고 해봤지만 렉? 오류걸림?
    const tintedImage = tintImage(loadedImage, stroke);

    for (const coord of densePoints) {
      const maxOriginalSize = Math.max(tintedImage.width, tintedImage.height);
      const penSize = strokeWidth;
      const alpha = drawingData.jsonData.options.opacity ?? 1;
      const scaleFactor = penSize / maxOriginalSize;
  
      const fabricImage = new fabric.FabricImage(tintedImage, {
        left: coord.x,
        top: coord.y,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        scaleX:scaleFactor,
        scaleY:scaleFactor,
        opacity: alpha,
      });
      images.push(fabricImage);
    }

  
    // 이미지들을 그룹으로 묶음
    const group = new fabric.Group(images, {
      hasControls: true,
      hasBorders: true,
      selectable: true,
      evented: true,
    });
  
    return group;
  }




// 드로잉 전용
// 그룹 생성 (마우스 다운)
export function createImageStampGroup(
  startPoint: {x: number, y: number},
  brush: BrushType,
  options: { stroke: string, strokeWidth: number, opacity: number }
): fabric.Group {
  // 이미지 캐시 사용
  let loadedImage: HTMLImageElement;
  if (imageCache.has(brush.brushType)) {
    loadedImage = imageCache.get(brush.brushType)!;
  } else {
    loadedImage = new window.Image();
    loadedImage.src = brush.brushPath;
    imageCache.set(brush.brushType, loadedImage);
  }
  // 색상 변환
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
  const group = new fabric.Group([fabricImage], {
    hasControls: true,
    hasBorders: true,
    selectable: true,
    evented: true,
  });
  return group;
}

// 그룹에 이미지 추가 (마우스 무브)
export function addImageStampToGroup(
  group: fabric.Group,
  newPoint: {x: number, y: number},
  brush: BrushType,
  options: { stroke: string, strokeWidth: number, opacity: number }
): void {
  let loadedImage: HTMLImageElement;
  if (imageCache.has(brush.brushType)) {
    loadedImage = imageCache.get(brush.brushType)!;
  } else {
    loadedImage = new window.Image();
    loadedImage.src = brush.brushPath;
    imageCache.set(brush.brushType, loadedImage);
  }
  // 색상 변환
  const tintedImage = tintImage(loadedImage, options.stroke);
  const maxOriginalSize = Math.max(tintedImage.width, tintedImage.height);
  const penSize = options.strokeWidth;
  const scaleFactor = penSize / maxOriginalSize;

  const fabricImage = new fabric.FabricImage(tintedImage, {
    left: newPoint.x,
    top: newPoint.y,
    originX: 'center',
    originY: 'center',
    selectable: false,
    evented: false,
    scaleX: scaleFactor,
    scaleY: scaleFactor,
    opacity: options.opacity,
  });
  group.add(fabricImage);
  group.setCoords();
  if (group.canvas) {
    group.canvas.requestRenderAll();
  }
}