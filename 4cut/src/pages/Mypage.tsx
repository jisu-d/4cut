import { useState } from "react";
import img202505041205234 from "../assets/Icon/Mypage/test_img.png";
import appIcon from "../assets/Icon/Mypage/app_icon.png";
import { ArtworkCard } from "../components/Mypage/ArtworkCard";
import { UserInfoViewer } from "../components/Mypage/UserInfoEditor";
import { FrameDetailModal } from "../components/Mypage/FrameDetailModal";

import "../styles/Mypage/MyPage.css";

import AddIcon from '../assets/Icon/Mypage/add.svg?react'
import SettingsIcon from '../assets/Icon/Mypage/settings.svg?react'
import UploadIcon from '../assets/Icon/Mypage/upload.svg?react'

// 작품 데이터 (실제로는 API에서 가져올 데이터)
const artworks = [
  {
    id: "1",
    title: "모던 브랜딩 디자인",
    imageUrl: img202505041205234,
    viewCount: "1.7K",
    likeCount: "234",
    createdDate: "2024.12.15",
    description: '미니멀리즘과 현대적인 감각을 결합한 브랜딩 디자인입니다. 깔끔한 라인과 절제된 색상 사용이 특징입니다.',
    creator: { name: '박명수', avatarUrl: appIcon },
    isOwner: true,
  },
  {
    id: "2",
    title: "미니멀 포스터 컬렉션",
    imageUrl: img202505041205234,
    viewCount: "2.2K",
    likeCount: "445",
    createdDate: "2024.12.10",
    description: '다양한 주제를 미니멀리즘 스타일로 표현한 포스터 컬렉션입니다.',
    creator: { name: '박명수', avatarUrl: appIcon },
    isOwner: true,
  },
  {
    id: "3",
    title: "일러스트레이션 작품",
    imageUrl: img202505041205234,
    viewCount: "1.0K",
    likeCount: "189",
    createdDate: "2024.12.08",
    description: '따뜻한 색감과 감성적인 스토리텔링이 돋보이는 일러스트레이션입니다.',
    creator: { name: '박명수', avatarUrl: appIcon },
    isOwner: true,
  },
  {
    id: "4",
    title: "타이포그래피 프로젝트",
    imageUrl: img202505041205234,
    viewCount: "1.7K",
    likeCount: "267",
    createdDate: "2024.12.05",
    description: '글자의 형태와 구조를 탐구하여 메시지를 시각적으로 전달하는 타이포그래피 프로젝트입니다.',
    creator: { name: '박명수', avatarUrl: appIcon },
    isOwner: true,
  },
  {
    id: "5",
    title: "웹 디자인 시스템",
    imageUrl: img202505041205234,
    viewCount: "1.7K",
    likeCount: "312",
    createdDate: "2024.12.01",
    description: '일관성 있고 효율적인 웹 개발을 위한 디자인 시스템을 구축했습니다.',
    creator: { name: '박명수', avatarUrl: appIcon },
    isOwner: true,
  },
  {
    id: "6",
    title: "아이콘 세트 디자인",
    imageUrl: img202505041205234,
    viewCount: "1.7K",
    likeCount: "198",
    createdDate: "2024.11.28",
    description: '직관적이고 사용하기 쉬운 아이콘 세트를 디자인하여 사용자 경험을 개선했습니다.',
    creator: { name: '박명수', avatarUrl: appIcon },
    isOwner: true,
  },
  {
    id: "7",
    title: "UI/UX 디자인 프로젝트",
    imageUrl: img202505041205234,
    viewCount: "2.5K",
    likeCount: "456",
    createdDate: "2024.11.25",
    description: '사용자 중심의 리서치를 통해 UI/UX를 개선한 프로젝트입니다.',
    creator: { name: '박명수', avatarUrl: appIcon },
    isOwner: true,
  },
  {
    id: "8",
    title: "로고 디자인 컬렉션",
    imageUrl: img202505041205234,
    viewCount: "1.9K",
    likeCount: "378",
    createdDate: "2024.11.22",
    description: '다양한 브랜드의 정체성을 담은 로고 디자인 컬렉션입니다.',
    creator: { name: '박명수', avatarUrl: appIcon },
    isOwner: true,
  },
  {
    id: "9",
    title: "패키지 디자인",
    imageUrl: img202505041205234,
    viewCount: "1.4K",
    likeCount: "234",
    createdDate: "2024.11.20",
    description: '제품의 가치를 높이고 소비자의 시선을 사로잡는 패키지 디자인입니다.',
    creator: { name: '박명수', avatarUrl: appIcon },
    isOwner: true,
  },
  {
    id: "10",
    title: "웹사이트 리디자인",
    imageUrl: img202505041205234,
    viewCount: "3.1K",
    likeCount: "567",
    createdDate: "2024.11.18",
    description: '사용자 피드백을 바탕으로 기존 웹사이트를 새롭게 리디자인했습니다.',
    creator: { name: '박명수', avatarUrl: appIcon },
    isOwner: true,
  },
  {
    id: "11",
    title: "모바일 앱 디자인",
    imageUrl: img202505041205234,
    viewCount: "2.8K",
    likeCount: "423",
    createdDate: "2024.11.15",
    description: '편리한 사용성과 아름다운 디자인을 겸비한 모바일 앱을 디자인했습니다.',
    creator: { name: '박명수', avatarUrl: appIcon },
    isOwner: true,
  },
  {
    id: "12",
    title: "인포그래픽 디자인",
    imageUrl: img202505041205234,
    viewCount: "1.6K",
    likeCount: "298",
    createdDate: "2024.11.12",
    description: '복잡한 정보를 시각적으로 명확하게 전달하는 인포그래픽 디자인입니다.',
    creator: { name: '박명수', avatarUrl: appIcon },
    isOwner: true,
  },
];

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo" style={{ backgroundImage: `url('${appIcon}')` }} />
          <nav className="nav">
            <button className="nav-button"><AddIcon /><span>만들기</span></button>
            <button className="nav-button"><UploadIcon /><span style={{width: '60px'}}>공유하기</span></button>
          </nav>
        </div>
        <div className="header-right">
          <span className="logout-lable">로그아웃</span>
        </div>
      </div>
    </header>
  );
}

type UserProfileProps = {
  activeView: string;
  setActiveView: (view: string) => void;
};

function UserProfile({ activeView, setActiveView }: UserProfileProps) {
  return (
    <div className="user-profile">
      <div className="user-info">
        <div className="user-avatar"><span className="user-avatar-text">박</span></div>
        <div><h2 className="user-name">박명수</h2></div>
      </div>
      <div className="menu-list">
        <button
          className={`menu-item ${activeView === 'artworks' ? 'active' : 'inactive'}`}
          onClick={() => setActiveView('artworks')}
        >
          {activeView === 'artworks' && <div className="menu-indicator"></div>}내 작품
        </button>
        <button
          className={`menu-item ${activeView === 'userInfo' ? 'active' : 'inactive'}`}
          onClick={() => setActiveView('userInfo')}
        >
          {activeView === 'userInfo' && <div className="menu-indicator"></div>}
          <SettingsIcon />
          회원정보
        </button>
      </div>
    </div>
  );
}

function ArtworkGrid({ onArtworkClick }) {
  return (
    <div className="artwork-section">
      <div className="artwork-header">
        <h1 className="artwork-title">내 작품</h1>
        <p className="artwork-count">총 {artworks.length}개의 작품</p>
      </div>
      <div className="artwork-grid">
        {artworks.map((artwork) => (
          <ArtworkCard key={artwork.id} {...artwork} onClick={() => onArtworkClick(artwork)} />
        ))}
      </div>
    </div>
  );
}

export default function MyPage() {
  const [activeView, setActiveView] = useState('artworks');
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  const openModal = (artwork) => {
    setSelectedArtwork(artwork);
  };

  const closeModal = () => {
    setSelectedArtwork(null);
  };

  return (
    <div className="mypage-container">
      <Header />
      <main className="main-content">
        <div className="content-layout">
          <aside className="sidebar">
            <UserProfile activeView={activeView} setActiveView={setActiveView} />
          </aside>
          <div className="main-section">
            {activeView === 'artworks' ? 
              <ArtworkGrid onArtworkClick={openModal} /> : 
              <UserInfoViewer />}
          </div>
        </div>
      </main>
      {selectedArtwork && <FrameDetailModal artwork={selectedArtwork} onClose={closeModal} />}
    </div>
  );
}