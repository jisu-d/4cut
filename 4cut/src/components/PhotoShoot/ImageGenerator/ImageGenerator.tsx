import '../../../styles/PhotoShoot/ImageGenerator/ImageGenerator.css'

import { useRef, useEffect, useContext, useState } from 'react';
import PhotoCaptureContext from "../../../contexts/PhotoCaptureContextType.ts"
import type {ImgPlaceData} from "../../../types/types.ts"
import LoadingSpinner from '../../LoadingSpinner.tsx';

import test_qr from '../../../assets/test/test_qr.png'
import PrintIcon from '../../../assets/Icon/PhotoShoot/print.svg?react'

const ImageGenerator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { FrameData } = useContext(PhotoCaptureContext);
  const { url: frameUrl, ImgPlaceData } = FrameData;
  const { imgPlaceData } = ImgPlaceData;
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


  // 이미지 다운로드 테스트 사용
  // const downloadImage = () => {
  //   const canvas = canvasRef.current;
  //   if (!canvas) return;
  //
  //   const imageURL = canvas.toDataURL('image/png');
  //
  //   const link = document.createElement('a');
  //   link.download = '4cut-image.png';
  //   link.href = imageURL;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  return (
    <div className='image-Generator-container'>
      <div className='generator-canvas-wrapper'>
        {isLoading && <LoadingSpinner />}
        <canvas ref={canvasRef} style={{ visibility: isLoading ? 'hidden' : 'visible' }} />
      </div>
      <div className='generator-wrapper'>
        <div className='QR-wrapper'>
          <span>QR 이미지 다운로드</span>
          <img src={test_qr} alt='QR'></img>
        </div>
        <div className='print-wrapper'>
          <div>프린트</div>
          <PrintIcon />
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
