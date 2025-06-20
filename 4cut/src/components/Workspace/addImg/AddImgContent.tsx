import '../../../styles/Workspace/addImg/AddImgContent.css'

import ImageGrid from './ImageGrid'

import SearchUploadImage from './SearchUploadImage'
import UploadImage from './UploadImage'

function AddImgContent() {
    return (
        <div className="addImg-panel-container">
            <div className='image-uploader-container'>
                <div>이미지 가져오기</div>
                <div >
                    <SearchUploadImage />
                    <UploadImage />
                </div>
            </div>
            <div className="image-preview-container">
                <div>파일</div>
                <div className="image-grid-scroll-area">
                    <ImageGrid />
                </div>
            </div>
        </div>
    )
}

export default AddImgContent;