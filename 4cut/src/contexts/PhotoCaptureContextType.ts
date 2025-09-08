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
        imgPlaceData: [],
        setImgPlaceData: () => {},
        selectedSlotIndex: null,
        setSelectedSlotIndex: () => {},
        updateSlotImage: () => {},
    }
});

export default PhotoCaptureContext;