import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import MainPage from './pages/MainPage';
import Workspace from './pages/Workspace';
import SignUp from './pages/SignUp';
import Mypage from './pages/Mypage';
import PhotoShootPage from './pages/PhotoShootPage.tsx';
import ImageDownloadPage from './pages/ImageDownloadPage.tsx';
import Test from './pages/Test';
import { useEffect } from 'react';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const startPath = params.get('startPath');

    if (startPath) {
      const validPaths = ['/MainPage', '/Workspace', '/SignUp', '/SignUpModal','/Mypage', '/PhotoShoot', '/Test'];
      if (validPaths.includes(startPath)) {
        navigate(startPath, { replace: true });
      } else {
        // 유효하지 않은 startPath인 경우, PhotoShootPage로 리디렉션
        console.warn(`Invalid startPath: ${startPath}. Redirecting to /PhotoShoot.`);
        navigate('/PhotoShoot', { replace: true });
      }
    }
  }, [location.search, navigate]);

  return (
      <Routes>
          <Route path="/MainPage" element={<MainPage />} />
          <Route path="/Workspace" element={<Workspace />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/Mypage" element={<Mypage />} />
          <Route path="/PhotoShoot" element={<PhotoShootPage />} />
          <Route path="/ImageDownloadPage" element={<ImageDownloadPage />} />
          <Route path="/Test" element={<Test />} />
          {/* 루트 경로 ('/')로 접근했을 때 PhotoShootPage로 리디렉션 */}
          <Route path="/" element={<PhotoShootPage />} />
      </Routes>
  );
}

export default App;

