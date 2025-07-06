import '../../../styles/Workspace/layers/LayerList.css'

import addIcon from '../../../assets/Icon/add.svg'
import type {UserLayerDataType, ListDrawingItem, DrawingItem} from '../../../types/types'

import DndList from './DndList'
import React, {useContext} from 'react';

import AppContext from '../../../contexts/AppContext';

const LayerList = () => {
  const context = useContext(AppContext);

  if (!context.layer?.userLayerDataType) {
    return <div>레이어 데이터를 불러오는 중...</div>;
  }
  const { userLayerDataType, setUserLayerDataType } = context.layer.userLayerDataType;
  const { drawingData, setDrawingData } = context.layer.DrawingData;

  const handleAddLayer = () => {
    
    const newLayer: UserLayerDataType = {
      id: String(userLayerDataType.length + 1),
      text: `drawing-${userLayerDataType.length + 1}`,
      LayerType: 'Drawing',
      visible: true,
      active: false
    };

    const newDrawingData: ListDrawingItem = {
      [newLayer.text]: []
    }
    

    setUserLayerDataType((prevLayerData: UserLayerDataType[]) => [newLayer, ...prevLayerData]);

    setDrawingData((drawingData: ListDrawingItem) => ({...drawingData, ...newDrawingData}));
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
        items={userLayerDataType}
        setItems={setUserLayerDataType}
      />
    </div>
  );
}

export default LayerList;