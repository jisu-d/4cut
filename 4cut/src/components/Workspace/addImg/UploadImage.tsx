import '../../../styles/Workspace/addImg/UploadImage.css'

import ImageUploadBtn from './ImageUploadBtn'
import AlertBtn from './AlertBtn'

function UploadImage(){
    return (
        <div className='uplad-image-container'>
            <ImageUploadBtn />
            <AlertBtn />
        </div>
    )
}

export default UploadImage;