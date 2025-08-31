import appIcon from "../../assets/Icon/Mypage/app_icon.png";
import AddIcon from '../../assets/Icon/Mypage/add.svg?react'
import UploadIcon from '../../assets/Icon/Mypage/upload.svg?react'

import "../../styles/SignUp/Header.css";

export default function Header() {
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
              <AddIcon />
              <span>만들기</span>
            </button>
            <button className="nav-button">
              <UploadIcon />
              <span style={{width: '60px'}}>공유하기</span>
            </button>
          </nav>
        </div>

        {/* 우측 메뉴 */}
        <div className="header-right">
          <span className="SignUp">회원가입</span>
          <span className="login">로그인</span>
        </div>
      </div>
    </header>
  );
}
