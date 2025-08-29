// import { Eye } from "lucide-react";
import "../../styles/Mypage/ArtworkCard.css";

import eye_icon from '../../assets/Icon/Mypage/eye.svg'

interface ArtworkCardProps {
  id: string;
  title: string;
  imageUrl: string;
  viewCount: string;
  likeCount?: string;
  createdDate?: string;
}

export function ArtworkCard({ title, imageUrl, viewCount, createdDate }: ArtworkCardProps) {
  return (
    <div className="artwork-card">
      <div className="artwork-card-container">
        {/* 이미지 */}
        <div className="artwork-image-container">
          <div
            className="artwork-image"
            style={{ backgroundImage: `url('${imageUrl}')` }}
          />
        </div>

        {/* 카드 정보 */}
        <div className="artwork-info">
          <h3 className="artwork-title">
            {title}
          </h3>
          
          <div className="artwork-meta">
            <div className="artwork-views">
              <img src={eye_icon} style={{
                width: '12px',
              }} alt="" />
              <span>{viewCount}</span>
            </div>
            {createdDate && (
              <span className="artwork-date">{createdDate}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}