import * as fabric from 'fabric';

import type { ImgDataItem } from '../../../../types/types';

// Canvas에 _aspectRects 속성 추가를 위한 타입 확장
declare module 'fabric' {
  interface Canvas {
    _imgLayers?: Map<string, fabric.FabricImage>;
  }
}

class ImgLayerManager {
  private canvas: fabric.Canvas;
  private imgMap: Map<string, fabric.FabricImage>;
  private scaleX: number;
  private scaleY: number;

  constructor(canvas: fabric.Canvas, scale: { scaleX: number, scaleY: number }) {
    this.canvas = canvas;
    if (!canvas._imgLayers) {
      canvas._imgLayers = new Map();
    }
    this.imgMap = canvas._imgLayers;
    this.scaleX = scale.scaleX;
    this.scaleY = scale.scaleY;
  }

  private async createImg(
    id: string,
    imgData: ImgDataItem,
    active: boolean,
    visible: boolean,
    onImgTransform?: (top: number, left: number, width: number, height: number, angle: number) => void
  ): Promise<void> {
    try { 
      // URL이 이미 전체 경로인지 확인하고 처리
      const fullUrl = imgData.url.startsWith('http') ? imgData.url : `http://localhost:5173${imgData.url}`;
      const img = await fabric.FabricImage.fromURL(fullUrl);

      img.set({
        left: imgData.left * this.scaleX,
        top: imgData.top * this.scaleY,
        scaleX: imgData.scaleX * this.scaleX,
        scaleY: imgData.scaleY * this.scaleY,
        angle: imgData.angle,
        selectable: active,
        evented: active,
        visible: visible,
      });

      if (onImgTransform) {
        img.on('modified', () => {
          onImgTransform(
            img.top,
            img.left,
            img.scaleX,
            img.scaleY,
            img.angle
          );
        });
      }
      
      this.canvas.add(img);
      this.imgMap.set(id, img);
      this.canvas.renderAll();
    } catch (e) {
      console.log('실패', imgData.url, e);
    }
  }

  private updateImg(img: fabric.FabricImage, imgData: ImgDataItem, active: boolean, visible: boolean, zIndex:number): void {
    img.set({
      left: imgData.left * this.scaleX,
      top: imgData.top * this.scaleY,
      scaleX: imgData.scaleX * this.scaleX,
      scaleY: imgData.scaleY * this.scaleY,
      selectable: active,
      evented: active,
      visible: visible,
    });
    this.canvas.moveObjectTo(img, zIndex)
    this.canvas.renderAll();
  }

  // 특정 이미지만 제거하는 메서드
  private removeImg(imgId: string): void {
    const img = this.imgMap.get(imgId);
    if (img) {
      this.canvas.remove(img);
      this.imgMap.delete(imgId);
    }
  }

  // 모든 이미지를 제거하는 메서드
  private removeAllImgs(): void {
    for (const img of this.imgMap.values()) {
      this.canvas.remove(img);
    }
    this.imgMap.clear();
  }

  async syncImgs(
    imgData: ImgDataItem,
    onImgTransform: (top: number, left:number, width:number, height:number, angle: number) => void,
    active: boolean,
    visible: boolean,
    zIndex: number
  ): Promise<void> {
    const img = this.imgMap.get(imgData.id);
    if (!img) {
      await this.createImg(imgData.id, imgData, active, visible, onImgTransform);
    } else {
      this.updateImg(img, imgData, active, visible, zIndex);
    }
  }

  // 특정 이미지 제거
  removeImgById(imgId: string): void {
    this.removeImg(imgId);
  }

  // 모든 이미지 제거
  clearAllImgs(): void {
    this.removeAllImgs();
  }
}


export async function syncImgLayers(
  canvas: fabric.Canvas,
  imgData: ImgDataItem,
  onImgTransform: (top: number, left:number, width:number, height:number, angle: number) => void,
  active: boolean,
  visible: boolean,
  zIndex: number,
  scale: { scaleX: number, scaleY: number }
) {
  const manager = new ImgLayerManager(canvas, scale);
  await manager.syncImgs(imgData, onImgTransform, active, visible, zIndex);
}

// canvas와 id로 이미지를 삭제하는 export 함수
export function removeImgById(canvas: fabric.Canvas, imgId: string) {
  if (canvas._imgLayers) {
    const imgMap = canvas._imgLayers as Map<string, fabric.FabricImage>;
    const img = imgMap.get(imgId);
    console.log(img);
    console.log(canvas._imgLayers, imgId);
    
    if (img) {
      canvas.remove(img);
      imgMap.delete(imgId);
      canvas.renderAll();
    }
  }
}

