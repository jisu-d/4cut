import React from 'react';
import '../styles/CustomCheckBox.css'; // 체크박스 관련 스타일 임포트

interface CustomCheckboxProps {
  id: string; // 어떤 항목의 체크박스인지 식별하기 위한 ID
  visible: boolean; // 체크 상태
  onToggleVisible: (id: string) => void; // 체크 상태를 토글하는 함수
  size: number; // 체크박스 크기를 위한 prop (기본값 24)
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ id, visible, onToggleVisible, size = 24 }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 요소 (DraggableItem)의 드래그 이벤트가 트리거되지 않도록 방지
    onToggleVisible(id);
  };

  // 체크박스와 SVG 아이콘의 크기를 동적으로 설정
  const checkboxStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  // 체크박스 크기에 비례하여 SVG 아이콘 크기 조절 (예: 2/3 비율)
  const svgSize = size * (2 / 3);

  return (
    <div
      className={`custom-checkbox ${visible ? 'checked' : ''}`}
      onClick={handleClick}
      style={checkboxStyle}
    >
      {visible && (
        <svg
          viewBox="0 0 24 24"
          width={svgSize}
          height={svgSize}
          stroke="white"
          strokeWidth="3" // 선명한 체크 표시를 위해 두께를 약간 조절할 수 있습니다.
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
    </div>
  );
};