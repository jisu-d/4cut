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
        const container = scrollContainerRef.current;
        if (!container) return;

        const updatePadding = () => {
            const firstItem = container.querySelector('.grid-item') as HTMLElement;
            if (firstItem && firstItem.offsetWidth > 0) {
                const containerWidth = container.offsetWidth;
                const itemWidth = firstItem.offsetWidth;
                
                // [수정] 중앙 정렬을 위한 양옆 패딩 계산
                // 컨테이너 중앙 - 아이템 중앙 = 필요한 패딩
                const padding = (containerWidth / 2) - (itemWidth / 2);
                setPaddingWidth(padding > 0 ? padding : 0);
            }
        };

        const observer = new ResizeObserver(() => {
            window.requestAnimationFrame(updatePadding);
        });

        observer.observe(container);

        // [추가] 첫 번째 아이템도 관찰하여 이미지 로드 등으로 크기가 변할 때 대응
        const firstItem = container.querySelector('.grid-item');
        if (firstItem) {
            observer.observe(firstItem);
        }
        
        // 초기 실행
        updatePadding();

        return () => {
            observer.disconnect();
        };
    }, [imageDataList]);

    // Effect to scroll the current item to the center
    useEffect(() => {
        const container = scrollContainerRef.current;
        // [수정] 빈 div가 제거되었으므로 인덱스는 currentPhotoIndex 그대로 사용
        if (container && container.children.length > currentPhotoIndex) {
            const currentItem = container.children[currentPhotoIndex] as HTMLElement;
            if (currentItem) {
                const containerWidth = container.offsetWidth;
                const currentItemWidth = currentItem.offsetWidth;
                const currentItemLeft = currentItem.offsetLeft;

                // padding이 적용된 상태에서의 스크롤 위치 계산
                // currentItemLeft는 padding을 포함한 위치이므로 보정 필요
                // 하지만 scrollLeft 설정 시에는 컨테이너 내부 좌표 기준이므로 단순 계산 가능
                // (아이템 중앙 - 컨테이너 중앙) 을 맞추기 위해 scrollLeft 조정
                
                // 패딩으로 인해 스크롤 가능 영역이 늘어남.
                // 중앙 정렬 공식: (아이템의 왼쪽 위치) - (화면 중앙) + (아이템 절반)
                const scrollLeft = currentItemLeft - (containerWidth / 2) + (currentItemWidth / 2);

                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }
    }, [currentPhotoIndex, paddingWidth]); // paddingWidth가 변하면 스크롤도 다시 맞춰야 함

    return (
        <div 
            className='image-grid-container' 
            ref={scrollContainerRef}
            style={{ 
                paddingLeft: `${paddingWidth}px`, 
                paddingRight: `${paddingWidth}px` 
            }}
        >
            {/* [수정] 빈 div 제거됨 */}
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
            {/* [수정] 빈 div 제거됨 */}
        </div>
    );
}

export default ImageGrid;