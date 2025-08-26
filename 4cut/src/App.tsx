import {BrowserRouter, Route, Routes} from 'react-router-dom';
import MainPage from './pages/MainPage';
import Workspace from './pages/Workspace';
import LoginPage from './pages/LoginPage';
import Mypage from './pages/Mypage';
import Test from './pages/Test';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/MainPage" element={<MainPage />} />
        <Route path="/Workspace" element={<Workspace />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/Mypage" element={<Mypage />} />
        <Route path="/Test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
