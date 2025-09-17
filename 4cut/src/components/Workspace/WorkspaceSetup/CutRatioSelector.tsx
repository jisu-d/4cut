import React from 'react';
import '../../../styles/Workspace/WorkspaceSetup/CutRatioSelector.css';

type Ratio = '16:9' | '4:3' | '3:4' | '1:1';

interface CutRatioSelectorProps {
  cutRatios: Ratio[];
  onRatioClick: (index: number) => void;
}

const CutRatioSelector: React.FC<CutRatioSelectorProps> = ({ cutRatios, onRatioClick }) => {
  return (
    <div className="setup-section">
      <label>컷 비율</label>
      <div className="cut-ratio-grid">
        {cutRatios.map((ratio, index) => (
          <div
            key={index}
            className={`cut-ratio-item ratio-${ratio.replace(':', '-')}`}
            onClick={() => onRatioClick(index)}
          >
            <span className="ratio-text">{ratio}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CutRatioSelector;
