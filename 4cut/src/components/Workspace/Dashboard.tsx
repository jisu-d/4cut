// src/components/Dashboard.js
import React, { useState } from 'react';

import '../../styles/Workspace/Dashboard.css';

import imgIcon from '../../assets/Icon/img.svg';
import uploadIcon from '../../assets/Icon/upload.svg';

import brushIcon from '../../assets/Icon/brush.svg';
import brushIconOn from '../../assets/Icon/brushOn.svg';

import layerIcon from '../../assets/Icon/layer.svg';
import layerIconOn from '../../assets/Icon/layerOn.svg';

import LayersContent from './LayersContent';

const PreviewContent = () => <div>Add Image Content</div>;
const SettingsContent = () => <div>Export Content</div>;
const TemplateSelectionContent = () => <div>Brushes Content</div>;
const ExportContent = () => <div>Layers/Colors Content</div>;


function Dashboard() {
  const [selectedMenu, setSelectedMenu] = useState('layers'); // 초기값

  const renderContent = () => {
    switch (selectedMenu) {
      case 'addImg':
        return <PreviewContent />;
      case 'export':
        return <SettingsContent />;
      case 'brushes':
        return <TemplateSelectionContent />;
      case 'layers':
        return <LayersContent />;
      case 'colors':
        return <ExportContent />;
      default:
        return (<div>Error: Content not found.</div>); // 기본값 또는 에러 처리
    }
  };

  // 조건 ? 참일 때의 값 : 거짓일 때의 값

  return (
    <>
      <div className='tool-header'>
        <div>
          <span
            className={selectedMenu === 'addImg' ? 'selected' : ''} 
            onClick={() => setSelectedMenu('addImg')}
          >
            <img src={imgIcon} alt="img" className="img-icon-img" />
          </span>
          <span
            className={selectedMenu === 'export' ? 'selected' : ''}
            onClick={() => setSelectedMenu('export')}
          >
            <img src={uploadIcon} alt="upload" className="upload-icon-img" />
          </span>
        </div>
        <div>
          <img
            src={selectedMenu === 'brushes' ? brushIconOn : brushIcon}
            alt="brush"
            className="brush-icon-img"
            onClick={() => setSelectedMenu('brushes')}
          />
          <img
            src={selectedMenu === 'layers' ? layerIconOn : layerIcon}
            alt="layer"
            className="layer-icon-img"
            onClick={() => setSelectedMenu('layers')}
          />
          <div
            className={`color-icon ${selectedMenu === 'colors' ? 'selected' : ''}`}
            onClick={() => setSelectedMenu('colors')}
          ></div>
        </div>
      </div>
      <div className='tool-content'>
        {renderContent()}
      </div>
    </>
  );
}

export default Dashboard;