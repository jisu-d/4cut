import { useState, useEffect } from 'react';
import '../../../styles/Workspace/WorkspaceSetup/WorkspaceSetup.css';
import FrameShapeSelector from './FrameShapeSelector';
import CutCountSelector from './CutCountSelector';
import CutRatioSelector from './CutRatioSelector';
import BackgroundColorSelector from './BackgroundColorSelector';

// 타입 정의
type FrameType = '3305x4920' | '1652x4920' | '4920x1652';
type Ratio = '16:9' | '4:3' | '3:4' | '1:1';

const RATIO_CYCLE: Ratio[] = ['4:3', '16:9', '3:4', '1:1'];

const WorkspaceSetup = () => {
  // --- STATE --- //
  const [frameType, setFrameType] = useState<FrameType>('3305x4920');
  const [cutCount, setCutCount] = useState<number>(4);
  const [cutRatios, setCutRatios] = useState<Ratio[]>(Array(4).fill('4:3'));
  const [bgColor, setBgColor] = useState('#4F46E5');

  const maxCuts = frameType === '3305x4920' ? 6 : 4;

  // --- EFFECTS --- //

  // 프레임 타입 변경 시 컷 개수 조정
  useEffect(() => {
    if (cutCount > maxCuts) {
      setCutCount(maxCuts);
    }
  }, [frameType, cutCount, maxCuts]);

  // 컷 개수 변경 시 비율 배열 조정
  useEffect(() => {
    setCutRatios(currentRatios => {
      const newRatios = Array(cutCount).fill('4:3');
      // 기존 설정을 최대한 유지
      for (let i = 0; i < Math.min(currentRatios.length, cutCount); i++) {
        newRatios[i] = currentRatios[i];
      }
      return newRatios;
    });
  }, [cutCount]);

  // --- HANDLERS --- //

  const handleRatioClick = (index: number) => {
    const currentRatio = cutRatios[index];
    const nextIndex = (RATIO_CYCLE.indexOf(currentRatio) + 1) % RATIO_CYCLE.length;
    const nextRatio = RATIO_CYCLE[nextIndex];
    
    const newRatios = [...cutRatios];
    newRatios[index] = nextRatio;
    setCutRatios(newRatios);
  };

  const handleCreate = () => {
    const settings = {
      frameType,
      cutCount,
      cutRatios,
      bgColor,
    };
    console.log('생성하기 클릭', settings);
  };

  // --- RENDER --- //

  return (
      <div className='workspace-setup-panel'>
          <div className="setup-container">
              <div className='setup-wrapper'>
                  <div className="setup-title">프레임 설정</div>

                  <div>
                      <FrameShapeSelector selectedType={frameType} onChange={setFrameType} />
                      <CutCountSelector cutCount={cutCount} maxCuts={maxCuts} onCutCountChange={setCutCount} />
                      <CutRatioSelector cutRatios={cutRatios} onRatioClick={handleRatioClick} />

                      <BackgroundColorSelector bgColor={bgColor} onBgColorChange={setBgColor} />
                  </div>
              </div>

              <div className="create-button-wrapper">
                  <button className="create-button" onClick={handleCreate}>생성하기</button>
              </div>
          </div>
      </div>
  );
};

export default WorkspaceSetup;
