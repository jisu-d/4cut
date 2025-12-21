import { useState, useEffect } from 'react';
import type { ImgPlaceData } from '../../../types/types';

export interface LoadedImages {
    frameImg: HTMLImageElement | null;
    slotImages: (HTMLImageElement | null)[];
    isLoading: boolean;
}

export const useImageLoader = (frameUrl: string, imgPlaceData: ImgPlaceData[]): LoadedImages => {
    const [images, setImages] = useState<LoadedImages>({
        frameImg: null,
        slotImages: [],
        isLoading: true
    });

    useEffect(() => {
        let isCancelled = false;

        const loadImages = async () => {
            if (!frameUrl) {
                setImages(prev => ({ ...prev, isLoading: false }));
                return;
            }

            try {
                // 1. 프레임 이미지 로드 (가장 중요: 이것만 되면 화면 표시 가능)
                const frameImg = new Image();
                frameImg.crossOrigin = "anonymous";
                frameImg.src = frameUrl;
                await frameImg.decode();

                if (isCancelled) return;

                // 프레임 로드 완료 시 1차 상태 업데이트 (로딩 해제)
                setImages(prev => ({
                    ...prev,
                    frameImg,
                    isLoading: false
                }));

                // 2. 슬롯 이미지들 로드 (비동기, 천천히 되어도 됨)
                const slotImages = await Promise.all(imgPlaceData.map(async (slot) => {
                    if (slot.imgSrc) {
                        const img = new Image();
                        img.crossOrigin = "anonymous";
                        img.src = slot.imgSrc;
                        try {
                            await img.decode();
                            return img;
                        } catch (e) {
                            console.error("Failed to decode slot image", e);
                            return null;
                        }
                    }
                    return null;
                }));

                if (isCancelled) return;

                // 슬롯 이미지 로드 완료 시 2차 상태 업데이트
                setImages(prev => ({
                    ...prev,
                    slotImages
                }));

            } catch (error) {
                console.error("Failed to load images:", error);
                if (!isCancelled) {
                    setImages(prev => ({ ...prev, isLoading: false }));
                }
            }
        };

        loadImages();

        return () => { isCancelled = true; };
    }, [frameUrl, imgPlaceData]);

    return images;
};
