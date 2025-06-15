import React from 'react';
import '../../styles/Workspace/customCheckbox.css'; // 체크박스 관련 스타일 임포트

interface CustomCheckboxProps {
  id: string; // 어떤 항목의 체크박스인지 식별하기 위한 ID
  checked: boolean; // 체크 상태
  onToggle: (id: string) => void; // 체크 상태를 토글하는 함수
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ id, checked, onToggle }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 요소 (DraggableItem)의 드래그 이벤트가 트리거되지 않도록 방지
    onToggle(id);
  };

  return (
    <div className={`custom-checkbox ${checked ? 'checked' : ''}`} onClick={handleClick}>
      {checked && (
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
    </div>
  );
};