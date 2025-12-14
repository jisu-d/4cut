import React from 'react';

import type {PhotoCaptureContextType} from '../types/types'

// 기본값 정의
const PhotoCaptureContext = React.createContext<PhotoCaptureContextType>({
    CaptureImgData: {
        captureImageData: [],
        setCaptureImgData: () => {}
    },
    FrameData: {
        url: '',
        seturl: () => {},
        ImgPlaceData: {
            imgPlaceData: [],
            setimageData: () => {}
        },
        updateSlotImage: () => {},
    },
    Mode: {
        mode: 'frame',
        setmode: () => {}
    }
});

export default PhotoCaptureContext;