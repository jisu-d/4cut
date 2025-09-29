import '../../styles/Mypage/FrameDetailModal.css';

import placeholderImage from '../../assets/Icon/Mypage/test_img.png';
import avatarPlaceholder from '../../assets/Icon/Mypage/app_icon.png';

import HeartIcon from '../../assets/Icon/heart.svg?react'
import CameraIcon from '../../assets/Icon/camera.svg?react'

const mockArtwork = {
  imageUrl: placeholderImage,
  title: '모던 브랜딩 디자인',
  viewCount: '1.7K',
  likeCount: '234',
  createdDate: '2024.12.15',
  description: '미니멀리즘과 현대적인 감각을 결합한 브랜딩 디자인입니다. 깔끔한 라인과 절제된 색상 사용이 특징입니다.',
  creator: {
    name: '박명수',
    avatarUrl: avatarPlaceholder,
  },
  isOwner: true,
};

const mockRelatedArtworks = Array(6).fill(mockArtwork);

export function FrameDetailModal({ artwork = mockArtwork, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>

        <div className="modal-body-grid">
          {/* Left Column: Image */}
          <div className="modal-image-container">
            <img src={artwork.imageUrl} alt={artwork.title} className="modal-main-image" />
          </div>

          {/* Right Column: Info */}
          <div className="modal-info-container">
            <h1 className="frame-title">{artwork.title}</h1>
            
            <div className="frame-stats">
              <span><HeartIcon />{artwork.likeCount}</span>
              <span><CameraIcon />{artwork.viewCount}</span>
            </div>

            <div className="creator-info">
              <span className="creator-label">제작자</span>
              <div className="creator-details">
                <img src={artwork.creator.avatarUrl} alt={artwork.creator.name} className="creator-avatar" />
                <span>{artwork.creator.name}</span>
              </div>
            </div>

            <div className="tab-content">
              <div className="info-item">
                <span className="info-label">제작 날짜</span>
                <span className="info-value">{artwork.createdDate}</span>
              </div>
              <div>
                <span className="info-label">프레임 설명</span>
                <div className="frame-description">{artwork.description}</div>
              </div>
            </div>


            <div className="action-buttons">
              {artwork.isOwner && <button className="action-btn secondary">수정</button>}
              <button className="action-btn primary">촬영</button>
              <button className="action-btn secondary">공유</button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <h3>이 프레임을 사용한 다른 작품들</h3>
          <div className="related-artworks-carousel">
            {mockRelatedArtworks.map((related, index) => (
              <img key={index} src={related.imageUrl} alt="related artwork" className="related-artwork-item" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}