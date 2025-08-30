 
import { useState } from "react";
import appIcon from "../assets/Icon/Mypage/app_icon.png";

import "../styles/SignUpModal/SignUpModal.css";

import AddIcon from '../assets/Icon/Mypage/add.svg?react'

import UploadIcon from '../assets/Icon/Mypage/upload.svg?react'
import EyeIcon from '../assets/Icon/eye.svg?react';
import EyeOffIcon from '../assets/Icon/eye_off.svg?react';
import InfoIcon from '../assets/Icon/Info.svg?react';
import Tooltip from '../components/Tooltip';

import { CustomCheckbox } from '../components/CustomCheckBox'

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
  label: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  rightButtonText?: string;
  onRightButtonClick?: () => void;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  isError?: boolean;
  helperText?: string;
};

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  rightButtonText,
  onRightButtonClick,
  rightIcon,
  onRightIconClick,
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
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
        />
        {rightButtonText && (
          <button type="button" className="su-right-btn" onClick={onRightButtonClick}>
            {rightButtonText}
          </button>
        )}
        {rightIcon && (
          <div className="su-right-icon" onClick={onRightIconClick}>
            {rightIcon}
          </div>
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [agreeEmail, setAgreeEmail] = useState(false);
  const [isCodeSent, setAuthCodeSent] = useState(false);

  const [authCode, setAuthCode] = useState('');

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
            label={
              <>
                아이디
                <Tooltip content="특수문자를 제외하고 6~20자를 사용해 주세요.">
                  <InfoIcon />
                </Tooltip>
              </>
            }
            value={userId}
            onChange={setUserId}
            placeholder="아이디를 입력해 주세요."
            rightButtonText="중복확인"
            autoComplete="username"
            onRightButtonClick={() => {}}
          />

          <FormInput
            label={
              <>
                닉네임
                <Tooltip content="특수문자를 제외하고 3~10자를 사용해 주세요.">
                  <InfoIcon />
                </Tooltip>
              </>
            }
            value={nickname}
            onChange={setNickname}
            placeholder="닉네임을 입력해 주세요."
            autoComplete="nickname"
          />

          <FormInput
            label={
              <>
                비밀번호
                <Tooltip content="8~16자의 영문 대/소문자, 숫자, 특수문자를 사용해 주세요.">
                  <InfoIcon />
                </Tooltip>
              </>
            }
            value={password}
            onChange={setPassword}
            placeholder="비밀번호를 입력해 주세요."
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="new-password"
            rightIcon={isPasswordVisible ? <EyeIcon /> : <EyeOffIcon />}
            onRightIconClick={() => setIsPasswordVisible((v) => !v)}
          />

          <FormInput
            label="비밀번호 확인"
            value={passwordConfirm}
            onChange={setPasswordConfirm}
            placeholder="비밀번호를 다시 입력해 주세요."
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="new-password"
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
                  size={16}
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
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                disabled={isCodeSent}
              />
              <button type="button" className="su-right-btn" onClick={() => setAuthCodeSent(true)} disabled={!agreeEmail}>
                {isCodeSent ? "재전송" : "인증코드 전송"}
              </button>
            </div>
          </div>

          {isCodeSent && (
            <div className="su-auth-field">
              <FormInput
                label="이메일 인증"
                value={authCode}
                onChange={setAuthCode}
                placeholder="5자리 숫자 입력"
                rightButtonText="확인"
                onRightButtonClick={() => {
                  // 여기에 인증 코드 확인 로직을 추가합니다.
                }}
              />
            </div>
          )}

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