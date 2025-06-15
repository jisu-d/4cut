// src/components/DndList.tsx
import '../../../styles/Workspace/layers/DndList.css';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { DndListProps } from '../../../types/types';
import trash from '../../../assets/Icon/trash.svg';
import { CustomCheckbox } from '../CustomCheckbox';

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

const DndList: React.FC<DndListProps> = ({ items, setItems }) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overlayPos, setOverlayPos] = useState<{ x: number; y: number } | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);
  const [originalIndex, setOriginalIndex] = useState<number | null>(null);

  // ⭐ 새로 추가된 상태: 삭제 애니메이션이 진행 중인 항목들의 ID를 저장합니다.
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const itemRects = useRef<Map<string, DOMRect>>(new Map());

  // ⭐ 수정된 onDelete 함수: 즉시 삭제 대신 애니메이션을 트리거합니다.
  const onDelete = useCallback((id: string) => {
    // 1. 해당 항목에 'is-deleting' 클래스를 추가하기 위해 deletingIds에 ID를 추가합니다.
    setDeletingIds(prevIds => new Set(prevIds.add(id)));

    // 2. 애니메이션 지속 시간 후에 실제로 items 상태에서 항목을 제거합니다.
    setTimeout(() => {
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      // 3. 삭제 애니메이션이 끝났으므로 deletingIds에서도 해당 ID를 제거합니다.
      setDeletingIds(prevIds => {
        const newSet = new Set(prevIds);
        newSet.delete(id);
        return newSet;
      });

      // 삭제 후 드래그 상태 초기화 (기존 로직)
      if (draggingId === id) {
        setDraggingId(null);
        setOverlayPos(null);
        setOffset(null);
        setOriginalIndex(null);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        document.body.style.overflow = '';
      }
    }, TRANSITION_DURATION); // CSS transition 시간과 일치시킵니다.
  }, [setItems, draggingId]);


  // 드래그/터치 시작 시 공통 로직
  const commonDragStartLogic = useCallback((clientX: number, clientY: number, id: string, targetElement: EventTarget) => {
    const target = targetElement as HTMLElement;

    let currentTarget: HTMLElement | null = target;
    while (currentTarget && currentTarget !== null && currentTarget.classList[0] !== 'list-item') {
      if (currentTarget.tagName === 'INPUT' || currentTarget.tagName === 'IMG' || currentTarget.classList.contains('list-item-controls')) {
        return; // 컨트롤 요소 클릭 시 DND 방지
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

    setOriginalIndex(items.findIndex(item => item.id === id));

    const newRects = new Map<string, DOMRect>();
    items.forEach(item => {
      const el = itemRefs.current.get(item.id);
      if (el) newRects.set(item.id, el.getBoundingClientRect());
    });
    itemRects.current = newRects;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    document.body.style.overflow = 'hidden';
  }, [items, deletingIds]); // deletingIds를 의존성 배열에 추가

  // 마우스 드래그 시작
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, id: string) => {
    if (e.button !== 0) return;
    e.preventDefault();
    commonDragStartLogic(e.clientX, e.clientY, id, e.target);
  }, [commonDragStartLogic]);

  // 터치 드래그 시작
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>, id: string) => {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    commonDragStartLogic(e.touches[0].clientX, e.touches[0].clientY, id, e.target);
  }, [commonDragStartLogic]);

  // 드래그 중 (마우스/터치 공통 로직)
  const commonDragMoveLogic = useCallback((clientX: number, clientY: number) => {
    if (!draggingId || offset === null || originalIndex === null) return;

    const newX = clientX - offset.x;
    const newY = clientY - offset.y;
    setOverlayPos({ x: newX, y: newY });

    const draggedHeight = itemRects.current.get(draggingId)?.height || 0;
    const draggedCenterY = newY + draggedHeight / 2;

    let newTargetIndex = originalIndex;

    for (let i = 0; i < items.length; i++) {
      if (items[i].id === draggingId) continue;

      const targetRect = itemRects.current.get(items[i].id);
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

    if (newTargetIndex !== null && newTargetIndex !== items.findIndex(item => item.id === draggingId)) {
      setItems(prevItems => {
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
  }, [draggingId, offset, originalIndex, items, setItems]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    commonDragMoveLogic(e.clientX, e.clientY);
  }, [commonDragMoveLogic]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      commonDragMoveLogic(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [commonDragMoveLogic]);

  // 드래그/터치 종료 (공통 로직)
  const commonDragEndLogic = useCallback(() => {
    if (draggingId) {
      setDraggingId(null);
      setOverlayPos(null);
      setOffset(null);
      setOriginalIndex(null);

      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.body.style.overflow = '';

      items.forEach(item => {
        const el = itemRefs.current.get(item.id);
        if (el) {
          el.style.transform = '';
        }
      });
    }
  }, [draggingId, items]);

  const handleMouseUp = useCallback(() => {
    commonDragEndLogic();
  }, [commonDragEndLogic]);

  const handleTouchEnd = useCallback(() => {
    commonDragEndLogic();
  }, [commonDragEndLogic]);

  const onToggle = (id: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // 전역 이벤트 리스너 등록 및 해제 (마우스)
  useEffect(() => {
    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, handleMouseMove, handleMouseUp]);

  // 전역 이벤트 리스너 등록 및 해제 (터치)
  useEffect(() => {
    if (draggingId) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd, { passive: false });
    } else {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [draggingId, handleTouchMove, handleTouchEnd]);

  return (
    <div className="list-container">
      {items.map(item => {
        const isDeleting = deletingIds.has(item.id);
        const isCurrentlyDragging = item.id === draggingId;

        return (
          <div
            key={item.id}
            ref={(el) => {
              if (el) itemRefs.current.set(item.id, el);
              else itemRefs.current.delete(item.id);
            }}
            className={`list-item ${isCurrentlyDragging ? 'is-dragging' : ''} ${isDeleting ? 'is-deleting' : ''}`}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
            onTouchStart={(e) => handleTouchStart(e, item.id)}
            // ⭐ 애니메이션 완료 후 DOM에서 제거하는 로직 추가 (선택 사항, 더 견고한 구현을 위해)
            onTransitionEnd={(e) => {
              // opacity나 height 트랜지션이 끝났을 때만 실행 (다양한 트랜지션이 있을 수 있으므로)
              if (e.propertyName === 'opacity' && isDeleting) {
                // setItems(prevItems => prevItems.filter(i => i.id !== item.id)); // 여기서 직접 삭제하면 setTimeout과 중복
                console.log(`Item ${item.id} animation ended, ready for removal`);
              }
            }}
          >
            {item.text}
            <div className="list-item-controls">
              <CustomCheckbox id={item.id} checked={item.checked} onToggle={onToggle} />
              <img
                src={trash}
                alt="Delete"
                className="delete-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
              />
            </div>
          </div>
        );
      })}

      {/* 드래그 중인 항목을 위한 오버레이 (기존과 동일) */}
      {draggingId && overlayPos && offset && (
        <div
          className="list-item dragged-overlay"
          style={{
            left: overlayPos.x,
            top: overlayPos.y,
            width: itemRects.current.get(draggingId)?.width || 'auto',
            height: itemRects.current.get(draggingId)?.height || 'auto',
            transform: 'scale(0.65)',
            transformOrigin: `${offset.x}px ${offset.y}px`,
          }}
        >
          {/* items 배열에서 draggingId와 일치하는 아이템을 찾아서 텍스트를 표시합니다. */}
          {items.find(item => item.id === draggingId)?.text}
          <div className="list-item-controls">
            {/* CustomCheckbox에 드래그 중인 아이템의 ID와 체크 상태를 전달합니다. */}
            <CustomCheckbox
              id={draggingId}
              checked={items.find(item => item.id === draggingId)?.checked ?? true}
              onToggle={onToggle}
            />
            <img
              src={trash}
              alt="Delete"
              className="delete-icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(draggingId); // onDelete 함수에 드래그 중인 아이템의 ID를 전달합니다.
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DndList;