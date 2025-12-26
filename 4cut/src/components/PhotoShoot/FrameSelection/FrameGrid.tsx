import '../../../styles/PhotoShoot/FrameSelection/FrameGrid.css';
import {ArtworkCard} from "./FrameCard.tsx"


interface FrameGridProps {
  artworks: {
    id: number,
    title: string,
    previewUrl: string,
    viewCount: string,
    likeCount: string,
    createdDate: string,
  }[],
  selectedFrameId: number,
  setSelectedFrameId:  React.Dispatch<React.SetStateAction<number>>,
}


export function FrameGrid({artworks, selectedFrameId, setSelectedFrameId}: FrameGridProps) {
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
