import ImageRatioSelector from './ImageRatioSelector';
import LayerList from './LayerList';

import '../../../styles/Workspace/layers/LayersContent.css'

function LayersContent(){
    return (
        <div className="layer-panel-container">
            <ImageRatioSelector />
            <LayerList />
        </div>
    )
}

export default LayersContent;