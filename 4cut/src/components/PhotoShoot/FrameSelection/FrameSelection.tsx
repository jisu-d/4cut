
import { FrameFilter } from "./FrameFilter.tsx";
import { FrameGrid } from "./FrameGrid.tsx";
import SearchInput from './SearchInput.tsx'
import "../../../styles/PhotoShoot/FrameSelection/FrameSelection.css";
import {useState, useContext} from "react";

import PhotoCaptureContext from "../../../contexts/PhotoCaptureContextType.ts"

import {artworks, frameData} from "./FrameData.ts"

function FrameSelection() {
    const [selectedFrameId, setSelectedFrameId] = useState(1); // 기본 선택
    const { FrameData, Mode, CaptureImgData } = useContext(PhotoCaptureContext);

    function DoneBtnClick() {
        const { seturl } = FrameData;
        const { setmode } = Mode;
        const { setimageData } = FrameData.ImgPlaceData;
        const { setCaptureImgData } = CaptureImgData;

        // 1. 해당하는 프레임 데이터 찾기
        const selectedArtwork = artworks.find(artwork => artwork.id === selectedFrameId);
        if (selectedArtwork) {
            seturl(selectedArtwork.frameUrl);
            setmode("capture");
        } else {
            console.warn("Selected artwork not found for ID:", selectedFrameId);
            seturl("");
        }

        // 2. 프레임 데이터 저장할 딕셔너리 생성
        const frameIdStr = String(selectedFrameId);
        const selectedFrameTemplate = frameData[frameIdStr]; // Use frameData

        if (selectedFrameTemplate) {
            setimageData(selectedFrameTemplate);

            const newCaptureData = selectedFrameTemplate.flatMap((item, index) => [
                {
                    id: (index * 2) + 1,
                    ratio: item.ratio,
                    base64Img: "",
                    gifBlob: null
                },
                {
                    id: (index * 2) + 2,
                    ratio: item.ratio,
                    base64Img: "",
                    gifBlob: null
                }
            ]);
            setCaptureImgData(newCaptureData);
        } else {
            console.warn("Frame template data not found for ID:", selectedFrameId);
            setimageData([]);
            setCaptureImgData([]);
        }
    }



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
                    <FrameGrid
                        artworks={artworks}
                        selectedFrameId={selectedFrameId}
                        setSelectedFrameId={setSelectedFrameId}
                    />
                </div>
                <div className="done-button-container">
                    <button className="done-button" onClick={DoneBtnClick}>완료</button>
                </div>
            </div>
        </div>
    );
}

export default FrameSelection;