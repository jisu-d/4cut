import React, { useState } from 'react';
import '../../../styles/Workspace/export/ExportInput.css';
import InfoIcon from '../../../assets/Icon/Info.svg';
import EyeIcon from '../../../assets/Icon/eye.svg';
import EyeOffIcon from '../../../assets/Icon/eye_off.svg';

interface ExportInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  disabled?: boolean;
  maxLength?: number;
  name?: string;
}

const ExportInput: React.FC<ExportInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  readOnly,
  disabled,
  maxLength,
  name
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="export-input-wrapper" style={{ position: 'relative' }}>
      {label && (
        <label className="export-input-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {label}
          {isPassword && (
            <img src={InfoIcon} alt="info" style={{ width: 18, height: 18, opacity: 0.7 }} />
          )}
        </label>
      )}
      <input
        className="export-input"
        type={isPassword && !showPassword ? 'password' : 'text'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        maxLength={maxLength}
        name={name}
        style={isPassword ? { paddingRight: 36 } : {}}
      />
      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          className="export-input-eye-btn"
          onClick={() => setShowPassword(v => !v)}
        >
          <img src={showPassword ? EyeIcon : EyeOffIcon} alt={showPassword ? '비밀번호 표시' : '비밀번호 숨김'} style={{ width: 22, height: 22 }} />
        </button>
      )}
    </div>
  );
};

export default ExportInput; 