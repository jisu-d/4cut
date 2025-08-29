import React, { useState } from 'react';
//  import SignupModal from '../components/SignUpModal/SignUpModal'
import LoginModal from '../components/LoginModal/LoginModal'

function App() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const openSignupModal = () => {
    setIsSignupModalOpen(true);
  };

  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  return (
    <div>
      
        <button
          onClick={openSignupModal}
        >
          회원가입 모달 열기
        </button>
      
      <LoginModal 
        isOpen={isSignupModalOpen} 
        onClose={closeSignupModal} 
      />
    </div>
  );
}

export default App;
