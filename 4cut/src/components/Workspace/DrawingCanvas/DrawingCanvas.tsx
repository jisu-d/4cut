import React, { useCallback, useContext } from 'react';
import '../../../styles/Workspace/DrawingCanvas/DrawingCanvas.css';
import { useCanvasResize } from './useCanvasResize';
import { useCanvasZoom } from './useCanvasZoom';
import { useCanvasDrawing } from './useCanvasDrawing';
import CanvasResetButton from './CanvasResetButton';
import AppContext from '../../../contexts/AppContext';

function DrawingCanvas() {
    const appContext = useContext(AppContext);
    if (!appContext.canvas) return null;
    const contextCanvasSize = appContext.canvas.canvasSize;
    const contextBackgroundColor = appContext.canvas.backgroundColor;

    // 리사이징 훅 사용 - AppContext의 캔버스 크기를 기준으로 설정
    const { containerRef, canvasSize } = useCanvasResize({
        aspectRatio: contextCanvasSize.width / contextCanvasSize.height, // 실제 캔버스 비율
        maxSizeRatio: 0.9, // 컨테이너의 90%
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

    // 드로잉 훅 사용
    const {
        canvasRef,
        isDrawing,
        handleDrawingStart,
        handleDrawingMove,
        handleDrawingEnd
    } = useCanvasDrawing({
        strokeColor: '#000',
        strokeWidth: 2,
        lineCap: 'round',
        lineJoin: 'round'
    });

    // 통합된 이벤트 핸들러들
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            handleZoomTouchStart(e);
        } else if (e.touches.length === 1) {
            handleDrawingStart(e, scale, canvasSize);
        }
    }, [handleZoomTouchStart, handleDrawingStart, scale, canvasSize]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            handleZoomTouchMove(e);
        } else if (e.touches.length === 1 && isDrawing) {
            handleDrawingMove(e, scale, canvasSize);
        }
    }, [handleZoomTouchMove, handleDrawingMove, isDrawing, scale, canvasSize]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 0) {
            // 모든 터치가 끝났을 때
            handleZoomTouchEnd();
            handleDrawingEnd();
        }
    }, [handleZoomTouchEnd, handleDrawingEnd]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 1) {
            handleZoomMouseDown(e);
        } else if (e.button === 0) {
            handleDrawingStart(e, scale, canvasSize);
        }
    }, [handleZoomMouseDown, handleDrawingStart, scale, canvasSize]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        handleZoomMouseMove(e);
        if (isDrawing) {
            handleDrawingMove(e, scale, canvasSize);
        }
    }, [handleZoomMouseMove, handleDrawingMove, isDrawing, scale, canvasSize]);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        if (e.button === 1) { // 중간 클릭 해제
            handleZoomMouseUp(e);
        } else if (e.button === 0) { // 좌클릭 해제
            handleDrawingEnd();
        }       
    }, [handleZoomMouseUp, handleDrawingEnd]);

    return (
        <div 
            className="drawing-canvas"
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{
                cursor: isDragging ? 'grabbing' : isDrawing ? 'crosshair' : 'grab',
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
                    width={contextCanvasSize.width} 
                    height={contextCanvasSize.height}
                    style={{
                        width: `${canvasSize.width}px`,
                        height: `${canvasSize.height}px`,
                        border: '1px solid #ccc',
                        backgroundColor: contextBackgroundColor
                    }}
                />
            </div>
            
            {/* 캔버스 리셋 버튼 */}
            <CanvasResetButton onReset={resetView} />
        </div>
    );
}

export default DrawingCanvas;