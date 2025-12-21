import '../../../styles/PhotoShoot/ImageGenerator/ImageGenerator.css'

import { useContext, useState, useEffect } from 'react';
import PhotoCaptureContext from "../../../contexts/PhotoCaptureContextType.ts"
import LoadingSpinner from '../../LoadingSpinner.tsx';
import { useCanvasDrawer } from './useCanvasDrawer.ts';
import { useGifComposer } from './useGifComposer.ts';
import { useImageLoader } from './useImageLoader.ts'; // 새로 만든 훅 import
import { PrintControls } from './PrintControls.tsx';
import { QrResult } from './QrResult.tsx';
import type { ImgPlaceData } from '../../../types/types.ts';

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

  // 1. 이미지 리소스 통합 로딩 (중복 로딩 방지)
  const { frameImg, slotImages, isLoading: imagesLoading } = useImageLoader(frameUrl, imgPlaceData);

  // 3. 화면 표시용 움직이는 캔버스 (즉시 재생) & GIF Blob 생성
  const { canvasRef: previewCanvasRef, generateGifBlob, isReady } = useGifComposer(frameImg, slotImages, imgPlaceData);

  // 2. 인쇄용 정적 캔버스 (숨김 처리) & 정적 이미지 Blob 생성 함수
  const { canvasRef: printCanvasRef, generateStaticBlob } = useCanvasDrawer(frameImg, slotImages, imgPlaceData);

  const isLoading = imagesLoading; // 프레임 로드만 완료되면 즉시 표시 (GIF는 점진적으로 로딩)

  const [printCount, setPrintCount] = useState(2);
  const [isPrinting, setIsPrinting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 미리 생성된 Blob을 저장할 상태
  const [preGeneratedGifBlob, setPreGeneratedGifBlob] = useState<Blob | null>(null);
  const [preGeneratedStaticBlob, setPreGeneratedStaticBlob] = useState<Blob | null>(null);

  // 백그라운드에서 Blob 미리 생성 (GIF 디코딩 완료 후 시작)
  useEffect(() => {
    let isCancelled = false;

    // GIF 디코딩이 완료(isReady)되고, 아직 Blob을 안 만들었으면 시작
    if (isReady && !isLoading) {
        
        // 1. GIF 생성 (독립 실행)
        const runGifGen = async () => {
            // 이미 생성된 상태면 스킵 (리렌더링 시 중복 실행 방지)
            if (preGeneratedGifBlob) return; 
            
            try {
                // console.log("Starting background GIF generation...");
                const gifBlob = await generateGifBlob();
                if (!isCancelled && gifBlob) {
                    setPreGeneratedGifBlob(gifBlob);
                    // console.log("GIF Blob pre-generated successfully");
                }
            } catch (e) {
                console.warn("Background GIF generation failed", e);
            }
        };

        // 2. 정적 이미지 생성 (독립 실행)
        const runStaticGen = async () => {
            // 이미 생성된 상태면 스킵
            if (preGeneratedStaticBlob) return; 

            try {
                // console.log("Starting background Static Image generation...");
                const staticBlob = await generateStaticBlob();
                if (!isCancelled && staticBlob) {
                    setPreGeneratedStaticBlob(staticBlob);
                    // console.log("Static Blob pre-generated successfully");
                }
            } catch (e) {
                console.warn("Background Static generation failed", e);
            }
        };

        // 메인 스레드 안정을 위해 아주 약간만 대기 후 동시 시작
        const timer = setTimeout(() => {
            if (isCancelled) return;
            
            // 상태가 없을 때만 실행하도록 한 번 더 체크
            if (!preGeneratedGifBlob) runGifGen();
            if (!preGeneratedStaticBlob) runStaticGen();
        }, 100);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };
    }
  }, [isReady, isLoading, preGeneratedGifBlob, preGeneratedStaticBlob, generateGifBlob, generateStaticBlob]);

  /**
   * 인쇄 버튼 클릭 시 호출되는 함수입니다.
   * GIF와 정적 이미지를 Blob으로 생성하여 서버에 인쇄 요청을 보냅니다.
   */
  const handlePrint = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    setErrorMsg(null);
    
    try {
        // 1. GIF Blob 준비 (미리 생성된 것 우선 사용)
        let gifBlob = preGeneratedGifBlob;
        if (!gifBlob) {
            console.log("Generating GIF on demand...");
            gifBlob = await generateGifBlob();
        }
        if (!gifBlob) throw new Error("GIF 생성을 실패했습니다.");

        // 2. 정적 이미지 Blob 준비 (미리 생성된 것 우선 사용)
        let staticBlob = preGeneratedStaticBlob;
        if (!staticBlob) {
             console.log("Generating Static Image on demand...");
             staticBlob = await generateStaticBlob();
        }

        if (!staticBlob) throw new Error("이미지 생성을 실패했습니다.");

        // 3. 서버 전송
        const imageUrl = await printImage(printCount, staticBlob, gifBlob);
        setQrCodeUrl(imageUrl);

    } catch (error: unknown) {
        console.error("인쇄 실패:", error);
        if (error instanceof Error) {
            setErrorMsg(error.message);
        } else {
            setErrorMsg('알 수 없는 에러가 발생했습니다.');
        }
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
        
        {/* 화면 표시용: 움직이는 캔버스 */}
        <canvas 
            ref={previewCanvasRef} 
            style={{ 
                visibility: isLoading ? 'hidden' : 'visible',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
            }} 
        />
        
        {/* 인쇄용: 정적 고화질 캔버스 (숨김) */}
        <canvas 
            ref={printCanvasRef} 
            style={{ display: 'none' }} 
        />
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
                        isPreparing={!preGeneratedGifBlob || !preGeneratedStaticBlob}
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