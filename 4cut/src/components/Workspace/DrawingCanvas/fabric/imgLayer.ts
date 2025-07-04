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

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    if (!(canvas as any)._imgLayers) {
      (canvas as any)._imgLayers = new Map();
    }
    this.imgMap = (canvas as any)._imgLayers;
  }

  private async createImg(
    id: string,
    imgData: ImgDataItem,
    active: boolean,
    visible: boolean,
    zIndex:number,
    onImgTransform?: (top: number, left: number, width: number, height: number, angle: number) => void
  ): Promise<void> {
    try {
      const img = await fabric.FabricImage.fromURL('http://localhost:5173' + imgData.url);

      // 캔버스 크기
      const canvasWidth = this.canvas.getWidth();
      const canvasHeight = this.canvas.getHeight();

      // 이미지 원본 크기
      const imgWidth = img.width ?? 1;
      const imgHeight = img.height ?? 1;

      // 캔버스에 맞는 최대 스케일 계산
      const scaleX = Math.min(1, canvasWidth / imgWidth);
      const scaleY = Math.min(1, canvasHeight / imgHeight);
      // 비율 유지해서 최대한 맞춤
      const scale = Math.min(scaleX, scaleY);

      //센터
      // (canvasWidth - imgWidth * scale) / 2
      // (canvasHeight - imgHeight * scale) / 2

      img.set({
        left: imgData.left,
        top: imgData.top,
        scaleX: scale,
        scaleY: scale,
        angle: imgData.angle,
        selectable: active,
        evented: active,
        visible: visible,
      });

      if (onImgTransform) {
        img.on('modified', () => {
          onImgTransform(
            img.top ?? 0,
            img.left ?? 0,
            img.scaleX,
            img.scaleY,
            img.angle ?? 0
          );
        });
      }
      this.canvas.add(img);
      this.imgMap.set(id, img);
      this.canvas.renderAll();
    } catch (e) {
      console.log('실패');
    }
  }

  private updateImg(img: fabric.FabricImage, active: boolean, visible: boolean, zIndex:number): void {
    img.set({
      selectable: active,
      evented: active,
      visible: visible,
    });
    this.canvas.moveObjectTo(img, zIndex)
    //img.setCoords();
    this.canvas.renderAll();
  }

  private removeUnusedImgs(currentImgId: string): void {
    for (const [id, img] of this.imgMap.entries()) {
      if (id !== currentImgId) {
        this.canvas.remove(img);
        this.imgMap.delete(id);
      }
    }
  }

  async syncImgs(
    imgData: ImgDataItem,
    onImgTransform: (top: number, left:number, width:number, height:number, angle: number) => void,
    active: boolean,
    visible: boolean,
    zIndex: number
  ): Promise<void> {
    this.removeUnusedImgs(imgData.id);
    let img = this.imgMap.get(imgData.id);

    if (!img) {
      await this.createImg(imgData.id, imgData, active, visible, zIndex, onImgTransform);
      
    } else {
      this.updateImg(img, active, visible, zIndex);
    }
  }
}

export async function syncImgLayers(
  canvas: fabric.Canvas,
  imgData: ImgDataItem,
  onImgTransform: (top: number, left:number, width:number, height:number, angle: number) => void,
  active: boolean,
  visible: boolean,
  zIndex: number
) {
  const manager = new ImgLayerManager(canvas);
  await manager.syncImgs(imgData, onImgTransform, active, visible, zIndex);
}

