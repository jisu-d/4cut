import React, {useCallback, useContext, useEffect, useRef, useState, useMemo} from 'react';
import '../../../styles/Workspace/DrawingCanvas/DrawingCanvas.css';
import {useCanvasResize} from './useCanvasResize';
import {useCanvasZoom} from './useCanvasZoom';
import CanvasResetButton from './CanvasResetButton';
import CanvasToolBar from './CanvasToolBar';
import AppContext from '../../../contexts/AppContext';
import {createFabricCanvas} from './fabric/fabric';
import {syncAspectRatioRects} from './fabric/cutLayer';
import {syncDrawingLayer} from './fabric/drawingLayer';
import { useDrawingManager } from './fabric/useDrawingManager';
import { syncImgLayers } from './fabric/imgLayer';

import * as fabric from 'fabric';

import { getPointerFromEvent } from './pointerUtils'
import { useEraserManager } from './fabric/useEraserManager'
import type { DrawingItem } from '../../../types/types';

function DrawingCanvas() {
    const appContext = useContext(AppContext);

    const currentCanvasSize = appContext.canvas?.canvasSize || {width: 800, height: 600};
    const currentBackgroundColor = appContext.canvas?.backgroundColor || '#f0f0f0';

    const contextUserLayerDataType = appContext.layer?.userLayerDataType.userLayerDataType;

    const drawingData = useMemo(() => {
        return appContext.layer?.DrawingData.drawingData || {};
    }, [appContext.layer?.DrawingData.drawingData]);
    const setDrawingData = appContext.layer?.DrawingData.setDrawingData;

    const cutImageData = useMemo(() => {
        return appContext.layer?.cutImageData.cutImageData || []
    }, [appContext.layer?.cutImageData]);
    const setCutImageData = appContext.layer?.cutImageData.setCutImageData;

    const imgData = useMemo(() => {
        return appContext.layer?.imgData.imgData || {}
    }, [appContext.layer?.imgData.imgData]);
    const setImgData = appContext.layer?.imgData.setImgData

    const contextfabricCanvasRef  = appContext.canvas.fabricCanvasRef

    const brushData = appContext.brush?.brushData

    // 색상 데이터 가져오기
    const hsl = appContext.colors?.chosenColor.hslData.hsl || { h: 0, s: 0, l: 0 };
    const alpha = appContext.colors?.chosenColor.alphaData.alpha;

    const pointerRef = useRef({x: 0, y: 0})
    
    // 도구 상태 관리
    const [activeTool, setActiveTool] = useState<"pen" | "select" | "eraser">("select");
    // 캔버스 화면 조정
    const {containerRef, canvasSize} = useCanvasResize({
        aspectRatio: currentCanvasSize.width / currentCanvasSize.height,
        maxSizeRatio: 0.8,
        minWidth: 200,
        minHeight: 150,
    });

    // 줌/패닝 훅 사용
    const {
        scale,
        position,
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
    //const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

    const scaleX = canvasSize.width / currentCanvasSize.width;
    const scaleY = canvasSize.height / currentCanvasSize.height;
    const canvasScale = useMemo(() => {
        return { scaleX: scaleX, scaleY: scaleY };
    }, [scaleX, scaleY]);

    // useDrawingManager 훅 사용
    const {
        handleCanvasPointerDown,
        handleCanvasPointerMove,
        handleCanvasPointerUp
    } = useDrawingManager({
        contextUserLayerDataType,
        activeTool,
        brushData,
        hsl,
        alpha,
        setDrawingData,
        contextfabricCanvasRef,
        canvasScale,
        pointerRef,
    });

    const customCursorRef = useRef<fabric.Circle | null>(null);
    const selectedLayerData = useRef<{
        id: string;
        drawingData: DrawingItem[];
    } | null>(null);

    useEffect(() => {
        if (contextUserLayerDataType) {
            const selectedLayer = contextUserLayerDataType.find(layer => layer.active);
            selectedLayerData.current = {
                id: selectedLayer?.id ?? 'drawing-123',
                drawingData: drawingData[selectedLayer?.id ?? 'drawing-123']
            }
        }
    }, [contextUserLayerDataType, drawingData]);

    // useEraserManager 훅
    const {
        handleEraserMove,
        handleEraserDown,
        handleEraserUp
    } = useEraserManager({
        brushData,
        contextfabricCanvasRef,
        customCursorRef,
        pointerRef,
        selectedLayerData,
        contextsetDrawingData: setDrawingData,
        scale
    })


    const setPointerRef = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!canvasRef.current || !scale) return; 
        const pointer = getPointerFromEvent(e, canvasRef, scale);
        if (pointer) {
            pointerRef.current = { x: pointer.x, y: pointer.y }
        }
    }, [pointerRef, scale]);

    useEffect(() => {
        if (!contextfabricCanvasRef.current) return;
        if (!customCursorRef.current) return;

        let cursortext = 'default'

        if (activeTool === 'eraser') {
            contextfabricCanvasRef.current.isDrawingMode = false;
            contextfabricCanvasRef.current.selection = false;
            customCursorRef.current.set({
                radius: (brushData?.eraserSize), // eraserSize의 절반으로 설정
            });
            //contextfabricCanvasRef.current.bringObjectToFront(customCursorRef.current)
            cursortext = 'none'
        } else {
            // 다른 도구일 때 커스텀 커서 숨기기
            customCursorRef.current.set({ visible: false });
            if (activeTool === 'pen') {
                contextfabricCanvasRef.current.isDrawingMode = true;
                contextfabricCanvasRef.current.selection = false;
                cursortext = 'crosshair'
            } else if (activeTool === 'select'){
                contextfabricCanvasRef.current.isDrawingMode = false;
                contextfabricCanvasRef.current.selection = true;
                cursortext = 'default'
            }
        }

        contextfabricCanvasRef.current.hoverCursor = cursortext
        contextfabricCanvasRef.current.defaultCursor = cursortext
        contextfabricCanvasRef.current.moveCursor = cursortext
        contextfabricCanvasRef.current.freeDrawingCursor = cursortext
        contextfabricCanvasRef.current.requestRenderAll()

    }, [activeTool, brushData.eraserSize, contextfabricCanvasRef]);

    // Fabric.js 캔버스 생성, 지우개 생성
    useEffect(() => {
        if (canvasRef.current && canvasSize.width > 0 && canvasSize.height > 0) {

            const fabricCanvas = createFabricCanvas(
                canvasRef.current,
                canvasSize.width,
                canvasSize.height,
                currentBackgroundColor
            );
            contextfabricCanvasRef.current = fabricCanvas;

            const customCursor = new fabric.Circle({
                left: 0,
                top: 0,
                radius: brushData?.eraserSize, // 초기값
                fill: "white", // 회색으로 채움
                stroke: "grey",
                originX: 'center',
                originY: 'center',
                selectable: false, // 선택 불가능하게
                evented: false, // 이벤트 발생 안하게
                visible: false, // 초기에는 숨김
            });

            contextfabricCanvasRef.current.add(customCursor);
            customCursorRef.current = customCursor;

            return () => {
                fabricCanvas.dispose();
                contextfabricCanvasRef.current = null;
            };
        }
    }, [canvasRef, canvasSize, currentBackgroundColor, brushData?.eraserSize, contextfabricCanvasRef]);



    // 모든 cut의 사각형을 그리고, 클릭/이동/크기조절/회전 시 데이터 갱신 - TODO -> 레이어 그리는 부분 최적화가 필요

    


    useEffect(() => {
        if (contextfabricCanvasRef.current && contextUserLayerDataType) {
            contextUserLayerDataType.forEach((item, index) => {
                const idx = contextUserLayerDataType.length - index

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
                        size: { width: number, height: number },
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
                                                left: position.x / canvasScale.scaleX,
                                                top: position.y / canvasScale.scaleY,
                                                width: size.width / canvasScale.scaleX,
                                                height: size.height / canvasScale.scaleY,
                                                angle: angle
                                            }
                                        }
                                        : item
                                )
                            );
                        }
                    };

                    syncAspectRatioRects(
                        contextfabricCanvasRef.current!,
                        cutImageData ?? [],
                        handleRectClick,
                        handleRectTransform,
                        item.active,
                        item.visible,
                        idx,
                        canvasScale
                    );
                } else if (item.LayerType === 'Drawing') {
                    const layerDrawingData = drawingData[item.id];

                    const handleDrawingTransform = (
                        id: string,
                        points: { x: number, y: number }[],
                        options: {
                            left: number,
                            top: number,
                            width: number,
                            height: number,
                            angle: number,
                            scaleX: number,
                            scaleY: number,
                        }
                    ) => {
                        if (setDrawingData) {
                            setDrawingData(prev => ({
                                ...prev,
                                [item.id]: prev[item.id].map(drawing => {
                                    if (drawing.id !== id) {
                                        return drawing;
                                    }

                                    return {
                                        ...drawing,
                                        jsonData: {
                                            ...drawing.jsonData,
                                            points: points.map(p => ({ x: p.x / canvasScale.scaleX, y: p.y / canvasScale.scaleY })),
                                            options: {
                                                ...drawing.jsonData.options,
                                                left: options.left / canvasScale.scaleX,
                                                top: options.top / canvasScale.scaleY,
                                                width: options.width / canvasScale.scaleX,
                                                height: options.height / canvasScale.scaleY,
                                                angle: options.angle,
                                                scaleX: options.scaleX,
                                                scaleY: options.scaleY,
                                            }
                                        }
                                    };
                                })
                            }));
                        }
                    };

                    syncDrawingLayer(
                        contextfabricCanvasRef.current!,
                        item.id,
                        layerDrawingData,
                        brushData,
                        handleDrawingTransform,
                        item.active && activeTool === 'select',
                        item.visible,
                        idx,
                        canvasScale
                    );
                } else if (item.LayerType === 'Img') {

                    const layerImgData = imgData[item.id]

                    if (layerImgData) {
                        const handleImgTransform = (
                            top: number,
                            left: number,
                            scaleX: number,
                            scaleY: number,
                            angle: number
                        ) => {

                            if (setImgData){
                                setImgData(prev => ({
                                  ...prev,
                                   [item.id]: {
                                     ...prev[item.id],
                                     top: top / canvasScale.scaleY,
                                     left: left / canvasScale.scaleX,
                                     scaleX: scaleX / canvasScale.scaleX,
                                     scaleY: scaleY / canvasScale.scaleY,
                                     angle
                                   }
                                 }));
                            }
                        };

                        syncImgLayers(
                            contextfabricCanvasRef.current!,
                            layerImgData,
                            handleImgTransform,
                            item.active,
                            item.visible,
                            idx,
                            canvasScale
                        );
                    }
                }
            });
        }

    }, [cutImageData, drawingData, imgData, contextUserLayerDataType, brushData, contextfabricCanvasRef, canvasScale, setCutImageData, setDrawingData, setImgData]);


    // drawing-canvas 영역 클릭 시 모두 해제 (캔버스 내부, rect 선택 시 제외)
    const handleCanvasAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;

        // 캔버스 내부 클릭이면 해제하지 않음
        if (canvasRef.current && canvasRef.current.contains(target)) return;

        // fabric.js 활성 객체가 있으면 해제하지 않음
        if (contextfabricCanvasRef.current && contextfabricCanvasRef.current.getActiveObject()) return;

        // 그 외(진짜 빈 영역)만 해제
        const setCutImageData = appContext.layer?.cutImageData.setCutImageData;
        if (setCutImageData) {
            setCutImageData(prev => prev.map(item => ({...item, checked: false})));
        }

        if (contextfabricCanvasRef.current) {
            contextfabricCanvasRef.current.discardActiveObject();
            contextfabricCanvasRef.current.requestRenderAll();
        }
    };

    useEffect(() => {
        const setCutImageData = appContext.layer?.cutImageData.setCutImageData;

        const handleBodyClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // 클릭된 요소가 캔버스나 캔버스 관련 요소인지 확인
            const isCanvas = target.tagName === 'CANVAS';
            const isFabricObject = contextfabricCanvasRef.current?.getActiveObject();

            // ImageRatioSelector 관련 요소인지 확인
            const isImageRatioSelector = target.closest('.image-ratio-selector-section');

            // 캔버스 영역이 아니고, ImageRatioSelector도 아니고, 선택된 객체가 있을 때만 해제
            if (!isCanvas && !isImageRatioSelector && isFabricObject) {
                // cutImageData의 checked 해제
                if (setCutImageData) {
                    setCutImageData(prev => prev.map(item => ({...item, checked: false})));
                }

                // fabric.js 활성 객체 해제
                contextfabricCanvasRef.current?.discardActiveObject();
                contextfabricCanvasRef.current?.requestRenderAll();
            }
        };

        document.body.addEventListener('mousedown', handleBodyClick);
        return () => {
            document.body.removeEventListener('mousedown', handleBodyClick);
        };
    }, [appContext.layer?.cutImageData, canvasSize, contextfabricCanvasRef]);

    
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        setPointerRef(e);
        handleCanvasPointerDown();
        handleZoomTouchStart(e);
        if(activeTool == 'eraser'){
            handleEraserDown();
        }
    }, [activeTool, handleCanvasPointerDown, handleEraserDown, handleZoomTouchStart, setPointerRef]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        setPointerRef(e)
        handleCanvasPointerMove();
        handleZoomTouchMove(e);
        
        if(activeTool == 'eraser'){
            handleEraserMove();
        }
    }, [activeTool, handleCanvasPointerMove, handleEraserMove, handleZoomTouchMove, setPointerRef]);
    
    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        setPointerRef(e);
        handleCanvasPointerUp();
        handleZoomTouchEnd();
        if(activeTool == 'eraser'){
            handleEraserUp();
        }
    }, [activeTool, handleCanvasPointerUp, handleEraserUp, handleZoomTouchEnd, setPointerRef]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setPointerRef(e);
        handleCanvasPointerDown();
        handleZoomMouseDown(e);
    }, [handleCanvasPointerDown, handleZoomMouseDown, setPointerRef]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        setPointerRef(e);
        handleCanvasPointerMove();
        handleZoomMouseMove(e);
        if(activeTool == 'eraser'){
            handleEraserMove();
        }
    }, [setPointerRef, handleCanvasPointerMove, handleZoomMouseMove, activeTool, handleEraserMove]);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        setPointerRef(e);
        handleCanvasPointerUp();
        handleZoomMouseUp(e);
    }, [handleCanvasPointerUp, handleZoomMouseUp, setPointerRef]);

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
