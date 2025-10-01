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
  const { export: exportContext } = useContext(AppContext);
  const { frameInfo, Image } = exportContext;
  const { processedImage, setProcessedImage } = Image;

  // Local state for form inputs
  const [localIsPublic, setLocalIsPublic] = useState(frameInfo.isPublic.isPublic);
  const [localAuthor, setLocalAuthor] = useState(frameInfo.author.author);
  const [localFrameName, setLocalFrameName] = useState(frameInfo.frameName.frameName);
  const [localAuthorPw, setLocalAuthorPw] = useState(frameInfo.authorPw.authorPw);
  const [localDesc, setLocalDesc] = useState(frameInfo.desc.desc);


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

    frameInfo.isPublic.setIsPublic(localIsPublic);
    frameInfo.author.setAuthor(localAuthor);
    frameInfo.frameName.setFrameName(localFrameName);
    frameInfo.authorPw.setAuthorPw(localAuthorPw);
    frameInfo.desc.setDesc(localDesc);

    if (processedImage){
      const FrameData = createFrameData(
          processedImage,
          localIsPublic,
          localAuthor,
          localFrameName,
          localAuthorPw,
          localDesc,
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
                  <ExportSwitch checked={localIsPublic} onChange={setLocalIsPublic} onLabel="공개" offLabel="비공개" />
                </div>
              </div>
              <div className='export-content-inputs'>
                <div className='export-content-input'>
                  <ExportInput
                      label="제작자"
                      placeholder={'제작자'}
                      value={localAuthor}
                      onChange={e => setLocalAuthor(e.target.value)}
                      name="author"
                      autoComplete="username"
                  />
                  <ExportInput
                      label="프레임 이름"
                      placeholder={'프레임 이름'}
                      value={localFrameName}
                      onChange={e => setLocalFrameName(e.target.value)}
                      name="frameName"
                      autoComplete="off"
                  />
                </div>
                <div style={{ width: '50%', paddingRight: '8px' }}>
                  <ExportPasswordInput
                      label="제작자 구분 비밀번호"
                      value={localAuthorPw}
                      onChange={e => setLocalAuthorPw(e.target.value)}
                      placeholder="비밀번호를 입력하세요"
                      name="authorPassword"
                      autoComplete="new-password"
                  />
                </div>
                <ExportTextarea
                    label="프레임의 설명"
                    placeholder={'프레임 설명을 입력하세요.'}
                    value={localDesc}
                    onChange={e => setLocalDesc(e.target.value)}
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