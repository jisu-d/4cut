import img202505041205234 from "../assets/Icon/Mypage/test_img.png";
import appIcon from "../assets/Icon/Mypage/app_icon.png";
import { ArtworkCard } from "../components/Mypage/ArtworkCard";

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
  },
  {
    id: "2",
    title: "미니멀 포스터 컬렉션",
    imageUrl: img202505041205234,
    viewCount: "2.2K",
    likeCount: "445",
    createdDate: "2024.12.10",
  },
  {
    id: "3",
    title: "일러스트레이션 작품",
    imageUrl: img202505041205234,
    viewCount: "1.0K",
    likeCount: "189",
    createdDate: "2024.12.08",
  },
  {
    id: "4",
    title: "타이포그래피 프로젝트",
    imageUrl: img202505041205234,
    viewCount: "1.7K",
    likeCount: "267",
    createdDate: "2024.12.05",
  },
  {
    id: "5",
    title: "웹 디자인 시스템",
    imageUrl: img202505041205234,
    viewCount: "1.7K",
    likeCount: "312",
    createdDate: "2024.12.01",
  },
  {
    id: "6",
    title: "아이콘 세트 디자인",
    imageUrl: img202505041205234,
    viewCount: "1.7K",
    likeCount: "198",
    createdDate: "2024.11.28",
  },
  {
    id: "7",
    title: "UI/UX 디자인 프로젝트",
    imageUrl: img202505041205234,
    viewCount: "2.5K",
    likeCount: "456",
    createdDate: "2024.11.25",
  },
  {
    id: "8",
    title: "로고 디자인 컬렉션",
    imageUrl: img202505041205234,
    viewCount: "1.9K",
    likeCount: "378",
    createdDate: "2024.11.22",
  },
  {
    id: "9",
    title: "패키지 디자인",
    imageUrl: img202505041205234,
    viewCount: "1.4K",
    likeCount: "234",
    createdDate: "2024.11.20",
  },
  {
    id: "10",
    title: "웹사이트 리디자인",
    imageUrl: img202505041205234,
    viewCount: "3.1K",
    likeCount: "567",
    createdDate: "2024.11.18",
  },
  {
    id: "11",
    title: "모바일 앱 디자인",
    imageUrl: img202505041205234,
    viewCount: "2.8K",
    likeCount: "423",
    createdDate: "2024.11.15",
  },
  {
    id: "12",
    title: "인포그래픽 디자인",
    imageUrl: img202505041205234,
    viewCount: "1.6K",
    likeCount: "298",
    createdDate: "2024.11.12",
  },
];

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        {/* 로고 */}
        <div className="header-left">
          <div
            className="logo"
            style={{
              backgroundImage: `url('${appIcon}')`,
            }}
          />

          {/* 네비게이션 */}
          <nav className="nav">
            <button className="nav-button">
              {/* <AddIcon width={16} height={16} /> */}
              <AddIcon />
              <span>만들기</span>
            </button>
            <button className="nav-button">
              {/* <img src={upload_icon}  style={{
                width: '13px',
              }} alt="" /> */}
              <UploadIcon />
              <span style={{width: '60px'}}>공유하기</span>
            </button>
          </nav>
        </div>

        {/* 우측 메뉴 */}
        <div className="header-right">
          {/* <span className="mypage-label">마이페이지</span> */}
          <span className="logout-lable">로그아웃</span>
        </div>
      </div>
    </header>
  );
}

function UserProfile() {
  return (
    <div className="user-profile">
      <div className="user-info">
        <div className="user-avatar">
          <span className="user-avatar-text">박</span>
        </div>
        <div>
          <h2 className="user-name">박명수</h2>
        </div>
      </div>

      <div className="menu-list">
        <button className="menu-item active">
          <div className="menu-indicator"></div>내 작품
        </button>
        <button className="menu-item inactive">
          {/* <img src={settings_icon}  style={{ width: '16px' }} alt="" /> */}
          <SettingsIcon />
          회원정보 수정
        </button>
      </div>
    </div>
  );
}

function ArtworkGrid() {
  return (
    <div className="artwork-section">
      <div className="artwork-header">
        <h1 className="artwork-title">내 작품</h1>
        <p className="artwork-count">
          총 {artworks.length}개의 작품
        </p>
      </div>

      <div className="artwork-grid">
        {artworks.map((artwork) => (
          <ArtworkCard key={artwork.id} {...artwork} />
        ))}
      </div>
    </div>
  );
}

export default function MyPage() {
  return (
    <div className="mypage-container">
      <Header />

      <main className="main-content">
        <div className="content-layout">
          {/* 사이드바 */}
          <aside className="sidebar">
            <UserProfile />
          </aside>

          {/* 메인 콘텐츠 */}
          <ArtworkGrid />
        </div>
      </main>
    </div>
  );
}