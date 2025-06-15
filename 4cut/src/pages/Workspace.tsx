// src/components/Dashboard.js
// import React, { useState } from 'react';
import '../styles/Workspace/Workspace.css';

import Dashboard from '../components/Workspace/Dashboard';

import AppContext from '../contexts/AppContext';
import { useEffect, useState, useMemo } from 'react';

import type { ListCutImage, ListItem } from '../types/types'

function Workspace() {
  const [cutImages, setCutImages] = useState<ListCutImage[]>([]);
  const [layers, setLayers] = useState<ListItem[]>([]);

  useEffect(() => { // 임시 데이터
    setCutImages([
      { AspectRatio: '3:4', checked: false },
      { AspectRatio: '3:4', checked: false },
      { AspectRatio: '3:4', checked: false },
      { AspectRatio: '3:4', checked: false },
    ]);

    setLayers([
      { id: '1', text: '뽀짝한그림', checked: true },
      { id: '2', text: '심쿵한 그림', checked: true },
      { id: '3', text: '항목 3', checked: true },
      { id: '4', text: '항목 4', checked: true },
    ]);
  }, []);

  const appProvidedValue = useMemo(() => ({
    addImg: null,
    export: null,
    brush: null,
    layer: {
      cutImageData: {
        cutImageData: cutImages,
        setCutImageData: setCutImages,
      },
      layerData: {
        layerData: layers,
        setLayerData: setLayers,
      },
    },
    colors: null,
  }), [cutImages, layers]);

  return (
    <div className='main-layout'>
      <AppContext.Provider value={appProvidedValue}>
        <div className='tools-panel'>
          <Dashboard />
        </div>
        <div className='canvas-area'>
          {/* 캔버스 관련 내용이 여기에 들어갈 수 있습니다 */}
        </div>
      </AppContext.Provider>
    </div>
  );
}

export default Workspace;