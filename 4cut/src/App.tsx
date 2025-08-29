import {BrowserRouter, Route, Routes} from 'react-router-dom';
import MainPage from './pages/MainPage';
import Workspace from './pages/Workspace';
import SignUp from './pages/SignUp';
import Mypage from './pages/Mypage';
import PhotoShootPage from './pages/PhotoShootPage.tsx';
import Test from './pages/Test';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/MainPage" element={<MainPage />} />
        <Route path="/Workspace" element={<Workspace />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/Mypage" element={<Mypage />} />
        <Route path="/PhotoShoot" element={<PhotoShootPage />} />
        <Route path="/Test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
