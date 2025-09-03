
import { FrameFilter } from "./FrameFilter.tsx";
import { FrameGrid } from "./FrameGrid.tsx";
import SearchInput from './SearchInput.tsx'
import "../../../styles/PhotoShoot/FrameSelection/FrameSelection.css";

function FrameSelection() {
    return (
        <div className="photo-shoot-page">
            <div className="content-panel">
                <div className="frame-search-header">
                    프레임 검색
                </div>
                <div className="filter-and-search-container">
                    <div className="filter-subtitle">프레임 템플릿 선택</div>
                    <SearchInput />
                    <FrameFilter />
                </div>
                <div className="frame-grid-container">
                    <FrameGrid />
                </div>
                <div className="done-button-container">
                    <button className="done-button">완료</button>
                </div>
            </div>
        </div>
    );
}

export default FrameSelection;