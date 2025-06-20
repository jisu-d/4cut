import React from 'react';
import '../../../styles/Workspace/export/ExportSwitch.css';

interface ExportSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onLabel?: string;
  offLabel?: string;
}

const ExportSwitch: React.FC<ExportSwitchProps> = ({ checked, onChange, onLabel = '공개', offLabel = '비공개' }) => {
  return (
    <div className="export-switch-wrapper">
      <span className={`export-switch-label ${checked ? 'active' : ''}`}>{onLabel}</span>
      <label className="export-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
        />
        <span className="export-switch-slider" />
      </label>
      <span className={`export-switch-label ${!checked ? 'active' : ''}`}>{offLabel}</span>
    </div>
  );
};

export default ExportSwitch; 