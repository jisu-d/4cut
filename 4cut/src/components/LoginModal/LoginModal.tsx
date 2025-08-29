import '../../styles/LoginModal/LoginModal.css';
import React, { useState } from 'react';

import Cross from '../../assets/Icon/SignUpModal/cross.svg?react'
import { CustomCheckbox } from '../Workspace/CustomCheckbox';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [remember, setRemember] = useState(false);
  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="login-close-btn" type="button" aria-label="닫기" onClick={onClose}>
          <Cross />
        </button>
        <div className="login-title">로그인</div>

        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <label className="login-label">아이디 또는 이메일</label>
          <input className="login-input" type="text" placeholder="아이디" />

          <label className="login-label">비밀번호</label>
          <input className="login-input" type="password" placeholder="이메일 입력" />

          <div className="login-row">
            <div className="login-remember">
              <CustomCheckbox id="remember" visible={remember} onToggleVisible={() => setRemember(!remember)} />
              <span>아이디 정보 저장</span>
            </div>
            {/* <button type="button" className="login-link">아이디/비밀번호 찾기</button> */}
            <div className='login-finds'>
                <span>아이디</span>
                <span>/</span>
                <span>비밀번호 찾기</span>
            </div>
          </div>

          <button type="submit" className="login-submit">로그인</button>
        </form>

        <div className="login-footer">
          <span>계정이 없으신가요?</span>
          <a className="signup-link" href="">회원가입</a>
        </div>
      </div>
    </div>
  );
}