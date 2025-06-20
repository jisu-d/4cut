// src/components/Dashboard.js
import React, { useState, useContext } from 'react';

import '../../styles/Workspace/Dashboard.css';

import AppContext from '../../contexts/AppContext';

import imgIcon from '../../assets/Icon/img.svg';
import uploadIcon from '../../assets/Icon/upload.svg';

import brushIcon from '../../assets/Icon/brush.svg';
import brushIconOn from '../../assets/Icon/brushOn.svg';

import layerIcon from '../../assets/Icon/layer.svg';
import layerIconOn from '../../assets/Icon/layerOn.svg';

import LayersContent from './layers/LayersContent';
import AddImgContent from './addImg/AddImgContent';
import ColorsContent from './colors/ColorsContent';
//import ExportContent from './export/ExportContent';

// const PreviewContent = () => <div>Add Image Content</div>;
const SettingsContent = () => <div>Export Content</div>;
const ExportContent = () => <div>업로드중...</div>;


function Dashboard({ openExportPopup, isExportPopupOpen }: { openExportPopup: () => void, isExportPopupOpen: boolean }) {
  const [selectedMenu, setSelectedMenu] = useState('colors'); // 초기값
  const context = useContext(AppContext);
  if (!context.colors) return null;
  const { hsl } = context.colors.chosenColor.hslData;

  const renderContent = () => {
    switch (selectedMenu) {
      case 'addImg':
        return <AddImgContent />;
      case 'brushes':
        return <SettingsContent />;
      case 'export':
        return <ExportContent />;
      case 'layers':
        return <LayersContent />;
      case 'colors':
        return <ColorsContent />;
      default:
        return (<div>Error: Content not found.</div>); // 기본값 또는 에러 처리
    }
  };

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
            className={isExportPopupOpen ? 'selected' : ''}
            onClick={() => {
              openExportPopup();
              setSelectedMenu('export');
            }}
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
            style={{
              backgroundColor: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
            }}
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