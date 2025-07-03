import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import '../../../styles/Workspace/DrawingCanvas/DrawingCanvas.css';
import {useCanvasResize} from './useCanvasResize';
import {useCanvasZoom} from './useCanvasZoom';
import CanvasResetButton from './CanvasResetButton';
import CanvasToolBar from './CanvasToolBar';
import AppContext from '../../../contexts/AppContext';
import {createFabricCanvas, syncFabricBackgroundColor} from './fabric/fabric';
import {syncAspectRatioRects} from './fabric/cutLayer';
import {syncDrawingLayer} from './fabric/drawingLayer';
import * as fabric from 'fabric';
import { useDrawingManager } from './fabric/useDrawingManager';

function DrawingCanvas() {
    const appContext = useContext(AppContext);

    const currentCanvasSize = appContext.canvas?.canvasSize || {width: 800, height: 600};
    const currentBackgroundColor = appContext.canvas?.backgroundColor || '#f0f0f0';

    const contextUserLayerDataType = appContext.layer?.userLayerDataType.userLayerDataType;
    const drawingData = appContext.layer?.DrawingData.drawingData || {};
    const setDrawingData = appContext.layer?.DrawingData.setDrawingData;

    // 도구 상태 관리
    const [activeTool, setActiveTool] = useState<"pen" | "select">("select");

    // 캔버스 화면 조정
    const {containerRef, canvasSize} = useCanvasResize({
        aspectRatio: currentCanvasSize.width / currentCanvasSize.height,
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
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);


    // useDrawingManager 훅 사용
    const {
        handleCanvasPointerDown,
        handleCanvasPointerMove,
        handleCanvasPointerUp
    } = useDrawingManager({
        contextUserLayerDataType,
        activeTool,
        setDrawingData,
        canvasRef,
        fabricCanvasRef,
        scale
    });

    // Fabric.js 캔버스 생성 (캔버스 요소만)
    useEffect(() => {
        if (canvasRef.current && canvasSize.width > 0 && canvasSize.height > 0) {
            
            const fabricCanvas = createFabricCanvas(
                canvasRef.current,
                canvasSize.width,
                canvasSize.height,
                currentBackgroundColor
            );
            fabricCanvasRef.current = fabricCanvas;
            
            return () => {
                fabricCanvas.dispose();
                fabricCanvasRef.current = null;
            };
        }
    }, [canvasRef, canvasSize, currentBackgroundColor]);

    useEffect(() => {
        if (!fabricCanvasRef.current) return;
        if (activeTool === 'pen') {
            fabricCanvasRef.current.isDrawingMode = true;
            fabricCanvasRef.current.selection = false;
        } else {
            fabricCanvasRef.current.isDrawingMode = false;
            fabricCanvasRef.current.selection = true;
        }
    }, [activeTool, fabricCanvasRef.current]);


    // 모든 cut의 사각형을 그리고, 클릭/이동/크기조절/회전 시 데이터 갱신 - TODO -> 레이어 그리는 부분 최적화가 필요
    useEffect(() => {
        if (fabricCanvasRef.current && contextUserLayerDataType) {
            const cutImageData = appContext.layer?.cutImageData.cutImageData || [];
            const setCutImageData = appContext.layer?.cutImageData.setCutImageData;
            

            contextUserLayerDataType.forEach(item => {
                
                if (item.LayerType === 'Cut') {

                    // 클릭/변형 핸들러: selected=true일 때만 활성화
                    const handleRectClick = (id: string) => {
                        if (setCutImageData) {
                            setCutImageData(prev =>
                                prev.map(item =>
                                    item.id === id
                                        ? {...item, checked: true}
                                        : {...item, checked: false}
                                )
                            );
                        }
                    };

                    const handleRectTransform = (
                        id: string, 
                        position: { x: number, y: number }, 
                        size: {
                            width: number,
                            height: number
                        }, 
                        angle: number
                    ) => {
                        if (setCutImageData) {
                            setCutImageData(prev =>
                                prev.map(item =>
                                    item.id === id
                                        ? {
                                            ...item,
                                            jsonData: {
                                                ...item.jsonData,
                                                left: position.x,
                                                top: position.y,
                                                width: size.width,
                                                height: size.height,
                                                angle: angle
                                            } as unknown as fabric.Rect
                                        } 
                                        : item
                                )
                            );
                        }
                    };
                    
                    syncAspectRatioRects(
                        fabricCanvasRef.current!,
                        cutImageData ?? [],
                        handleRectClick,
                        handleRectTransform,
                        item.active,
                        item.visible
                    );
                } else if (item.LayerType === 'Drawing') {
                    // Drawing 레이어 처리
                    const layerDrawingData = drawingData[item.text];
                   

                    const handleDrawingTransform = (id: string, newProps: any) => {
                        if (setDrawingData) {
                            setDrawingData(prev => ({
                                ...prev,
                                [item.text]: prev[item.text].map(drawing =>
                                    drawing.id === id
                                        ? { ...drawing, ...newProps }
                                        : drawing
                                )
                            }));
                        }
                    };

                    // visible이 true일 때만 그림 화면에 보임
                    // active가 true일 때만 선택 수정 가능함

                    syncDrawingLayer(
                        fabricCanvasRef.current!,
                        item.text,
                        layerDrawingData, 
                        handleDrawingTransform,
                        item.active,
                        item.visible
                    );
                }
            });
        }
    }, [
        appContext.layer?.cutImageData.cutImageData,
        contextUserLayerDataType,
        drawingData,
        fabricCanvasRef.current
    ]);
    
    // checked가 true인 객체를 fabric.js에서 선택
    useEffect(() => {
        if (!fabricCanvasRef.current) return;

        const cutImageData = appContext.layer?.cutImageData.cutImageData || [];
        const checkedItem = cutImageData.find(item => item.checked);

        if (checkedItem) {
            // fabric.js에서 해당 객체 찾기
            const fabricObjects = fabricCanvasRef.current.getObjects();
            const targetObject = fabricObjects.find((obj: any) =>
                obj.data && obj.data.id === checkedItem.id
            );

            if (targetObject) {
                fabricCanvasRef.current.setActiveObject(targetObject);
                fabricCanvasRef.current.requestRenderAll();
            }
        } else {
            // checked가 true인 객체가 없으면 선택 해제
            fabricCanvasRef.current.discardActiveObject();
            fabricCanvasRef.current.requestRenderAll();
        }
    }, [appContext.layer?.cutImageData.cutImageData]);

    // drawing-canvas 영역 클릭 시 모두 해제 (캔버스 내부, rect 선택 시 제외)
    const handleCanvasAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;

        // 캔버스 내부 클릭이면 해제하지 않음
        if (canvasRef.current && canvasRef.current.contains(target)) return;

        // fabric.js 활성 객체가 있으면 해제하지 않음
        if (fabricCanvasRef.current && fabricCanvasRef.current.getActiveObject()) return;

        // 그 외(진짜 빈 영역)만 해제
        const setCutImageData = appContext.layer?.cutImageData.setCutImageData;
        if (setCutImageData) {
            setCutImageData(prev => prev.map(item => ({...item, checked: false})));
        }

        if (fabricCanvasRef.current) {
            fabricCanvasRef.current.discardActiveObject();
            fabricCanvasRef.current.requestRenderAll();
        }
    };

    useEffect(() => {
        const setCutImageData = appContext.layer?.cutImageData.setCutImageData;

        const handleBodyClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // 클릭된 요소가 캔버스나 캔버스 관련 요소인지 확인
            const isCanvas = target.tagName === 'CANVAS';
            const isFabricObject = fabricCanvasRef.current?.getActiveObject();

            // ImageRatioSelector 관련 요소인지 확인
            const isImageRatioSelector = target.closest('.image-ratio-selector-section');

            // 캔버스 영역이 아니고, ImageRatioSelector도 아니고, 선택된 객체가 있을 때만 해제
            if (!isCanvas && !isImageRatioSelector && isFabricObject) {
                // cutImageData의 checked 해제
                if (setCutImageData) {
                    setCutImageData(prev => prev.map(item => ({...item, checked: false})));
                }

                // fabric.js 활성 객체 해제
                fabricCanvasRef.current?.discardActiveObject();
                fabricCanvasRef.current?.requestRenderAll();
            }
        };

        document.body.addEventListener('mousedown', handleBodyClick);
        return () => {
            document.body.removeEventListener('mousedown', handleBodyClick);
        };
    }, [appContext.layer?.cutImageData, canvasSize]); // canvasSize 의존성 그대로 유지

    // 기존 핸들러에 드로잉용 핸들러 추가
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        handleCanvasPointerDown(e);
        handleZoomTouchStart(e);
    }, [handleCanvasPointerDown, handleZoomTouchStart]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        handleCanvasPointerMove(e);
        handleZoomTouchMove(e);
    }, [handleCanvasPointerMove, handleZoomTouchMove]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        handleCanvasPointerUp();
        handleZoomTouchEnd();
    }, [handleCanvasPointerUp, handleZoomTouchEnd]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        handleCanvasPointerDown(e);
        handleZoomMouseDown(e);
    }, [handleCanvasPointerDown, handleZoomMouseDown]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        handleCanvasPointerMove(e);
        handleZoomMouseMove(e);
    }, [handleCanvasPointerMove, handleZoomMouseMove]);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        handleCanvasPointerUp();
        handleZoomMouseUp(e);
    }, [handleCanvasPointerUp, handleZoomMouseUp]);

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
            
            {/* 도구 바 */}
            <CanvasToolBar 
                activeTool={activeTool}
                onToolChange={setActiveTool}
            />
            
            <CanvasResetButton onReset={resetView}/>
        </div>
    );
}

export default DrawingCanvas;
