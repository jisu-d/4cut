 
import { useState } from "react";
import { CustomCheckbox } from "../components/CustomCheckBox";
import appIcon from "../assets/Icon/Mypage/app_icon.png";

import "../styles/SignUpModal/SignUpModal.css";

import AddIcon from '../assets/Icon/Mypage/add.svg?react'

import UploadIcon from '../assets/Icon/Mypage/upload.svg?react'

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
          {/* <span className="logout-lable">로그아웃</span> */}
          <span className="SignUp">회원가입</span>
          <span className="login">로그인</span>
        </div>
      </div>
    </header>
  );
}

type InputProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  rightButtonText?: string;
  onRightButtonClick?: () => void;
  isError?: boolean;
  helperText?: string;
};

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  rightButtonText,
  onRightButtonClick,
  isError,
  helperText,
}: InputProps) {
  return (
    <div className={`su-field ${isError ? "su-field-error" : ""}`}>
      <label className="su-label">{label}</label>
      <div className="su-input-wrap">
        <input
          className="su-input"
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {rightButtonText && (
          <button type="button" className="su-right-btn" onClick={onRightButtonClick}>
            {rightButtonText}
          </button>
        )}
      </div>
      {helperText ? <p className="su-helper">{helperText}</p> : null}
    </div>
  );
}

function Main(){
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [agreeEmail, setAgreeEmail] = useState(false);

  const isPwMismatch = password.length > 0 && passwordConfirm.length > 0 && password !== passwordConfirm;

  return (
    <main>
      <div className="main-container">
        <form className="su-form" onSubmit={(e) => e.preventDefault()}>
          <div className="title-container">
            <img className="su-logo"  src={appIcon} alt="" />
            <div className="su-title">기본정보</div>
            <div className="su-subtitle">회원가입에 필요한 기본정보를 입력해주세요.</div>
          </div>

          <FormInput
            label="아이디"
            value={userId}
            onChange={setUserId}
            placeholder="특수문자를 제외하고 6~20자를 사용해 주세요."
            rightButtonText="중복확인"
            onRightButtonClick={() => {}}
          />

          <FormInput
            label="닉네임"
            value={nickname}
            onChange={setNickname}
            placeholder="특수문자를 제외하고 3~10자를 사용해 주세요."
          />

          <FormInput
            label="비밀번호"
            value={password}
            onChange={setPassword}
            placeholder="8~16자의 영문 대/소문자, 숫자, 특수문자를 사용해 주세요."
            type="password"
          />

          <FormInput
            label="비밀번호 확인"
            value={passwordConfirm}
            onChange={setPasswordConfirm}
            placeholder="비밀번호를 다시 입력해 주세요."
            type="password"
            isError={isPwMismatch}
            helperText={isPwMismatch ? "비밀번호가 일치하지 않습니다!" : ""}
          />

          <div className="su-field">
            <div>
              <label className="su-label">이메일</label>
              <div className="su-consent">
                <CustomCheckbox
                  id="agreeEmail"
                  visible={agreeEmail}
                  onToggleVisible={() => setAgreeEmail((v) => !v)}
                  size={15}
                />
                <span>이메일 수신동의</span>
              </div>
            </div>
            <div className="su-input-wrap">
              <input
                className="su-input"
                type="email"
                value={email}
                placeholder="honggildong@4cut.kr"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          {/* TODO - 이메일 인증 번호입력 인풋 추가 */}
          <button className="su-submit" type="submit">회원가입</button>
        </form>
      </div>
    </main>
  )
}

export default function SignUp() {
  return (
    <div className="signUp-container">
      <Header />
      <Main />
    </div>
  );
}