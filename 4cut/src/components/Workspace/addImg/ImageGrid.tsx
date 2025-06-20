import '../../../styles/Workspace/addImg/ImageGrid.css'

import ad from '../../../assets/Icon/AlertCrcle.svg'
import ad1 from '../../../assets/Icon/brush.svg'
import a2d from '../../../assets/Icon/layerOn.svg'
import asd from '../../../assets/Icon/test.jpg'

import Masonry from 'react-masonry-css'; // Masonry 라이브러리 임포트

function ImageGrid() {

    const images = [
        { src: asd, alt: '캠퍼스 맵' },
        { src: ad, alt: '파일 미리보기 큰 캘린더' },
        { src: asd, alt: '캠퍼스 맵' },
        { src: ad1, alt: '짧은 텍스트 미리보기' },
        { src: a2d, alt: '파일 미리보기 작은 캘린더' },
        { src: asd, alt: '캠퍼스 맵' },
        { src: ad1, alt: '짧은 텍스트 미리보기' },
        { src: a2d, alt: '파일 미리보기 작은 캘린더' },
        { src: ad1, alt: '짧은 텍스트 미리보기' },
        { src: a2d, alt: '파일 미리보기 작은 캘린더' },
    ];

    // 반응형 브레이크포인트 설정: 화면 너비에 따라 컬럼 수를 변경합니다.
    const breakpointColumnsObj = {
        default: 3,    // 기본 3개 컬럼 (가장 넓은 화면)
        1200: 3,       // 1200px 이하일 때 3개 컬럼
        992: 2,        // 992px 이하일 때 2개 컬럼
        768: 1         // 768px 이하일 때 1개 컬럼
    };

    return (
        <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
        >
            {images.map((image, index) => (
                <div key={index} className="image-item">
                    <img src={image.src} alt={image.alt} />
                </div>
            ))}
        </Masonry>
    )
}

export default ImageGrid;