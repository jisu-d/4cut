// src/components/Dashboard.js
import React, { useState } from 'react';

import '../../styles/Workspace/Dashboard.css'; 

import imgIcon from '../../assets/Icon/img.svg';
import uploadIcon from '../../assets/Icon/upload.svg';
import brushIcon from '../../assets/Icon/brush.svg';
import layerIcon from '../../assets/Icon/layer.svg';

function Dashboard() {
  // 현재 선택된 메뉴를 나타내는 상태
  const [selectedMenu, setSelectedMenu] = useState('preview'); // 초기값은 'preview'

  // 선택된 메뉴에 따라 오른쪽에 렌더링할 컴포넌트를 결정하는 함수
//   const renderContent = () => {
//     switch (selectedMenu) {
//       case 'preview':
//         return <PreviewContent />;
//       case 'settings':
//         return <SettingsContent />;
//       case 'templates':
//         return <TemplateSelectionContent />;
//       case 'export':
//         return <ExportContent />;
//       default:
//         return <PreviewContent />; // 기본값 또는 에러 처리
//     }
//   };

  return (
    // <div className="dashboard-container">
    //   <Sidebar setSelectedMenu={setSelectedMenu} currentMenu={selectedMenu} /> {/* 사이드바에 상태 변경 함수 전달 */}
    //   <main className="content-area">
    //     {renderContent()} {/* 선택된 메뉴에 따른 컨텐츠 렌더링 */}
    //   </main>
    // </div>
    <>
        <div className='tool-header'>
            <div>
                <img src={imgIcon} alt="img" className="img-icon-img" />
                <img src={uploadIcon} alt="upload" className="upload-icon-img" />
            </div>
            <div>
                <img src={brushIcon} alt="brush" className="brush-icon-img" />
                <img src={layerIcon} alt="layer" className="layer-icon-img"/>
                <div className='color-icon'></div>
            </div>
        </div>
        <div className='tool-content'>
            
        </div>
    </>
  );
}

export default Dashboard;