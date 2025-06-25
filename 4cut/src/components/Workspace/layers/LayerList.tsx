import '../../../styles/Workspace/layers/LayerList.css'

import addIcon from '../../../assets/Icon/add.svg'
import type {UserLayerDataType} from '../../../types/types'

import DndList from './DndList'
import React, {useContext} from 'react';

import AppContext from '../../../contexts/AppContext';

const LayerList = () => {
  const context = useContext(AppContext);

  if (!context.layer?.userLayerDataType) {
    return <div>레이어 데이터를 불러오는 중...</div>;
  }
  const { userLayerDataType, setUserLayerDataType } = context.layer.userLayerDataType;

  const handleAddLayer = () => {
    console.log(userLayerDataType.length + 1);
    
    const newLayer: UserLayerDataType = {
      id: String(userLayerDataType.length + 1),
      text: `새 레이어 ${userLayerDataType.length + 1}`,
      LayerType: 'Drawing',
      checked: true,
      selected: false
    };

    setUserLayerDataType((prevLayerData: UserLayerDataType[]) => [newLayer, ...prevLayerData]);
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