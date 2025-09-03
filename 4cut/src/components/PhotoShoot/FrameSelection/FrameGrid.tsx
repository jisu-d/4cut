import { useState } from 'react';
import '../../../styles/PhotoShoot/FrameSelection/FrameGrid.css';

import img202505041205234 from "../../../assets/Icon/Mypage/test_img.png";
import {ArtworkCard} from "./FrameCard.tsx"

// 이미지에 보이는 목업 데이터
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

export function FrameGrid() {
  const [selectedFrameId, setSelectedFrameId] = useState('1'); // 기본 선택

  return (
    <div className="frame-grid">
      {artworks.map((artwork) => (
          <ArtworkCard
              key={artwork.id}
              isSelected={selectedFrameId === artwork.id}
              onClick={() => setSelectedFrameId(artwork.id)}
              {...artwork}
          />
      ))}
    </div>
  );
}
