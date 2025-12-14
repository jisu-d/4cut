import { useRef, useEffect, useState } from 'react';
import type { ImgPlaceData } from "../../../types/types.ts";

export const useCanvasDrawer = (frameUrl: string, imgPlaceData: ImgPlaceData[]) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateImage = async () => {
      setIsLoading(true);
      const canvas = canvasRef.current;
      if (!canvas || !frameUrl || imgPlaceData.length === 0) {
        setIsLoading(false);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsLoading(false);
        return;
      }

      try {
        const frameImg = new Image();
        frameImg.crossOrigin = 'Anonymous';
        frameImg.src = frameUrl;
        await frameImg.decode();

        canvas.width = frameImg.naturalWidth;
        canvas.height = frameImg.naturalHeight;

        interface LoadedPhoto {
          img: HTMLImageElement;
          data: ImgPlaceData;
        }

        const photoPromises = imgPlaceData.map((data: ImgPlaceData) => {
          return new Promise<LoadedPhoto | null>((resolve, reject) => {
            if (!data.imgSrc) {
              resolve(null);
              return;
            }
            const photoImg = new Image();
            photoImg.crossOrigin = 'Anonymous';
            photoImg.src = data.imgSrc;
            photoImg.onload = () => resolve({ img: photoImg, data });
            photoImg.onerror = (err) => reject(err);
          });
        });

        const loadedPhotos = await Promise.all(photoPromises);

        loadedPhotos.filter((photo): photo is LoadedPhoto => photo !== null).forEach((photo) => {
            const { img, data } = photo;
            ctx.drawImage(img, data.left, data.top, data.width, data.height);
        });

        ctx.drawImage(frameImg, 0, 0);

      } catch (error) {
        console.error("이미지 생성에 실패했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };

    generateImage();
  }, [frameUrl, imgPlaceData]);

  return { canvasRef, isLoading };
};
