import '../../../styles/Workspace/addImg/SearchUploadImage.css'

import searchIcon from '../../../assets/Icon/search.svg'

function SearchUploadImage(){
    return (
        <div className='search-upload-image-container'>
            <img src={searchIcon} alt="search"  />
            <input type="text" placeholder='업로드 검색'/>
        </div>
    )
}

export default SearchUploadImage;