import { useRef, useEffect, useContext, useLayoutEffect, useState } from 'react';
import AppContext from '../../../contexts/AppContext';
import * as fabric from 'fabric';
import '../../../styles/Workspace/export/ExportCanvas.css';
import type { ImgDataItem, DrawingItem } from '../../../types/types';
import { imageStampBrush } from '../DrawingCanvas/fabric/imageStampBrush';
import { brushType as brushTypeArray } from '../../../assets/brush/brushType';

const brushTypeToPathMap = new Map(brushTypeArray.map(brush => [brush.brushType, brush.brushPath]));

// 이미지 레이어를 불러오는 헬퍼 함수
async function addImageLayer(fabricCanvas: fabric.StaticCanvas, imageInfo: ImgDataItem) {
    if (!imageInfo || !imageInfo.url) return;
    try {
        const img = await fabric.Image.fromURL(imageInfo.url, { crossOrigin: 'anonymous' });
        img.set({
            left: imageInfo.left,
            top: imageInfo.top,
            scaleX: imageInfo.scaleX,
            scaleY: imageInfo.scaleY,
            angle: imageInfo.angle,
        });
        fabricCanvas.add(img);
    } catch (error) {
        console.error(`이미지 로딩 실패: ${imageInfo.url}`, error);
    }
}

// 드로잉 레이어를 불러오는 헬퍼 함수
async function addDrawingLayer(fabricCanvas: fabric.StaticCanvas, drawingItems: DrawingItem[], canvasScale: { x: number, y: number }) {
    if (!drawingItems) return;
    for (const item of drawingItems) {
        try {
            if (item.jsonData && item.jsonData.points) {
                const brushPath = brushTypeToPathMap.get(item.brushType);
                if (item.brushType !== 'pen' && brushPath) {
                    // Image stamp brush
                    const brushData = {
                        brushType: item.brushType,
                        brushPath: brushPath,
                        brushSize: (item.jsonData.options.strokeWidth || 20) / canvasScale.x,
                        eraserSize: 0,
                    };


                    const group = await imageStampBrush(item, brushData);
                    fabricCanvas.add(group);
                } else {
                    // Regular path brush (including 'pen' and any other non-image-stamp types)
                    const path = new fabric.Path(
                        item.jsonData.points.map((p: { x: number; y: number }) => `L ${p.x} ${p.y}`).join(' ').replace('L', 'M'),
                        { ...item.jsonData.options, fill: undefined }
                    );
                    fabricCanvas.add(path);
                }
            }
        } catch (error) {
            console.error('드로잉 아이템 로딩 실패:', error);
        }
    }
}

const ExportCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.13);

    const { canvas, layer } = useContext(AppContext);
    const { canvasSize, backgroundColor } = canvas;
    const { userLayerDataType, DrawingData, cutImageData, imgData } = layer;

    useLayoutEffect(() => {
        const calculateScale = () => {
            if (wrapperRef.current && canvasSize.width > 0 && canvasSize.height > 0) {
                const parentWidth = wrapperRef.current.offsetWidth;
                const parentHeight = wrapperRef.current.offsetHeight;
                // 너비와 높이를 모두 고려하여 스케일 계산 (좌우, 상하 16px 공백 가정)
                const scaleX = (parentWidth - 32) / canvasSize.width;
                const scaleY = (parentHeight - 32) / canvasSize.height;

                const newScale = Math.min(scaleX, scaleY);
                setScale(newScale);
            }
        };
        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, [canvasSize.width, canvasSize.height]);

    useEffect(() => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;

        const fabricCanvas = new fabric.StaticCanvas(canvasEl, {
            width: canvasSize.width,
            height: canvasSize.height,
            backgroundColor: 'transparent',
        });

        const renderAll = async () => {
            // 1. 배경 그리기
            fabricCanvas.add(new fabric.Rect({
                width: canvasSize.width, height: canvasSize.height, fill: backgroundColor,
            }));

            // 2. 'Cut' 레이어 영역을 투명하게 처리 (구멍 뚫기)
            cutImageData.cutImageData.forEach(cut => {
                fabricCanvas.add(new fabric.Rect({
                    ...cut.jsonData, globalCompositeOperation: 'destination-out', fill: '#000'
                }));
            });

            // 3. 나머지 모든 레이어 그리기
            for (const layerData of userLayerDataType.userLayerDataType) {
                if (!layerData.visible || layerData.LayerType === 'Cut') continue;

                switch (layerData.LayerType) {
                    case 'Img':
                        await addImageLayer(fabricCanvas, imgData.imgData[layerData.id]);
                        break;
                    case 'Drawing':
                        await addDrawingLayer(fabricCanvas, DrawingData.drawingData[layerData.id], { x: scale, y: scale });
                        break;
                }
            }

            // 4. 모든 내용을 한번에 캔버스에 렌더링
            fabricCanvas.renderAll();
        };

        renderAll();

        return () => {
            fabricCanvas.dispose();
        };
    }, [canvasSize, backgroundColor, userLayerDataType, DrawingData, cutImageData, imgData, scale]);

    return (
        <div ref={wrapperRef} className="export-canvas-wrapper">
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
                <canvas ref={canvasRef} id="export-preview" />
            </div>
        </div>
    );
};

export default ExportCanvas;