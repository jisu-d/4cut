import React from 'react';
import '../../../styles/Workspace/DrawingCanvas/CanvasResetButton.css';

interface CanvasResetButtonProps {
  onReset: () => void;
  className?: string;
}

const CanvasResetButton: React.FC<CanvasResetButtonProps> = ({ onReset, className = '' }) => {
  return (
    <button
      className={`canvas-reset-button ${className}`}
      onClick={onReset}
      title="캔버스 위치 초기화"
      aria-label="캔버스 위치를 처음으로 돌리기"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 작은 정사각형 (왼쪽 위) */}
        <rect x="3" y="3" width="8" height="8" rx="1" />
        
        {/* 큰 정사각형 (오른쪽 아래) - 일부가 잘린 느낌 */}
        <rect x="13" y="13" width="8" height="8" rx="1" />
        
        {/* 연결선 */}
        <path d="M11 7L13 13" />
        <path d="M7 11L13 13" />
        
        {/* 화살표 (리셋 느낌) */}
        <path d="M19 5L21 7L19 9" />
        <path d="M5 19L3 17L5 15" />
      </svg>
    </button>
  );
};

export default CanvasResetButton; 