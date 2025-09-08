import React, {useContext, useLayoutEffect, useMemo, useRef, useState} from 'react';
import '../../../styles/PhotoShoot/FrameComposer/ImageComposer.css';
import all_test_Img from '../../../assets/test/all_test.png';
import PhotoCaptureContext from "../../../contexts/PhotoCaptureContextType.ts";

const ImageComposer = () => {
    const { FrameData } = useContext(PhotoCaptureContext);
    const { imgPlaceData, selectedSlotIndex, setSelectedSlotIndex } = FrameData;

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

    const layout = useMemo(() => {
        if (!naturalDimensions || !containerDimensions) {
            return null;
        }

        const { width: naturalWidth, height: naturalHeight } = naturalDimensions;
        const { width: containerWidth, height: containerHeight } = containerDimensions;

        const widthScale = containerWidth / naturalWidth;
        const heightScale = containerHeight / naturalHeight;
        const scale = Math.min(widthScale, heightScale);

        const wrapperWidth = Math.round(naturalWidth * scale);
        const wrapperHeight = Math.round(naturalHeight * scale);

        return { scale, wrapperWidth, wrapperHeight };
    }, [naturalDimensions, containerDimensions]);

    return (
        <div ref={containerRef} className="image-composer-container">
            <div
                className="image-group-wrapper"
                style={{
                    width: layout ? `${layout.wrapperWidth}px` : '100%',
                    height: layout ? `${layout.wrapperHeight}px` : '100%',
                    opacity: layout ? 1 : 0, // 계산 완료 전까지 투명하게 처리
                    transition: 'opacity 0.2s', // 부드럽게 나타나는 효과
                }}
            >
                <img
                    ref={imageRef}
                    src={all_test_Img}
                    onLoad={handleImageLoad}
                    className="frame-image"
                    style={{ zIndex: 10 }}
                    alt="Photo Frame"
                />

                {layout && imgPlaceData.map((item, index) => {
                    const style: React.CSSProperties = {
                        position: 'absolute',
                        left: `${Math.round(item.left * layout.scale)}px`,
                        top: `${Math.round(item.top * layout.scale)}px`,
                        width: `${Math.round(item.width * layout.scale)}px`,
                        height: `${Math.round(item.height * layout.scale)}px`,
                        zIndex: 2,
                    };

                    const isSelected = selectedSlotIndex === index;

                    return (
                        <div
                            key={index}
                            className={`image-slot ${isSelected ? 'selected' : ''}`}
                            style={style}
                            onClick={() => setSelectedSlotIndex(index)}
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
