import React, {useEffect, useState} from 'react';
import {CustomCheckbox} from '../../CustomCheckBox';
import '../../../styles/Workspace/export/AgreementSection.css';

const initialAgreements = [
  { id: 'modification', label: '다른 사람이 나의 창작물을 수정하여 배포하는 것에 동의합니다. (필수)', required: true, checked: false },
  { id: 'nonCommercial', label: '다른 사람이 나의 창작물을 이용하는 것에 동의합니다. (비영리 목적, 필수)', required: true, checked: false },
  { id: 'originality', label: '다른 사람의 창작물을 무단으로 이용하지 않았음을 약속합니다. (필수)', required: true, checked: false },
];

interface AgreementSectionProps {
  onValidityChange: (isValid: boolean) => void;
}

const AgreementSection: React.FC<AgreementSectionProps> = ({ onValidityChange }) => {
  const [agreements, setAgreements] = useState(initialAgreements);

  const isAllChecked = agreements.every(item => item.checked);
  const areAllRequiredChecked = agreements.filter(item => item.required).every(item => item.checked);

  useEffect(() => {
    onValidityChange(areAllRequiredChecked);
  }, [areAllRequiredChecked, onValidityChange]);

  const handleToggleAll = () => {
    const newCheckedState = !isAllChecked;
    setAgreements(agreements.map(item => ({ ...item, checked: newCheckedState })));
  };

  const handleToggleItem = (id: string) => {
    setAgreements(agreements.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  return (
    <div className="agreement-section">
      <div className="agreement-item all-agreement">
        <div className="agreement-left">
          <CustomCheckbox id="all" visible={isAllChecked} onToggleVisible={handleToggleAll} size={24} />
          <span className="agreement-label all-label">약관에 모두 동의</span>
        </div>
      </div>
      <hr className="agreement-divider" />
      {agreements.map(item => (
        <div key={item.id} className="agreement-item">
          <div className="agreement-left">
            <CustomCheckbox id={item.id} visible={item.checked} onToggleVisible={() => handleToggleItem(item.id)} size={24} />
            <span className="agreement-label">{item.label}</span>
          </div>
          <span className="agreement-arrow">&gt;</span>
        </div>
      ))}
    </div>
  );
};

export default AgreementSection; 