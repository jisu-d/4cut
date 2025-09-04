import React, { useState } from 'react';
import LoginModal from '../components/LoginModal/LoginModal'

function App() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

      const openLoginModal = () => {
          setIsLoginModalOpen(true);
      };

      const closeLoginModal = () => {
          setIsLoginModalOpen(false);
      };

    return (
      <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100vh',
      }}>
          <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
          }}>
              <button>
                  <a href='/MainPage'>MainPage</a>
              </button>
              <button>
                  <a href='/Workspace'>Workspace</a>
              </button>
              <button>
                  <a href='/SignUp'>SignUp</a>
              </button>
              <button>
                  <a href='/Mypage'>Mypage</a>
              </button>
              <button>
                  <a href='/PhotoShoot'>PhotoShoot</a>
              </button>
              <button onClick={openLoginModal}>
                  로그인 모달 열기
              </button>
              <LoginModal
                  isOpen={isLoginModalOpen}
                  onClose={closeLoginModal}
              />
          </div>
      </div>
  );
}

export default App;
