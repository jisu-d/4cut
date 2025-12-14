import { CustomCheckbox } from '../../CustomCheckBox.tsx';
import '../../../styles/PhotoShoot/FrameSelection/FrameCard.css';

import eye_icon from '../../../assets/Icon/Mypage/eye.svg'

interface ArtworkCardProps {
    id: number;
    isSelected: boolean;
    onClick: () => void;
    title: string;
    previewUrl: string;
    viewCount: string;
    createdDate: string;
}

export function ArtworkCard({ title, previewUrl, viewCount, createdDate, isSelected, onClick }: ArtworkCardProps) {
    return (
        <div className="artwork-card" onClick={onClick}>
            <div className="artwork-card-container">
                {/* 이미지 */}
                <div className="artwork-image-container">
                    <div
                        className="artwork-image"
                        style={{ backgroundImage: `url('${previewUrl}')` }}
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
                <div className="custom-checkbox-container">
                    {isSelected && (
                        <CustomCheckbox
                            id={title}
                            visible={isSelected}
                            onToggleVisible={onClick}
                            size={24}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}