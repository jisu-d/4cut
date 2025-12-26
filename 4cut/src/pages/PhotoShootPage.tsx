
import "../styles/PhotoShoot/PhotoShootPage.css";
import ImageComposer from "../components/PhotoShoot/FrameComposer/FrameComposer.tsx";
import PhotoCapture from "../components/PhotoShoot/PhotoCapture/PhotoCapture.tsx";
import FrameSelection from  "../components/PhotoShoot/FrameSelection/FrameSelection.tsx"
import ImageGenerator from "../components/PhotoShoot/ImageGenerator/ImageGenerator.tsx"

// import test_img from "../assets/test/all_test.png"

import {useMemo, useState} from 'react';
import PhotoCaptureContext from '../contexts/PhotoCaptureContextType.ts';
import type {CaptureImageData, ImgPlaceData, PhotoCaptureContextType, ModeType} from '../types/types.ts';

function PhotoShootPage() {
  const [mode, setMode] = useState<ModeType>('frame');
  const [url, seturl] = useState<string>('');



  const [captureImageData, setCaptureImgData] = useState<CaptureImageData[]>([])

  const [imgPlaceData, setImgPlaceData] = useState<ImgPlaceData[]>([]);

  const updateSlotImage = (index: number, image: string | null, gifBlob?: Blob | null) => {
    setImgPlaceData(prevData =>
      prevData.map((slot, i) => (i === index ? { ...slot, imgSrc: image, gifBlob: gifBlob ?? null } : slot))
    );
  };

  const renderCurrentStep  = () => {
    switch (mode) {
      case "frame":
        return <FrameSelection />
      case "capture":
        return <PhotoCapture />
      case "compose":
        return <ImageComposer />
      case "generator":
        return <ImageGenerator />
      default:
        return (<div>오류다 시발아</div>)
    }
  }

  const contextValue: PhotoCaptureContextType = useMemo(() => ({
    Mode: {
      mode: mode,
      setmode: setMode,
    },
    CaptureImgData: {
      captureImageData: captureImageData,
      setCaptureImgData: setCaptureImgData,
    },
    FrameData: {
      url: url,
      seturl: seturl,
      ImgPlaceData: {
        imgPlaceData: imgPlaceData,
        setimageData: setImgPlaceData,
      },
      updateSlotImage: updateSlotImage,
    },
  }), [
    mode,
    captureImageData,
    imgPlaceData,
  ])

  return (
    <PhotoCaptureContext.Provider value={contextValue}>
      {renderCurrentStep()}
    </PhotoCaptureContext.Provider>
  );
}

export default PhotoShootPage;
