import React, { useState } from 'react';
import ExportInput from './ExportInput';
import ExportTextarea from './ExportTextarea';
import ExportSwitch from './ExportSwitch';
import ExportButton from './ExportButton';
import ExportPasswordInput from './ExportPasswordInput';
import AgreementSection from './AgreementSection';

import '../../../styles/Workspace/export/ExportContent.css';

function ExportContent() {
  const [isPublic, setIsPublic] = useState(true);
  const [author, setAuthor] = useState('박영수');
  const [frameName, setFrameName] = useState('무한도전 프레임');
  const [authorPw, setAuthorPw] = useState('');
  const [desc, setDesc] = useState('우한초졸에 출연한 박영수의 대표적인 밈을 활용해 구한형 네 컷 패러디 프레임입니다. 독특의 맑거나 상황을 재현하여 웃음을 유도하는 형식으로 제작되어진 프레임 디자인 입니다.');
  const [isAgreementValid, setIsAgreementValid] = useState(false);

  const handleSave = () => {
    alert('저장되었습니다!');
  };

  return (
    <div className="export-content-container">
      <div className='export-content-header'>
        <div>프레임 내보내기</div>
        <div>
           <ExportSwitch checked={isPublic} onChange={setIsPublic} onLabel="공개" offLabel="비공개" />
        </div>
      </div>
      <div className='export-content-input'>
        <ExportInput label="제작자" placeholder={'제작자'} value={author} onChange={e => setAuthor(e.target.value)}  />
        <ExportInput label="프레임 이름" placeholder={'프레임 이름'} value={frameName} onChange={e => setFrameName(e.target.value)} />
      </div>
      <div style={{ width: '50%', marginBottom: 16, paddingRight: '8px'}}>
        <ExportPasswordInput
          label="제작자 구분 비밀번호"
          value={authorPw}
          onChange={e => setAuthorPw(e.target.value)}
          placeholder="비밀번호를 입력하세요"
        />
      </div>
      <ExportTextarea label="프레임의 설명" value={desc} onChange={e => setDesc(e.target.value)} />

      <AgreementSection onValidityChange={setIsAgreementValid} />

      <div className='export-content-button'>
        <ExportButton onClick={handleSave} disabled={!isAgreementValid}>저장</ExportButton>
      </div>
    </div>
  );
}

export default ExportContent;