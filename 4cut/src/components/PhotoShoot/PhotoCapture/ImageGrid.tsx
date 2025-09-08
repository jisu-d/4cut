import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import '../../../styles/PhotoShoot/PhotoCapture/ImageGrid.css';

import type { CaptureImageData } from '../../../types/types.ts';

interface ImageGridProps {
    imageDataList: CaptureImageData[];
    currentPhotoIndex: number;
}

function ImageGrid({ imageDataList, currentPhotoIndex }: ImageGridProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [paddingWidth, setPaddingWidth] = useState(0);

    useLayoutEffect(() => {
        const calculatePadding = () => {
            const container = scrollContainerRef.current;
            // Ensure we have items to measure. We check for > 2 because of the padding divs.
            if (container && container.children.length > 0) {
                const firstItem = container.querySelector('.grid-item') as HTMLElement;
                if (!firstItem) return;

                const containerWidth = container.offsetWidth;
                const itemWidth = firstItem.offsetWidth;
                
                const padding = (containerWidth / 2) - (itemWidth / 2);
                setPaddingWidth(padding > 0 ? padding : 0);
            }
        };

        // Calculate padding initially and on window resize.
        calculatePadding();
        window.addEventListener('resize', calculatePadding);
        return () => window.removeEventListener('resize', calculatePadding);
    }, [imageDataList]); // Rerun if the list changes, in case items appear asynchronously

    // Effect to scroll the current item to the center
    useEffect(() => {
        const container = scrollContainerRef.current;
        // Target item is at index currentPhotoIndex + 1 because of the starting padding div
        if (container && container.children.length > currentPhotoIndex + 1) {
            const currentItem = container.children[currentPhotoIndex + 1] as HTMLElement;
            if (currentItem) {
                const containerWidth = container.offsetWidth;
                const currentItemWidth = currentItem.offsetWidth;
                const currentItemLeft = currentItem.offsetLeft;

                const scrollLeft = currentItemLeft + (currentItemWidth / 2) - (containerWidth / 2);

                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }
    }, [currentPhotoIndex]);

    return (
        <div className='image-grid-container' ref={scrollContainerRef}>
            <div style={{ flex: '0 0 auto', width: paddingWidth }} />
            {imageDataList.map((imageData) => (
                <div 
                    key={imageData.id} 
                    className='grid-item' 
                    style={{ aspectRatio: imageData.ratio.replace(':', '/') }}
                >
                    {
                        imageData.base64Img ? (
                            <img
                                alt={`${imageData.id}번째로 촬영된 사진`}
                                src={imageData.base64Img}
                            ></img>
                        ) : (
                            // Placeholder with the same aspect ratio, but as a simple div
                            <div>{imageData.ratio}</div>
                        )
                    }
                </div>
            ))}
            <div style={{ flex: '0 0 auto', width: paddingWidth }} />
        </div>
    );
}

export default ImageGrid;