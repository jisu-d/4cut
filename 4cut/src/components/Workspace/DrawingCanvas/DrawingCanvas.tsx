import React, { useCallback, useContext, useEffect, useRef } from 'react';
import '../../../styles/Workspace/DrawingCanvas/DrawingCanvas.css';
import { useCanvasResize } from './useCanvasResize';
import { useCanvasZoom } from './useCanvasZoom';
import CanvasResetButton from './CanvasResetButton';
import AppContext from '../../../contexts/AppContext';
import { createFabricCanvas, syncFabricBackgroundColor } from './fabric/fabric';
import { syncAspectRatioRects } from './fabric/cutLayer';

function DrawingCanvas() {
    const appContext = useContext(AppContext);
    if (!appContext.canvas) return null;
    const contextCanvasSize = appContext.canvas.canvasSize;
    const contextBackgroundColor = appContext.canvas.backgroundColor;

    const contextUserLayerDataType = appContext.layer?.userLayerDataType.userLayerDataType;

    // 리사이징 훅 사용
    const { containerRef, canvasSize } = useCanvasResize({
        aspectRatio: contextCanvasSize.width / contextCanvasSize.height,
        maxSizeRatio: 0.9,
        minWidth: 200,
        minHeight: 150,
    });

    // 줌/패닝 훅 사용
    const {
        scale,
        position,
        isDragging,
        handleTouchStart: handleZoomTouchStart,
        handleTouchMove: handleZoomTouchMove,
        handleTouchEnd: handleZoomTouchEnd,
        handleMouseDown: handleZoomMouseDown,
        handleMouseMove: handleZoomMouseMove,
        handleMouseUp: handleZoomMouseUp,
        handleWheel,
        resetView
    } = useCanvasZoom({
        minScale: 0.1,
        maxScale: 5,
        zoomSpeed: 0.1
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<any>(null);

    // Fabric.js 캔버스 생성 (캔버스 요소만)
    useEffect(() => {
        if (canvasRef.current) {
            const fabricCanvas = createFabricCanvas(
                canvasRef.current,
                canvasSize.width,
                canvasSize.height,
                contextBackgroundColor
            );
            fabricCanvasRef.current = fabricCanvas;
            return () => {
                fabricCanvas.dispose();
                fabricCanvasRef.current = null;
            };
        }
    }, [canvasRef, canvasSize]);

    // 배경색 동기화
    useEffect(() => {
        if (fabricCanvasRef.current) {
            syncFabricBackgroundColor(fabricCanvasRef.current, contextBackgroundColor);
        }
    }, [contextBackgroundColor]);

    // 모든 cut의 사각형을 그리고, 클릭/이동/크기조절/회전 시 데이터 갱신
    useEffect(() => {
    
        if (fabricCanvasRef.current && contextUserLayerDataType) {
            const cutImageData = appContext.layer?.cutImageData.cutImageData || [];
            const setCutImageData = appContext.layer?.cutImageData.setCutImageData;
            
            contextUserLayerDataType.forEach(item => {
                if (item.LayerType === 'Cut') {
                    // 레이어의 checked가 true일 때만 전체 cutImageData를 그림
                    const visibleCuts = item.checked ? cutImageData : [];
                    
                    // 클릭/변형 핸들러: selected=true일 때만 활성화
                    const handleRectClick = item.selected ? (id: string) => {
                        if (setCutImageData) {
                            setCutImageData(prev =>
                                prev.map(item =>
                                    item.id === id
                                        ? { ...item, checked: true }
                                        : { ...item, checked: false }
                                )
                            );
                        }
                    } : undefined;
        
                    const handleRectTransform = item.selected ? (id: string, position: {x: number, y: number}, size: {width: number, height: number}, angle: number) => {
                        if (setCutImageData) {
                            setCutImageData(prev =>
                                prev.map(item =>
                                    item.id === id
                                        ? { ...item, position, size, angle }
                                        : item
                                )
                            );
                        }
                    } : undefined;
        
                    syncAspectRatioRects(
                        fabricCanvasRef.current,
                        visibleCuts,
                        handleRectClick,
                        handleRectTransform,
                        item.selected
                    );
                }
            });


        }
    }, [appContext.layer?.cutImageData.cutImageData, canvasSize, contextUserLayerDataType]);

    // 이벤트 핸들러
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        handleZoomTouchStart(e);
    }, [handleZoomTouchStart]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        handleZoomTouchMove(e);
    }, [handleZoomTouchMove]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        handleZoomTouchEnd();
    }, [handleZoomTouchEnd]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        handleZoomMouseDown(e);
    }, [handleZoomMouseDown]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        handleZoomMouseMove(e);
    }, [handleZoomMouseMove]);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        handleZoomMouseUp(e);
    }, [handleZoomMouseUp]);

    // drawing-canvas 영역 클릭 시 모두 해제 (캔버스 내부, rect 선택 시 제외)
    const handleCanvasAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // 캔버스 내부 클릭이면 해제하지 않음
        if (canvasRef.current && canvasRef.current.contains(e.target as Node)) return;
        
        if (fabricCanvasRef.current && fabricCanvasRef.current.getActiveObject()) return;
        
        // 그 외(진짜 빈 영역)만 해제
        const setCutImageData = appContext.layer?.cutImageData.setCutImageData;
        if (setCutImageData) {
            setCutImageData(prev => prev.map(item => ({ ...item, checked: false })));
        }
        if (fabricCanvasRef.current) {
            fabricCanvasRef.current.discardActiveObject();
            fabricCanvasRef.current.requestRenderAll();
        }
    };

    useEffect(() => {
        if (!fabricCanvasRef.current) return;
        const setCutImageData = appContext.layer?.cutImageData.setCutImageData;

        const handleBodyClick = (e: MouseEvent) => {
            // drawing-canvas 영역 클릭 시에만 해제
            if ((e.target as HTMLElement).classList[0] === 'drawing-canvas') {
                if (setCutImageData) {
                    setCutImageData(prev => prev.map(item => ({ ...item, checked: false })));
                }
                fabricCanvasRef.current.discardActiveObject();
                fabricCanvasRef.current.requestRenderAll();
            }
        };

        document.body.addEventListener('mousedown', handleBodyClick);
        return () => {
            document.body.removeEventListener('mousedown', handleBodyClick);
        };
    }, [appContext.layer?.cutImageData, canvasSize]);

    return (
        <div
            className="drawing-canvas"
            ref={containerRef}
            onClick={handleCanvasAreaClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                touchAction: 'none'
            }}
        >
            <div
                className="canvas-content"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: 'center center'
                }}
            >
                <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    style={{
                        border: 'none'
                    }}
                />
            </div>
            <CanvasResetButton onReset={resetView} />
        </div>
    );
}

export default DrawingCanvas;