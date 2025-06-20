import '../../../styles/Workspace/addImg/AlertPopup.css';

function AlertPopup() {
  return (
    <div className="alert-popup">
      <div className="popup-header">
        <h3>업로드 정보</h3>
      </div>
      <div className="popup-content-title">
        업로드 가능 파일
      </div>
      <div className="popup-content-details">
        이미지: <b>JPG, PNG, SVG</b>
      </div>
    </div>
  );
}

export default AlertPopup; 