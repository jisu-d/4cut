import React from 'react';
import '../../../styles/Workspace/WorkspaceSetup/CutCountSelector.css';

interface CutCountSelectorProps {
  cutCount: number;
  maxCuts: number;
  onCutCountChange: (count: number) => void;
}

const CutCountSelector: React.FC<CutCountSelectorProps> = ({ cutCount, maxCuts, onCutCountChange }) => {
  return (
    <div className="setup-section">
      <label>컷 개수</label>
      <div className="cut-count-group">
        {[2, 3, 4, 5, 6].map(count => {
          const isDisabled = count > maxCuts;
          return (
            <button
              key={count}
              className={`cut-count-button ${cutCount === count ? 'selected' : ''}`}
              onClick={() => onCutCountChange(count)}
              disabled={isDisabled}
            >
              {count}컷
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CutCountSelector;
