import '../../../styles/Workspace/layers/LayerList.css'

import addIcon from '../../../assets/Icon/add.svg'
import type { ListItem } from '../../../types/types'

import DndList from './DndList'
import React, { useContext, useState } from 'react';

import AppContext from '../../../contexts/AppContext';

const LayerList = () => {
  const context = useContext(AppContext);

  if (!context.layer) {
    return <div>레이어 데이터를 불러오는 중...</div>;
  }
  const { layerData, setLayerData } = context.layer.layerData;

  const handleAddLayer = () => {
    console.log(layerData.length + 1);
    
    const newLayer: ListItem = {
      id: String(layerData.length + 1),
      text: `새 레이어 ${layerData.length + 1}`, // 예시 텍스트
      checked: true,
    };

    setLayerData((prevLayerData: ListItem[]) => [newLayer, ...prevLayerData]);
  };

  return (
    <div className='layer-control-section'>
      <div>
        <div>레이어 변경</div>
        <img src={addIcon} onClick={handleAddLayer} style={{
          cursor: "pointer"
        }} alt="" />
      </div>
      <DndList
        items={layerData}
        setItems={setLayerData}
      />
    </div>
  );
}

export default LayerList;