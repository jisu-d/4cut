import '../../styles/Mypage/UserInfoEditor.css'; // Keep the same css file for simplicity

export function UserInfoViewer() {
  const userInfo = {
    username: 'user_id',
    nickname: '박명수',
    email: 'user@example.com',
  };

  return (
    <div className="user-info-viewer">
      <h2 className="viewer-title">회원정보</h2>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">아이디</span>
          <span className="info-value">{userInfo.username}</span>
        </div>
        <div className="info-item">
          <span className="info-label">닉네임</span>
          <span className="info-value">{userInfo.nickname}</span>
        </div>
        <div className="info-item">
          <span className="info-label">이메일</span>
          <span className="info-value">{userInfo.email}</span>
        </div>
      </div>
      <div className="viewer-actions">
        <button className="action-btn">비밀번호 변경</button>
        <button className="action-btn">회원 탈퇴</button>
      </div>
    </div>
  );
}