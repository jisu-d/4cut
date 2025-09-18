import '../../../styles/Workspace/layers/LayerList.css'

import addIcon from '../../../assets/Icon/add.svg'
import type {UserLayerDataType, ListDrawingItem} from '../../../types/types'

import DndList from './DndList'
import {useContext} from 'react';

import AppContext from '../../../contexts/AppContext';

const LayerList = () => {
  const context = useContext(AppContext);

  if (!context.layer?.userLayerDataType) {
    return <div>레이어 데이터를 불러오는 중...</div>;
  }
  const { userLayerDataType, setUserLayerDataType } = context.layer.userLayerDataType;
  const { setDrawingData } = context.layer.DrawingData;

  const handleAddLayer = () => {
    const layerId = `drawing-${Date.now()}`
    
    const newLayer: UserLayerDataType = {
      id: layerId,
      text: `drawing-${userLayerDataType.length + 1}`,
      LayerType: 'Drawing',
      visible: true,
      active: false
    };

    const newDrawingData: ListDrawingItem = {
      [layerId]: []
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
      <DndList />
    </div>
  );
}

export default LayerList;