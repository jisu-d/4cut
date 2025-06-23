import React, {useState} from 'react';
import '../../../styles/Workspace/export/ExportPasswordInput.css';
import InfoIcon from '../../../assets/Icon/Info.svg';
import EyeIcon from '../../../assets/Icon/eye.svg';
import EyeOffIcon from '../../../assets/Icon/eye_off.svg';

interface ExportPasswordInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  maxLength?: number;
  name?: string;
}

const ExportPasswordInput: React.FC<ExportPasswordInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  readOnly,
  disabled,
  maxLength,
  name
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="export-password-input-wrapper">
      {label && (
        <label className="export-password-input-label">
          <span>{label}</span>
          <img src={InfoIcon} alt="info" className="export-password-info-icon" />
        </label>
      )}
      <input
        className="export-password-input"
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        maxLength={maxLength}
        name={name}
      />
      <button
        type="button"
        tabIndex={-1}
        className="export-password-eye-btn"
        onClick={() => setShowPassword(v => !v)}
      >
        <img src={showPassword ? EyeIcon : EyeOffIcon} alt={showPassword ? '비밀번호 표시' : '비밀번호 숨김'} />
      </button>
    </div>
  );
};

export default ExportPasswordInput; 