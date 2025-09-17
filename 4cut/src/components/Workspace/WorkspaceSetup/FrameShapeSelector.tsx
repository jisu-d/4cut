import React from 'react';
import '../../../styles/Workspace/WorkspaceSetup/FrameShapeSelector.css';

// 타입 정의를 WorkspaceSetup에서 가져오거나 여기에 다시 정의할 수 있습니다.
// 여기서는 간단하게 string으로 처리합니다.
type FrameType = '3305x4920' | '1652x4920' | '4920x1652';

interface FrameShapeSelectorProps {
  selectedType: FrameType;
  onChange: (type: FrameType) => void;
}

const FrameShapeSelector: React.FC<FrameShapeSelectorProps> = ({ selectedType, onChange }) => {
  return (
    <div className="setup-section">
      <label>프레임 모양</label>
      <div className="frame-type-group">
        {(['3305x4920', '1652x4920', '4920x1652'] as FrameType[]).map(type => {
          const isSelected = selectedType === type;
          let previewClass = 'preview-portrait';
          if (type === '1652x4920') previewClass = 'preview-skinny-portrait';
          if (type === '4920x1652') previewClass = 'preview-landscape';

          return (
            <label
              key={type}
              className={`frame-type-option ${isSelected ? 'selected' : ''}`}
              onClick={() => onChange(type)}
            >
              <input type="radio" name="frame-type" value={type} />
              <div className="frame-preview">
                <div className={`frame-preview-inner ${previewClass}`}></div>
              </div>
              <span className="frame-dimension-label">{type}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default FrameShapeSelector;
