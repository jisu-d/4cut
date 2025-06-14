import React from 'react';
import '../styles/MainPage.css';

const MainPage: React.FC = () => {
  return (
    <div className="main-page-container">
      <div className="card">
        <div className="placeholder-image"></div>
        <p className="card-text">사진 촬영</p>
      </div>

      <div className="card">
        <div className="placeholder-image"></div>
        <p className="card-text">프레임 제작</p>
      </div>
    </div>
  );
};

export default MainPage;