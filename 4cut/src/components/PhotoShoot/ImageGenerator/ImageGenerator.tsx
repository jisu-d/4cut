import '../../../styles/PhotoShoot/ImageGenerator/ImageGenerator.css'

import { useContext, useState } from 'react';
import PhotoCaptureContext from "../../../contexts/PhotoCaptureContextType.ts"
import LoadingSpinner from '../../LoadingSpinner.tsx';
import { useCanvasDrawer } from './useCanvasDrawer.ts';
import { PrintControls } from './PrintControls.tsx';
import { QrResult } from './QrResult.tsx';
import type { ImgPlaceData } from '../../../types/types.ts'; // ImgPlaceData 타입 임포트

import { printImage } from './printApi.ts';

/**
 * 최종 합성된 이미지를 사용자에게 보여주고 인쇄 관련 기능을 제공하는 컴포넌트입니다.
 * 캔버스에 프레임과 사진을 합성하고, 인쇄 수량 선택 및 실제 인쇄 요청을 처리하며,
 * 인쇄 후에는 QR 코드 이미지를 표시합니다.
 */
const ImageGenerator = () => {
  const { FrameData, CaptureImgData, Mode } = useContext(PhotoCaptureContext);
  const { url: frameUrl, ImgPlaceData: frameImgPlaceData, seturl } = FrameData;
  const { imgPlaceData, setimageData } = frameImgPlaceData;
  const { setCaptureImgData } = CaptureImgData;
  const { setmode } = Mode;

  const { canvasRef, isLoading } = useCanvasDrawer(frameUrl, imgPlaceData);

  const [printCount, setPrintCount] = useState(2);
  const [isPrinting, setIsPrinting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /**
   * 인쇄 버튼 클릭 시 호출되는 함수입니다.
   * 캔버스 이미지를 Base64로 변환하여 서버에 인쇄 요청을 보냅니다.
   */
  const handlePrint = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    setErrorMsg(null);
    
    const canvas = canvasRef.current;
    if (!canvas) {
        setErrorMsg("캔버스를 찾을 수 없습니다.");
        setIsPrinting(false);
        return;
    }

    const base64_data = canvas.toDataURL('image/jpeg');

    try {
        const imageUrl = await printImage(printCount, base64_data);
        setQrCodeUrl(imageUrl);
    } catch (error: any) {
        console.error("인쇄 실패:", error);
        setErrorMsg(error.message || '서버 응답 없음');
    } finally {
        setIsPrinting(false);
    }
  };

  /**
   * 인쇄 수량을 변경하는 함수입니다.
   * @param delta - 변경할 수량 (예: +1, -1)
   */
  const handleCountChange = (delta: number) => {
    setPrintCount(prev => {
      const newCount = prev + delta;
      return newCount < 1 ? 1 : newCount > 10 ? 10 : newCount;
    });
  };

  /**
   * 인쇄 상태를 초기화하고 처음 단계로 돌아가는 함수입니다.
   */
  const resetPrint = () => {
      setQrCodeUrl(null);
      setPrintCount(2);
      setErrorMsg(null);
  }

  /**
   * 홈(프레임 선택)으로 돌아가는 함수입니다.
   * 모든 컨텍스트 데이터를 초기화하고 모드를 frame으로 변경합니다.
   */
  const handleGoHome = () => {
    seturl('');
    setimageData([] as ImgPlaceData[]);
    setCaptureImgData([]);
    setmode('frame');
  };

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
                    onHome={handleGoHome}
                />
            ) : (
                <>
                    {errorMsg && <div className="error-msg" style={{color: '#ff4d4f', marginBottom: '1rem', fontWeight: 'bold'}}>{errorMsg}</div>}
                    <PrintControls 
                        count={printCount} 
                        isPrinting={isPrinting} 
                        onCountChange={handleCountChange} 
                        onPrint={handlePrint} 
                    />
                </>
            )
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;