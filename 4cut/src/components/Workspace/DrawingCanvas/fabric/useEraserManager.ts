import React, { useCallback } from 'react';
import * as fabric from 'fabric';
///import { eraseAtLayer } from './eraser';
import type { UserLayerDataType, BrushData, ListDrawingItem, DrawingItem } from '../../../../types/types';

interface UseEraserManagerProps {
  brushData: BrushData;
  contextfabricCanvasRef: React.RefObject<fabric.Canvas | null>;
  customCursorRef: React.RefObject<fabric.Circle | null>;
  pointerRef: React.RefObject<{x:number, y:number}>;
  selectedLayerData: React.RefObject<{id: string, drawingData: DrawingItem[]} | null>;
  contextsetDrawingData: React.Dispatch<React.SetStateAction<ListDrawingItem>>;
}

export function useEraserManager({
  brushData,
  contextfabricCanvasRef,
  customCursorRef,
  pointerRef,
  selectedLayerData,
  contextsetDrawingData
}: UseEraserManagerProps) {
    // 지우개 범위에 있는 오브젝트들을 찾는 함수
    const findObjectsInEraserRange = useCallback((
        canvas: fabric.Canvas,
        layerId: string,
        eraserX: number,
        eraserY: number,
        eraserSize: number
    ) => {
        if (!canvas._drawingLayerObjects || !canvas._drawingLayerObjects.has(layerId)) {
            return [];
        }

        const layerObjects = canvas._drawingLayerObjects.get(layerId)!;
        const objectsInRange: { id: string, obj: fabric.Path | fabric.Group }[] = [];

        // 지우개 범위 계산 (원형 범위)
        const eraserRadius = eraserSize / 2;

        for (const [id, obj] of layerObjects.entries()) {
            if (obj.visible) {
                // 드로잉 데이터의 각 좌표점들을 확인
                if (obj instanceof fabric.Path) {
                    const path = obj.get('path');
                    if (Array.isArray(path)) {
                        let hasPointInRange = false;
                        
                        // 각 경로 세그먼트의 좌표 확인
                        for (const segment of path) {
                            if (segment[0] === 'M' || segment[0] === 'L') {
                                const pointX = segment[1];
                                const pointY = segment[2];
                                
                                // 지우개 중심과 좌표점 사이의 거리
                                const distance = Math.sqrt(
                                    Math.pow(eraserX - pointX, 2) + 
                                    Math.pow(eraserY - pointY, 2)
                                );
                                
                                // 그림의 브러시 크기 (strokeWidth)를 고려한 범위
                                const brushSize = obj.strokeWidth || 1;
                                const brushRadius = brushSize / 2;
                                
                                // 지우개 반지름 + 브러시 반지름 보다 작으면 겹침
                                if (distance <= (eraserRadius + brushRadius)) {
                                    hasPointInRange = true;
                                    break; // 하나라도 겹치면 해당 오브젝트는 지우기 대상
                                }
                            }
                        }
                        
                        if (hasPointInRange) {
                            objectsInRange.push({ id, obj });
                        }
                    }
                } else if (obj instanceof fabric.Group) {
                    // 그룹 내부의 모든 오브젝트들의 실제 화면상 위치를 고려
                    const groupObjects = obj.getObjects();
                    let hasPointInRange = false;
                    
                    for (const groupObj of groupObjects) {
                        // 그룹의 변환을 고려한 오브젝트의 실제 화면상 좌표
                        const groupMatrix = obj.calcTransformMatrix();
                        const objPoint = new fabric.Point(
                            groupObj.left! + (groupObj.width! * groupObj.scaleX!) / 2, 
                            groupObj.top! + (groupObj.height! * groupObj.scaleY!) / 2
                        );
                        
                        // 최신 방식으로 변환 적용
                        const objGlobalCenter = objPoint.transform(groupMatrix);
                        
                        // 지우개 중심과 오브젝트 중심 사이의 거리
                        const distance = Math.sqrt(
                            Math.pow(eraserX - objGlobalCenter.x, 2) + 
                            Math.pow(eraserY - objGlobalCenter.y, 2)
                        );
                        
                        // 오브젝트 크기를 고려한 범위
                        const objWidth = groupObj.width! * groupObj.scaleX!;
                        const objHeight = groupObj.height! * groupObj.scaleY!;
                        const objRadius = Math.sqrt(objWidth * objWidth + objHeight * objHeight) / 2;
                        
                        if (distance <= (eraserRadius + objRadius)) {
                            hasPointInRange = true;
                            break;
                        }
                    }
                    
                    if (hasPointInRange) {
                        objectsInRange.push({ id, obj });
                    }
                }
            }
        }

        return objectsInRange;
    }, []);

    // Group 내부의 FabricImage들을 개별적으로 지우개 범위와 겹치는지 확인하고 처리하는 함수
    const processGroupObjects = useCallback((
        canvas: fabric.Canvas,
        layerId: string,
        group: fabric.Group,
        eraserX: number,
        eraserY: number,
        eraserSize: number
    ) => {
        const eraserRadius = eraserSize / 2;
        const groupObjects = group.getObjects();
        const objectsToRemove: fabric.FabricImage[] = [];
        const remainingObjects: fabric.FabricImage[] = [];

        // 그룹 내부의 각 FabricImage를 확인
        for (const groupObj of groupObjects) {
            if (groupObj instanceof fabric.FabricImage) {
                // 그룹의 변환을 고려한 이미지의 실제 화면상 중심점 계산
                const groupMatrix = group.calcTransformMatrix();
                const objPoint = new fabric.Point(
                    groupObj.left! + (groupObj.width! * groupObj.scaleX!) / 2, 
                    groupObj.top! + (groupObj.height! * groupObj.scaleY!) / 2
                );
                
                // 최신 방식으로 변환 적용하여 실제 화면상 좌표 계산
                const imgGlobalCenter = objPoint.transform(groupMatrix);
                
                // 지우개 중심과 이미지 중심 사이의 거리
                const distance = Math.sqrt(
                    Math.pow(eraserX - imgGlobalCenter.x, 2) + 
                    Math.pow(eraserY - imgGlobalCenter.y, 2)
                );
                
                // 이미지 크기를 고려한 범위 (이미지의 대각선 길이의 절반)
                const imgWidth = groupObj.width! * groupObj.scaleX!;
                const imgHeight = groupObj.height! * groupObj.scaleY!;
                const imgRadius = Math.sqrt(imgWidth * imgWidth + imgHeight * imgHeight) / 2;
                
                if (distance <= (eraserRadius + imgRadius)) {
                    // 지우개 범위와 겹치는 이미지
                    objectsToRemove.push(groupObj);
                } else {
                    // 지우개 범위 밖에 있는 이미지
                    remainingObjects.push(groupObj);
                }
            }
        }

        // 겹치는 이미지들을 그룹에서 제거
        objectsToRemove.forEach(img => {
            group.remove(img);
        });
            

        // 그룹 업데이트
        group.setCoords();

        // 그룹 내부에 남은 이미지가 2개 미만이면 그룹 전체 제거
        if (remainingObjects.length < 2) {
            return true; // 그룹 전체 제거 필요
        }

        return false; // 그룹 유지
    }, []);

    // 지우개 범위의 오브젝트들을 처리하는 함수
    const eraseObjectsInRange = useCallback((
        canvas: fabric.Canvas,
        layerId: string,
        eraserX: number,
        eraserY: number,
        eraserSize: number
    ) => {
        const objectsToErase = findObjectsInEraserRange(canvas, layerId, eraserX, eraserY, eraserSize);
        
        if (objectsToErase.length === 0) return;

        let fullyRemovedCount = 0;
        let partiallyProcessedCount = 0;

        for (const { id, obj } of objectsToErase) {
            if (obj instanceof fabric.Path) {
                // Path 객체는 완전히 삭제
                canvas.remove(obj);
                fullyRemovedCount++;
                
                // _drawingLayerObjects에서 제거
                if (canvas._drawingLayerObjects && canvas._drawingLayerObjects.has(layerId)) {
                    const layerObjects = canvas._drawingLayerObjects.get(layerId)!;
                    layerObjects.delete(id);
                }
            } else if (obj instanceof fabric.Group) {
                // Group 객체는 내부 이미지들을 개별적으로 처리
                const shouldRemoveGroup = processGroupObjects(canvas, layerId, obj, eraserX, eraserY, eraserSize);
                
                if (shouldRemoveGroup) {
                    // 그룹 전체 제거
                    canvas.remove(obj);
                    fullyRemovedCount++;
                    
                    // _drawingLayerObjects에서도 제거
                    if (canvas._drawingLayerObjects && canvas._drawingLayerObjects.has(layerId)) {
                        const layerObjects = canvas._drawingLayerObjects.get(layerId)!;
                        layerObjects.delete(id);
                    }
                } else {
                    // 그룹은 유지하되 내부 이미지들만 부분적으로 제거됨
                    partiallyProcessedCount++;
                }
            }
        }

        // 완전히 제거된 객체들만 상태 데이터에서 제거
        if (fullyRemovedCount > 0) {
            contextsetDrawingData(prevData => {
                const newData = { ...prevData };
                if (newData[layerId]) {
                    const updatedLayerData = newData[layerId].filter(
                        drawing => !objectsToErase.some(obj => 
                            obj.id === drawing.id && 
                            (obj.obj instanceof fabric.Path || 
                             (obj.obj instanceof fabric.Group && 
                              processGroupObjects(canvas, layerId, obj.obj, eraserX, eraserY, eraserSize)))
                        )
                    );
                    newData[layerId] = updatedLayerData;
                }
                return newData;
            });
        }

        // 캔버스 렌더링
        canvas.renderAll();
        
        console.log(`지우개 결과: ${fullyRemovedCount}개 완전 삭제, ${partiallyProcessedCount}개 부분 처리`);
    }, [findObjectsInEraserRange, processGroupObjects, contextsetDrawingData]);

    const handleEraserMove = useCallback((
        contextUserLayerDataType:  UserLayerDataType[],
        drawingData: ListDrawingItem,
        setDrawingData: React.Dispatch<React.SetStateAction<ListDrawingItem>>
    ) => {
        if (!customCursorRef.current || !contextfabricCanvasRef.current) return;
        
        // 1. 지우개 커서 위치/가시성 설정
        customCursorRef.current.set({
            left: pointerRef.current.x,
            top: pointerRef.current.y,
            visible: true,
        })
        
        contextfabricCanvasRef.current.bringObjectToFront(customCursorRef.current)
        contextfabricCanvasRef.current.renderAll()
        
        // 2. 선택된 레이어가 있으면 지우개 기능 실행
        if (selectedLayerData.current && selectedLayerData.current.id) {
            const layerId = selectedLayerData.current.id;
            const eraserSize = brushData.eraserSize || 20;
            
            // 3. 범위 내 오브젝트 탐지 및 완전 삭제
            eraseObjectsInRange(
                contextfabricCanvasRef.current,
                layerId,
                pointerRef.current.x,
                pointerRef.current.y,
                eraserSize
            );
        }
    }, [customCursorRef, pointerRef, selectedLayerData, brushData, eraseObjectsInRange]);

    const handleEraserUp = useCallback(() => {
        if (!customCursorRef.current) return;
        customCursorRef.current.set({
            left: pointerRef.current.x,
            top: pointerRef.current.y,
            visible: false,
        })
        
        contextfabricCanvasRef.current?.bringObjectToFront(customCursorRef.current)
        contextfabricCanvasRef.current?.renderAll()
    }, [customCursorRef, pointerRef]);
    
    const handleEraserDown = useCallback(() => {
        if (!customCursorRef.current) return;
        customCursorRef.current.set({
            left: pointerRef.current.x,
            top: pointerRef.current.y,
            visible: true,
        })
        
        contextfabricCanvasRef.current?.bringObjectToFront(customCursorRef.current)
        contextfabricCanvasRef.current?.renderAll()
    }, [])

    return { 
        handleEraserMove,
        handleEraserDown,
        handleEraserUp,
    };
} 