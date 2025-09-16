import React, {useState, useEffect, useContext} from 'react';
import ExportInput from './ExportInput';
import ExportTextarea from './ExportTextarea';
import ExportSwitch from './ExportSwitch';
import ExportButton from './ExportButton';
import ExportPasswordInput from './ExportPasswordInput';
import AgreementSection from './AgreementSection';
import ExportCanvas from './ExportCanvas';

import { createFrameData } from './frame.api.ts'

import '../../../styles/Workspace/export/ExportContent.css';
import AppContext from "../../../contexts/AppContext.ts";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    mediaQueryList.addEventListener('change', listener);
    return () => mediaQueryList.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

function ExportContent({closeExportPopup}: {closeExportPopup: () => void}) {
  const { frameInfo,  Image } = useContext(AppContext).export;

  const { isPublic, setIsPublic } = frameInfo.isPublic
  const { author, setAuthor } = frameInfo.author
  const { frameName, setFrameName } = frameInfo.frameName
  const { authorPw, setAuthorPw } = frameInfo.authorPw
  const { desc, setDesc } = frameInfo.desc

  const { processedImage, setProcessedImage } = Image

  // useEffect(() => {
  //   if(processedImage.current){
  //     console.log(processedImage.current)
  //   }
  // }, [processedImage, setProcessedImage]);

  const [isAgreementValid, setIsAgreementValid] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const isNarrowScreen = useMediaQuery('(max-aspect-ratio: 1/1)');
  const showPreviewOnly = isNarrowScreen && isPreviewVisible;

  const handleInitialSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAgreementValid) {
      alert('필수 항목에 동의해주세요.');
      return;
    }

    if (isNarrowScreen) {
      setIsPreviewVisible(true);
    } else {
      handleConfirmSave();
    }
  };

  const handleConfirmSave = () => {
    if (!isAgreementValid) {
      alert('필수 항목에 동의해주세요.');
      return;
    }
    if (processedImage){
      const FrameData = createFrameData(
          processedImage,
          isPublic,
          author,
          frameName,
          authorPw,
          desc,
      )
      closeExportPopup()
    }
  };

  return (
      <div className="export-transition-container">
        <div className={`form-view ${!showPreviewOnly ? 'active' : ''}`}>
          <div className="export-content-container">
            <form className="export-form" onSubmit={handleInitialSave}>
              <div className='export-content-header'>
                <div>프레임 내보내기</div>
                <div>
                  <ExportSwitch checked={isPublic} onChange={setIsPublic} onLabel="공개" offLabel="비공개" />
                </div>
              </div>
              <div className='export-content-inputs'>
                <div className='export-content-input'>
                  <ExportInput
                      label="제작자"
                      placeholder={'제작자'}
                      value={author}
                      onChange={e => setAuthor(e.target.value)}
                      name="author"
                      autoComplete="username"
                  />
                  <ExportInput
                      label="프레임 이름"
                      placeholder={'프레임 이름'}
                      value={frameName}
                      onChange={e => setFrameName(e.target.value)}
                      name="frameName"
                      autoComplete="off"
                  />
                </div>
                <div style={{ width: '50%', paddingRight: '8px' }}>
                  <ExportPasswordInput
                      label="제작자 구분 비밀번호"
                      value={authorPw}
                      onChange={e => setAuthorPw(e.target.value)}
                      placeholder="비밀번호를 입력하세요"
                      name="authorPassword"
                      autoComplete="new-password"
                  />
                </div>
                <ExportTextarea
                    label="프레임의 설명"
                    placeholder={'프레임 설명을 입력하세요.'}
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                />

                <AgreementSection onValidityChange={setIsAgreementValid} />
              </div>
              <div className='export-content-button'>
                <ExportButton type="submit" disabled={!isAgreementValid}>저장</ExportButton>
              </div>
            </form>
            <div className='export-preview'>
              <ExportCanvas processedImage={processedImage} setProcessedImage={setProcessedImage} />
            </div>
          </div>
        </div>

        <div className={`preview-view ${showPreviewOnly ? 'active' : ''}`}>
          <div className="export-preview-container">
            <div className="export-preview visible">
              <ExportCanvas processedImage={processedImage} setProcessedImage={setProcessedImage} />
            </div>
            <div className="export-content-button">
              <ExportButton onClick={handleConfirmSave} disabled={!isAgreementValid}>
                확인
              </ExportButton>
            </div>
          </div>
        </div>
      </div>
  );
}

export default ExportContent;