import '../../../styles/Workspace/layers/DndList.css';
import React, {useCallback, useEffect, useRef, useState, useContext} from 'react';
import trash from '../../../assets/Icon/trash.svg';
import {CustomCheckbox} from '../../CustomCheckBox';
import AppContext from '../../../contexts/AppContext';
import { removeDrawingById } from '../DrawingCanvas/fabric/drawingLayer';
import { removeImgById } from '../DrawingCanvas/fabric/imgLayer';

// arrayMove 유틸리티 함수 (기존과 동일)
const arrayMove = <T,>(arr: T[], oldIndex: number, newIndex: number): T[] => {
  if (oldIndex < 0 || oldIndex >= arr.length || newIndex < 0 || newIndex >= arr.length) {
    return [...arr];
  }
  const newArr = [...arr];
  const [removed] = newArr.splice(oldIndex, 1);
  newArr.splice(newIndex, 0, removed);
  return newArr;
};

const TRANSITION_DURATION = 300; // 0.3초 (ms 단위)


const DndList = () => {
  const appContext = useContext(AppContext);
  const setDrawingData = appContext?.layer?.DrawingData.setDrawingData;
  const setImgData = appContext?.layer?.imgData.setImgData;
  const canvas = appContext.canvas.fabricCanvasRef;
  const { userLayerDataType, setUserLayerDataType } = appContext.layer.userLayerDataType; // 중복 선언 제거


  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overlayPos, setOverlayPos] = useState<{ x: number; y: number } | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);
  const [originalIndex, setOriginalIndex] = useState<number | null>(null);

  // 삭제 애니메이션이 진행 중인 항목들의 ID를 저장합니다.
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  // 현재 텍스트를 편집 중인 항목의 ID를 저장합니다.
  const [editingId, setEditingId] = useState<string | null>(null);

  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const itemRects = useRef<Map<string, DOMRect>>(new Map());

  // 롱프레스 타이머 및 상태
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const LONG_PRESS_DURATION = 300; // 1초로 변경

  const [overlayScale, setOverlayScale] = useState(1);

  const resetDragState = useCallback(() => {
    setDraggingId(null);
    setOverlayPos(null);
    setOffset(null);
    setOriginalIndex(null);
  }, []);

  // 드래그/터치 종료 (공통 로직)
  const commonDragEndLogic = useCallback(() => {
    if (draggingId) {
      resetDragState()

      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.body.style.overflow = '';

      userLayerDataType.forEach(item => {
        const el = itemRefs.current.get(item.id);
        if (el) {
          el.style.transform = '';
        }
      });
    }
  }, [draggingId, userLayerDataType, resetDragState]);

  const onDelete = useCallback((id: string, LayerType:  "Drawing" | "Img") => {
    setUserLayerDataType(prevItems => prevItems.filter(item => item.id !== id));
    if (canvas.current) {
      if (LayerType === 'Img') {
        removeImgById(canvas.current, id);
        if (setImgData) {
          setImgData(prev => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });
        }
      } else if (LayerType === 'Drawing') {
        removeDrawingById(canvas.current, id);
        if (setDrawingData) {
          setDrawingData((prev) => {
            const copy = { ...prev };
            if (copy[id]) delete copy[id];
            return copy;
          });
        }
      }
    }

    // 2. 해당 항목에 'is-deleting' 클래스를 추가하기 위해 deletingIds에 ID를 추가합니다.
    setDeletingIds(prevIds => new Set(prevIds.add(id)));

    // 3. 애니메이션 지속 시간 후에 실제로 items 상태에서 항목을 제거합니다.
    setTimeout(() => {
      
      // 4. 삭제 애니메이션이 끝났으므로 deletingIds에서도 해당 ID를 제거합니다.
      setDeletingIds(prevIds => {
        const newSet = new Set(prevIds);
        newSet.delete(id);
        return newSet;
      });

      // 삭제 후 드래그 상태 초기화 (기존 로직)
      if (draggingId === id) {
        resetDragState()
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        document.body.style.overflow = '';
      }
      // 삭제 후 편집 상태 초기화
      if (editingId === id) {
        setEditingId(null);
      }
    }, TRANSITION_DURATION); // CSS transition 시간과 일치시킵니다.
  }, [setUserLayerDataType, draggingId, editingId, canvas, setDrawingData, setImgData, resetDragState]);


  // 드래그/터치 시작 시 공통 로직
  const commonDragStartLogic = useCallback((clientX: number, clientY: number, id: string, targetElement: EventTarget) => {
    const target = targetElement as HTMLElement;

    // 편집 모드일 때는 드래그 방지
    if (editingId === id) {
      return;
    }

    let currentTarget: HTMLElement | null = target;
    while (currentTarget && currentTarget.classList[0] !== 'list-item') {
      if (currentTarget.tagName === 'INPUT' || currentTarget.tagName === 'IMG' || currentTarget.classList.contains('list-item-controls')) {
        return; // 컨트롤 요소 클릭 시 DND 방지 (체크박스, 삭제 버튼, 텍스트 인풋 등)
      }
      currentTarget = currentTarget.parentElement;
    }
    if (currentTarget === null || !currentTarget.classList.contains('list-item')) {
      return;
    }

    if (deletingIds.has(id)) {
      return;
    }

    setDraggingId(id);

    const draggedElement = itemRefs.current.get(id);
    if (!draggedElement) return;

    const rect = draggedElement.getBoundingClientRect();
    setOverlayPos({ x: rect.left, y: rect.top });

    setOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });

    setOriginalIndex(userLayerDataType.findIndex(item => item.id === id));

    const newRects = new Map<string, DOMRect>();
    userLayerDataType.forEach(item => {
      const el = itemRefs.current.get(item.id);
      if (el) newRects.set(item.id, el.getBoundingClientRect());
    });
    itemRects.current = newRects;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    document.body.style.overflow = 'hidden';
  }, [userLayerDataType, deletingIds, editingId]);

  // 레이어 선택(active) 함수 (radio처럼 동작)
  const selectLayer = useCallback((id: string) => {
    setUserLayerDataType(prevItems => prevItems.map(item => ({ ...item, active: item.id === id })));
  }, [setUserLayerDataType]);

  // 체크박스 토글 함수 (visible만 변경)
  const toggleVisible = useCallback((id: string) => {
    setUserLayerDataType(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    );
  }, [setUserLayerDataType]);

  // 마우스/터치 다운 핸들러 (롱프레스/클릭 분기)
  const handlePointerDown = useCallback((clientX: number, clientY: number, id: string, target: EventTarget) => {
    setLongPressTriggered(false);
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      setLongPressTriggered(true);
      commonDragStartLogic(clientX, clientY, id, target);
    }, LONG_PRESS_DURATION);
  }, [commonDragStartLogic]);

  // 마우스/터치 업 핸들러 (롱프레스 여부에 따라 분기)
  const handlePointerUp = useCallback((id: string) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!longPressTriggered) {
      // 롱프레스가 아니면 클릭(선택)
      selectLayer(id);
    }
    setLongPressTriggered(false);
  }, [longPressTriggered, selectLayer]);

  // 마우스 이벤트 래퍼
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, id: string) => {
    if (e.button !== 0) return;
    handlePointerDown(e.clientX, e.clientY, id, e.target);
  }, [handlePointerDown]);
  const handleMouseUp = useCallback((id?: string) => {
    if (!id) return;
    handlePointerUp(id);
    if (draggingId) commonDragEndLogic();
  }, [handlePointerUp, draggingId, commonDragEndLogic]);

  // 터치 이벤트 래퍼
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>, id: string) => {
    if (e.touches.length !== 1) return;
    handlePointerDown(e.touches[0].clientX, e.touches[0].clientY, id, e.target);
  }, [handlePointerDown]);
  const handleTouchEnd = useCallback((id?: string) => {
    if (!id) return;
    handlePointerUp(id);
    if (draggingId) commonDragEndLogic();
  }, [handlePointerUp, draggingId, commonDragEndLogic]);

  // 드래그 중 (마우스/터치 공통 로직)
  const commonDragMoveLogic = useCallback((clientX: number, clientY: number) => {
    if (!draggingId || offset === null || originalIndex === null) return;

    const newX = clientX - offset.x;
    const newY = clientY - offset.y;
    setOverlayPos({ x: newX, y: newY });

    const draggedHeight = itemRects.current.get(draggingId)?.height || 0;
    const draggedCenterY = newY + draggedHeight / 2;

    let newTargetIndex = originalIndex;

    for (let i = 0; i < userLayerDataType.length; i++) {
      if (userLayerDataType[i].id === draggingId) continue;

      const targetRect = itemRects.current.get(userLayerDataType[i].id);
      if (targetRect) {
        const targetCenterY = targetRect.top + targetRect.height / 2;

        if (draggedCenterY > targetRect.top && draggedCenterY < targetRect.bottom) {
          if (i < originalIndex && draggedCenterY < targetCenterY) {
            newTargetIndex = i;
            break;
          }
          if (i > originalIndex && draggedCenterY > targetCenterY) {
            newTargetIndex = i;
            break;
          }
        }
      }
    }

    if (newTargetIndex !== null && newTargetIndex !== userLayerDataType.findIndex(item => item.id === draggingId)) {
      setUserLayerDataType(prevItems => {
        const currentDraggingIndex = prevItems.findIndex(item => item.id === draggingId);
        const movedItems = arrayMove(prevItems, currentDraggingIndex, newTargetIndex!);

        movedItems.forEach(item => {
          const el = itemRefs.current.get(item.id);
          const firstRect = itemRects.current.get(item.id);
          if (el && firstRect && item.id !== draggingId) {
            const lastRect = el.getBoundingClientRect();
            const deltaX = firstRect.left - lastRect.left;
            const deltaY = firstRect.top - lastRect.top;

            if (deltaX || deltaY) {
              el.style.transition = 'none';
              el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
              el.getBoundingClientRect();
              el.style.transition = 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out, box-shadow 0.2s ease-in-out';
              el.style.transform = '';
            }
          }
        });
        return movedItems;
      });
      setOriginalIndex(newTargetIndex);
    }
  }, [draggingId, offset, originalIndex, userLayerDataType, setUserLayerDataType]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    commonDragMoveLogic(e.clientX, e.clientY);
  }, [commonDragMoveLogic]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      commonDragMoveLogic(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [commonDragMoveLogic]);

  // 텍스트 편집 관련 핸들러
  const handleTextClick = useCallback((id: string) => {
    // 드래그 중이거나 삭제 애니메이션 중이 아닐 때만 편집 모드로 전환
    if (!draggingId && !deletingIds.has(id)) {
      setEditingId(id);
    }
  }, [draggingId, deletingIds]);

  // 레이어 이름 변경 UserLayerDataType의 text변경
  const handleTextInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    setUserLayerDataType(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, text: e.target.value } : item
      )
    );
  }, [setUserLayerDataType]);

  const handleTextBlur = useCallback(() => {
    setEditingId(null); // 편집 모드 종료
  }, []);

  const handleTextKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.currentTarget.blur(); // Enter 또는 Escape 키를 누르면 blur 이벤트 발생시켜 편집 모드 종료
    }
  }, []);


  // 전역 이벤트 리스너 등록 및 해제 (마우스)
  useEffect(() => {
    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', () => handleMouseUp(draggingId ?? undefined));
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', () => handleMouseUp(draggingId ?? undefined));
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', () => handleMouseUp(draggingId ?? undefined));
    };
  }, [draggingId, handleMouseMove, handleMouseUp]);

  // 전역 이벤트 리스너 등록 및 해제 (터치)
  useEffect(() => {
    if (draggingId) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', () => handleTouchEnd(draggingId ?? undefined), { passive: false });
    } else {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', () => handleTouchEnd(draggingId ?? undefined));
    }
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', () => handleTouchEnd(draggingId ?? undefined));
    };
  }, [draggingId, handleTouchMove, handleTouchEnd]);

  // 드래그 오버레이 scale 트랜지션 효과
  useEffect(() => {
    if (draggingId) {
      setOverlayScale(1); // 처음엔 1로
      setTimeout(() => setOverlayScale(0.65), 0); // 다음 tick에 0.65로 변경
    } else {
      setOverlayScale(1); // 드래그 끝나면 원래대로
    }
  }, [draggingId]);

  return (
    <div className="list-container">
      {userLayerDataType.map(item => {
        const isDeleting = deletingIds.has(item.id);
        const isCurrentlyDragging = item.id === draggingId;
        const isEditing = item.id === editingId;
        const isSelected = item.active;
        return (
          <div
            key={item.id}
            ref={(el) => {
              if (el) itemRefs.current.set(item.id, el);
              else itemRefs.current.delete(item.id);
            }}
            className={`list-item${isCurrentlyDragging ? ' is-dragging' : ''}${isDeleting ? ' is-deleting' : ''}${isSelected ? ' selected' : ''}`}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
            onMouseUp={() => handleMouseUp(item.id)}
            onTouchStart={(e) => handleTouchStart(e, item.id)}
            onTouchEnd={() => handleTouchEnd(item.id)}
            onTransitionEnd={(e) => {
              if (e.propertyName === 'opacity' && isDeleting) {
                console.log(`Item ${item.id} animation ended, ready for removal`);
              }
            }}
          >
            {isEditing ? (
              <input
                type="text"
                value={item.text}
                onChange={(e) => handleTextInputChange(e, item.id)}
                onBlur={handleTextBlur}
                onKeyDown={handleTextKeyDown}
                className="list-item-input"
                autoFocus // 편집 모드 진입 시 자동으로 포커스
                // 드래그 시작 방지를 위해 mousedown/touchstart 이벤트 전파 중지
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                onClick={() => {
                  if (item.LayerType !== 'Cut') handleTextClick(item.id);
                }}
                // 드래그 시작 방지를 위해 mousedown/touchstart 이벤트 전파 중지 (선택 사항, 필요 시)
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                style={{
                  cursor: 'pointer',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  maxWidth: '50%'
                }}
              >
                {item.text}
              </span>
            )}
            <div className="list-item-controls">
              <CustomCheckbox id={item.id} visible={item.visible} onToggleVisible={toggleVisible} size={24} />
              {item.LayerType !== 'Cut' && ( // Cut 타입은 삭제 불가
                <img
                  src={trash}
                  alt="Delete"
                  className="delete-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    if(item.LayerType !== 'Cut'){
                      onDelete(item.id, item.LayerType);
                    }
                  }}
                />
              )}
            </div>
          </div>
        );
      })}

      {/* 드래그 중인 항목을 위한 오버레이*/}
      {draggingId && overlayPos && offset && (
        <div
          className={`list-item dragged-overlay${userLayerDataType.find(item => item.id === draggingId)?.active ? ' selected' : ''}`}
          style={{
            left: overlayPos.x,
            top: overlayPos.y,
            width: itemRects.current.get(draggingId)?.width || 'auto',
            height: itemRects.current.get(draggingId)?.height || 'auto',
            transform: `scale(${overlayScale})`,
            transformOrigin: `${offset.x}px ${offset.y}px`,
            transition: 'transform 0.2s ease-in-out',
          }}
        >
          {/* items 배열에서 draggingId와 일치하는 아이템을 찾아서 텍스트를 표시합니다. */}
          {userLayerDataType.find(item => item.id === draggingId)?.text}
          <div className="list-item-controls">
            {/* CustomCheckbox에 드래그 중인 아이템의 ID와 체크 상태를 전달합니다. */}
            <CustomCheckbox
              id={draggingId}
              visible={userLayerDataType.find(item => item.id === draggingId)?.visible ?? true}
              onToggleVisible={toggleVisible}
              size={24} 
            />
            {userLayerDataType.find(item => item.id === draggingId)?.LayerType !== 'Cut' && ( // Cut 타입은 삭제 불가
              <img
                src={trash}
                alt="Delete"
                className="delete-icon"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DndList;