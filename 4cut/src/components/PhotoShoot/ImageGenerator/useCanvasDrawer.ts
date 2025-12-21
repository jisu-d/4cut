import { useRef, useEffect, useCallback } from 'react';
import type { ImgPlaceData } from "../../../types/types.ts";

export const useCanvasDrawer = (
    frameImg: HTMLImageElement | null, 
    slotImages: (HTMLImageElement | null)[], 
    imgPlaceData: ImgPlaceData[]
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 최신 데이터를 저장할 Refs (함수 재생성 방지용)
  const latestDataRef = useRef({
      frameImg,
      slotImages,
      imgPlaceData
  });

  useEffect(() => {
      latestDataRef.current = { frameImg, slotImages, imgPlaceData };
  }, [frameImg, slotImages, imgPlaceData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frameImg) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = frameImg.naturalWidth;
    canvas.height = frameImg.naturalHeight;

    // 1. 슬롯 이미지 그리기 (프레임 뒤에)
    imgPlaceData.forEach((data, index) => {
        const img = slotImages[index];
        if (img) {
            ctx.drawImage(img, data.left, data.top, data.width, data.height);
        }
    });

    // 2. 프레임 그리기
    ctx.drawImage(frameImg, 0, 0);

  }, [frameImg, slotImages, imgPlaceData]);

  // 정적 이미지 Blob 생성 함수 (Worker 위임) - 참조값 고정
  const generateStaticBlob = useCallback((): Promise<Blob | null> => {
      // Ref에서 최신 데이터 가져오기
      const { frameImg, slotImages, imgPlaceData } = latestDataRef.current;

      if (!frameImg) return Promise.resolve(null);

      return new Promise(async (resolve, reject) => {
          try {
              // 1. Worker에 보낼 데이터 준비 (비트맵 변환)
              const frameBitmap = await createImageBitmap(frameImg);
              const slotBitmaps = await Promise.all(
                  slotImages.map(async (img) => {
                      return img ? await createImageBitmap(img) : null;
                  })
              );

              // 2. Worker 생성 및 요청
              const worker = new Worker(new URL('./blobGenerator.worker.ts', import.meta.url), { type: 'module' });
              
              worker.onmessage = (e) => {
                  const { success, blob, error } = e.data;
                  if (success) {
                      resolve(blob);
                  } else {
                      console.error("Worker Static gen failed:", error);
                      resolve(null);
                  }
                  worker.terminate();
                  
                  // 리소스 해제
                  frameBitmap.close();
                  slotBitmaps.forEach(bmp => bmp && bmp.close());
              };

              worker.onerror = (err: ErrorEvent) => {
                  console.error("Worker Error:", err);
                  reject(err);
                  worker.terminate();
              };

              worker.postMessage({
                  type: 'GENERATE_STATIC',
                  frameBitmap,
                  slotBitmaps,
                  gifFrames: [], // 정적 생성에는 필요 없음
                  imgPlaceData: imgPlaceData
              });

          } catch (e: unknown) {
              console.error("Static Blob setup failed", e);
              resolve(null);
          }
      });
  }, []); // 의존성 없음 (Ref 사용)

  return { canvasRef, generateStaticBlob };
};
