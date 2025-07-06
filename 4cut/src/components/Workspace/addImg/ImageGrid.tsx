import '../../../styles/Workspace/addImg/ImageGrid.css'

import ad from '../../../assets/Icon/AlertCrcle.svg'
import ad1 from '../../../assets/Icon/brush.svg'
import a2d from '../../../assets/Icon/layerOn.svg'
import asd from '../../../assets/Icon/test.jpg'

import Masonry from 'react-masonry-css'; // Masonry 라이브러리 임포트
import { useContext } from 'react';
import AppContext from '../../../contexts/AppContext';

import type { UserLayerDataType, ImgDataItem } from '../../../types/types'

function ImageGrid() {
    const context = useContext(AppContext);

    const images = [
        { src: '/src/assets/Icon/test.jpg', alt: '캠퍼스 맵' },
        { src: '/src/assets/Icon/AlertCrcle.svg', alt: '파일 미리보기 큰 캘린더' },
        { src: '/src/assets/Icon/test.jpg', alt: '캠퍼스 맵' },
        { src: '/src/assets/Icon/brush.svg', alt: '짧은 텍스트 미리보기' },
        { src: '/src/assets/Icon/brush.svg', alt: '파일 미리보기 작은 캘린더' },
        { src: '/src/assets/Icon/test.jpg', alt: '캠퍼스 맵' },
        { src: '/src/assets/Icon/brush.svg', alt: '짧은 텍스트 미리보기' },
        { src: '/src/assets/Icon/brush.svg', alt: '파일 미리보기 작은 캘린더' },
        { src: '/src/assets/Icon/brush.svg', alt: '짧은 텍스트 미리보기' },
        { src: '/src/assets/Icon/brush.svg', alt: '파일 미리보기 작은 캘린더' },
    ];

    // 반응형 브레이크포인트 설정: 화면 너비에 따라 컬럼 수를 변경합니다.
    const breakpointColumnsObj = {
        default: 3,    // 기본 3개 컬럼 (가장 넓은 화면)
        1200: 3,       // 1200px 이하일 때 3개 컬럼
        992: 2,        // 992px 이하일 때 2개 컬럼
        768: 1         // 768px 이하일 때 1개 컬럼
    };

    const handleImageClick = (imageSrc: string) => {
        if (!context.layer?.userLayerDataType || !context.layer?.imgData) {
            console.log('레이어 데이터를 불러올 수 없습니다.');
            return;
        }

        const { userLayerDataType, setUserLayerDataType } = context.layer.userLayerDataType;
        const { setImgData } = context.layer.imgData;

        const layerName = `img-${userLayerDataType.length + 1}`
        
        const newLayerData: UserLayerDataType = {
            id: `${userLayerDataType.length + 1}`,
            text: layerName,
            LayerType: 'Img',
            visible: true,
            active: false
        };

        setUserLayerDataType(prev => [newLayerData, ...prev]);

        const newImgData: ImgDataItem = {
            id: `img-${Date.now()}`,
            url: imageSrc,
            left: 0,
            top: 0,
            scaleX: 1,
            scaleY: 1,
            angle: 0
        };

        setImgData(prev => ({
            ...prev,
            [layerName]: newImgData
        }));
    };

    return (
        <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
        >
            {images.map((image, index) => (
                <div 
                    key={index} 
                    className="image-item"
                    onClick={() => handleImageClick(`${image.src}`)}
                    style={{ cursor: 'pointer' }}
                >
                    <img src={`http://localhost:5173${image.src}`} alt={image.alt} />
                </div>
            ))}
        </Masonry>
    )
}

export default ImageGrid;