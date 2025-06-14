import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/MainPage" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
