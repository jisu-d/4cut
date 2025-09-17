import React from 'react';
import '../../../../src/styles/Workspace/WorkspaceSetup/BackgroundColorSelector.css';

interface BackgroundColorSelectorProps {
  bgColor: string;
  onBgColorChange: (color: string) => void;
}

const BackgroundColorSelector: React.FC<BackgroundColorSelectorProps> = ({ bgColor, onBgColorChange }) => {
  return (
    <div className="setup-section-background-color">
      <label>배경색</label>
      <div className="color-picker-wrapper">
        <label className="color-picker-swatch" style={{ backgroundColor: bgColor }}>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => onBgColorChange(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
};

export default BackgroundColorSelector;
