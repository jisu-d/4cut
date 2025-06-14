import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import Workspace from './pages/Workspace';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/MainPage" element={<MainPage />} />
        <Route path="/Workspace" element={<Workspace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
