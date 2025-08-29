import React from 'react';
import '../../../styles/Workspace/export/ExportTextarea.css';

interface ExportTextareaProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  maxLength?: number;
  name?: string;
}

const ExportTextarea: React.FC<ExportTextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  readOnly,
  disabled,
  maxLength,
  name
}) => {
  return (
    <div className="export-textarea-wrapper">
      {label && <label className="export-textarea-label">{label}</label>}
      <textarea
        className="export-textarea"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        maxLength={maxLength}
        name={name}
      />
    </div>
  );
};

export default ExportTextarea; 