import React, { useState, useMemo } from "react";
import appIcon from "../../assets/Icon/Mypage/app_icon.png";
import EyeIcon from '../../assets/Icon/eye.svg?react';
import EyeOffIcon from '../../assets/Icon/eye_off.svg?react';
import InfoIcon from '../../assets/Icon/Info.svg?react';
import Tooltip from '../Tooltip';
import { CustomCheckbox } from '../CustomCheckBox';
import { FormInput } from "./FormInput.tsx";

import "../../styles/SignUp/Main.css";

// 유효성 검사 정규식
const validations = {
  userId: /^[a-zA-Z0-9]{6,20}$/,
  nickname: /^[a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ]{3,10}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
};

export default function Main(){
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [agreeEmail, setAgreeEmail] = useState(false);
  const [isCodeSent, setAuthCodeSent] = useState(false);

  const [authCode, setAuthCode] = useState('');

  // 에러 메시지 state
  const [userIdError, setUserIdError] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");

  const isPwMismatch = password.length > 0 && passwordConfirm.length > 0 && password !== passwordConfirm;

  // 유효성 검사 로직
  const validateField = (field: keyof typeof validations, value: string, errorSetter: React.Dispatch<React.SetStateAction<string>>, message: string) => {
    if (!validations[field].test(value)) {
      errorSetter(message);
    } else {
      errorSetter("");
    }
  };

  const isFormValid = useMemo(() => {
    return (
      !userIdError &&
      !nicknameError &&
      !passwordError &&
      !isPwMismatch &&
      !emailError &&
      userId.length > 0 &&
      nickname.length > 0 &&
      password.length > 0 &&
      passwordConfirm.length > 0 &&
      email.length > 0
      // && isIdChecked // 중복 확인 완료 상태
      // && isEmailVerified // 이메일 인증 완료 상태
    );
  }, [userId, nickname, password, passwordConfirm, email, userIdError, nicknameError, passwordError, isPwMismatch, emailError]);


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
            onChange={(v) => {
              setUserId(v);
              validateField("userId", v, setUserIdError, "아이디는 6~20자의 영문, 숫자만 사용 가능합니다.");
            }}
            placeholder="아이디를 입력해 주세요."
            rightButtonText="중복확인"
            autoComplete="username"
            onRightButtonClick={() => {}}
            isError={!!userIdError}
            helperText={userIdError}
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
            onChange={(v) => {
              setNickname(v);
              validateField("nickname", v, setNicknameError, "닉네임은 3~10자의 한글, 영문, 숫자만 사용 가능합니다.");
            }}
            placeholder="닉네임을 입력해 주세요."
            autoComplete="nickname"
            isError={!!nicknameError}
            helperText={nicknameError}
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
            onChange={(v) => {
              setPassword(v);
              validateField("password", v, setPasswordError, "비밀번호는 8~16자의 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다.");
            }}
            placeholder="비밀번호를 입력해 주세요."
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="new-password"
            rightIcon={isPasswordVisible ? <EyeIcon /> : <EyeOffIcon />}
            onRightIconClick={() => setIsPasswordVisible((v) => !v)}
            isError={!!passwordError}
            helperText={passwordError}
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
                className={`su-input ${emailError ? 'input-error' : ''}`}
                type="email"
                value={email}
                placeholder="honggildong@4cut.kr"
                autoComplete="email"
                onChange={(e) => {
                  const { value } = e.target;
                    setEmail(value);
                  validateField("email", value, setEmailError, "올바른 이메일 형식이 아닙니다.");
                }}
                disabled={isCodeSent}
              />
              <button type="button" className="su-right-btn" onClick={() => setAuthCodeSent(true)} disabled={!agreeEmail || !!emailError}>
                {isCodeSent ? "재전송" : "인증코드 전송"}
              </button>
            </div>
            {emailError ? <p className="su-helper">{emailError}</p> : <p className='su-helper' style={{opacity: '0'}}>테스트 텍스트</p>}
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

          <button className="su-submit" type="submit" disabled={!isFormValid}>회원가입</button>
        </form>
      </div>
    </main>
  )
}
