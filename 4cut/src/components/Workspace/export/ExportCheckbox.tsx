import React from 'react';
import '../../../styles/Workspace/export/ExportCheckbox.css';

interface ExportCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ExportCheckbox: React.FC<ExportCheckboxProps> = ({ label, checked, onChange, disabled }) => {
  return (
    <label className="export-checkbox-wrapper">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
        className="export-checkbox-input"
      />
      <span className="export-checkbox-custom" />
      <span className="export-checkbox-label">{label}</span>
    </label>
  );
};

export default ExportCheckbox; 