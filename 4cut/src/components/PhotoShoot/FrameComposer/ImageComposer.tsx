import React, {useContext, useLayoutEffect, useMemo, useRef, useState} from 'react';
import '../../../styles/PhotoShoot/FrameComposer/ImageComposer.css';
import PhotoCaptureContext from "../../../contexts/PhotoCaptureContextType.ts";
import { frameMeta, artworks } from '../FrameSelection/FrameData.ts'; // frameMeta와 artworks import

const ImageComposer = () => {
    const { FrameData } = useContext(PhotoCaptureContext);
    const { imgPlaceData } = FrameData.ImgPlaceData;

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);
    const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number } | null>(null);

    const handleImageLoad = () => {
        if (imageRef.current) {
            const { naturalWidth, naturalHeight } = imageRef.current;
            setNaturalDimensions({ width: naturalWidth, height: naturalHeight });
        }
    };

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setContainerDimensions({ width, height });
            }
        });

        resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    }, []);

    // 현재 프레임의 ID를 URL을 통해 역추적
    const currentFrameId = useMemo(() => {
        if (!FrameData.url || artworks.length === 0) return null;
        const artwork = artworks.find(art => art.frameUrl === FrameData.url);
        return artwork ? String(artwork.id) : null;
    }, [FrameData.url]);

    // frameMeta에서 프레임의 방향 정보 가져오기
    const isFrameLandscape = useMemo(() => {
        if (!currentFrameId) return false;
        return frameMeta[currentFrameId]?.orientation === 'landscape';
    }, [currentFrameId]);

    const layout = useMemo(() => {
        if (!naturalDimensions || !containerDimensions) {
            return null;
        }

        const { width: naturalWidth, height: naturalHeight } = naturalDimensions;
        const { width: containerWidth, height: containerHeight } = containerDimensions;

        let scale;
        // 프레임이 가로형으로 지정되어 회전될 경우, 스케일 계산 시 너비와 높이를 교차 적용
        if (isFrameLandscape) {
             const widthScale = containerWidth / naturalHeight; // 컨테이너 너비를 프레임의 원본 높이에 맞춤
             const heightScale = containerHeight / naturalWidth; // 컨테이너 높이를 프레임의 원본 너비에 맞춤
             scale = Math.min(widthScale, heightScale);
        } else {
             // 그 외의 경우 (세로형 프레임 등)는 일반적인 스케일링
             const widthScale = containerWidth / naturalWidth;
             const heightScale = containerHeight / naturalHeight;
             scale = Math.min(widthScale, heightScale);
        }

        const wrapperWidth = Math.round(naturalWidth * scale);
        const wrapperHeight = Math.round(naturalHeight * scale);

        return { scale, wrapperWidth, wrapperHeight };
    }, [naturalDimensions, containerDimensions, isFrameLandscape]);

    return (
        <div ref={containerRef} className="image-composer-container">
            <div
                className="image-group-wrapper"
                style={{
                    width: layout ? `${layout.wrapperWidth}px` : '100%',
                    height: layout ? `${layout.wrapperHeight}px` : '100%',
                    opacity: layout ? 1 : 0,
                    transition: 'opacity 0.2s',
                    // 프레임이 가로형으로 지정된 경우 전체를 -90도 회전
                    transform: isFrameLandscape ? 'rotate(-90deg)' : 'none',
                    transformOrigin: 'center center',
                }}
            >
                <img
                    ref={imageRef}
                    src={FrameData.url}
                    onLoad={handleImageLoad}
                    className="frame-image"
                    style={{ zIndex: 10 }}
                    alt="Photo Frame"
                />

                {layout && imgPlaceData.map((item, index) => {
                    let adjustedLeft = item.left;
                    let adjustedTop = item.top;

                    // 90도 또는 270도(-90도) 회전 시 좌표 보정 (이 로직은 item.angle에 따라 동작)
                    if (item.angle && Math.abs(item.angle) % 180 === 90) {
                        const xOffset = (item.height - item.width) / 2;
                        const yOffset = (item.width - item.height) / 2;
                        adjustedLeft += xOffset;
                        adjustedTop += yOffset;
                    }

                    const style: React.CSSProperties = {
                        position: 'absolute',
                        left: `${Math.round(adjustedLeft * layout.scale)}px`,
                        top: `${Math.round(adjustedTop * layout.scale)}px`,
                        width: `${Math.round(item.width * layout.scale)}px`,
                        height: `${Math.round(item.height * layout.scale)}px`,
                        zIndex: 2,
                        transform: `rotate(${item.angle || 0}deg)`,
                    };

                    return (
                        <div
                            key={index}
                            className="image-slot"
                            style={style}
                        >
                            {item.imgSrc ? (
                                <img src={item.imgSrc} alt={`User image ${index + 1}`} />
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ImageComposer;
