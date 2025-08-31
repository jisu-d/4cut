import React from 'react';
import '../../styles/SignUp/FormInput.css';

type InputProps = {
  label: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  rightButtonText?: string;
  onRightButtonClick?: () => void;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  isError?: boolean;
  helperText?: string;
};

export function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  rightButtonText,
  onRightButtonClick,
  rightIcon,
  onRightIconClick,
  isError,
  helperText,
}: InputProps) {
  return (
    <div className={`su-field ${isError ? "su-field-error" : ""}`}>
      <label className="su-label">{label}</label>
      <div className="su-input-wrap">
        <input
          className="su-input"
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
        />
        {rightButtonText && (
          <button type="button" className="su-right-btn" onClick={onRightButtonClick}>
            {rightButtonText}
          </button>
        )}
        {rightIcon && (
          <div className="su-right-icon" onClick={onRightIconClick}>
            {rightIcon}
          </div>
        )}
      </div>
      {helperText ? <p className="su-helper">{helperText}</p> : <p className='su-helper' style={{
        opacity: '0',
      }}>테스트 텍스트</p>}
    </div>
  );
}
