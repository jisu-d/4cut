import React from 'react';
import '../../../styles/Workspace/export/ExportButton.css';

interface ExportButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled,
}) => {
  return (
    <button
      className="export-button"
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default ExportButton; 