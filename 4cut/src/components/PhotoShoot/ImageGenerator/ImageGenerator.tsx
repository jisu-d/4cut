import '../../../styles/PhotoShoot/ImageGenerator/ImageGenerator.css'

import { useContext, useState } from 'react';
import PhotoCaptureContext from "../../../contexts/PhotoCaptureContextType.ts"
import LoadingSpinner from '../../LoadingSpinner.tsx';
import { useCanvasDrawer } from './useCanvasDrawer.ts';
import { PrintControls } from './PrintControls.tsx';
import { QrResult } from './QrResult.tsx';

import test_qr from '../../../assets/test/test_qr.png'

const ImageGenerator = () => {
  const { FrameData } = useContext(PhotoCaptureContext);
  const { url: frameUrl, ImgPlaceData } = FrameData;
  const { imgPlaceData } = ImgPlaceData;

  const { canvasRef, isLoading } = useCanvasDrawer(frameUrl, imgPlaceData);

  const [printCount, setPrintCount] = useState(2);
  const [isPrinting, setIsPrinting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const handlePrint = () => {
    if (isPrinting) return;
    setIsPrinting(true);
    
    // API 통신 시뮬레이션
    setTimeout(() => {
      setQrCodeUrl(test_qr);
      setIsPrinting(false);
    }, 1500);
  };

  const handleCountChange = (delta: number) => {
    setPrintCount(prev => {
      const newCount = prev + delta;
      return newCount < 1 ? 1 : newCount > 10 ? 10 : newCount;
    });
  };

  const resetPrint = () => {
      setQrCodeUrl(null);
      setPrintCount(2);
  }

  return (
    <div className='image-Generator-container'>
      <div className='generator-canvas-wrapper'>
        {isLoading && <LoadingSpinner />}
        <canvas ref={canvasRef} style={{ visibility: isLoading ? 'hidden' : 'visible' }} />
      </div>
      <div className='generator-wrapper'>
        {!isLoading && (
            qrCodeUrl ? (
                <QrResult 
                    qrUrl={qrCodeUrl} 
                    printCount={printCount} 
                    onReset={resetPrint} 
                />
            ) : (
                <PrintControls 
                    count={printCount} 
                    isPrinting={isPrinting} 
                    onCountChange={handleCountChange} 
                    onPrint={handlePrint} 
                />
            )
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;