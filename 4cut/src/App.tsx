import {BrowserRouter, Route, Routes} from 'react-router-dom';
import MainPage from './pages/MainPage';
import Workspace from './pages/Workspace';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/MainPage" element={<MainPage />} />
        <Route path="/Workspace" element={<Workspace />} />
        <Route path="/LoginPage" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
