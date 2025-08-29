import React, {useEffect} from 'react';
import '../styles/MainPage/MainPage.css';

const MainPage: React.FC = () => {
  useEffect(() => {
    fetch('http://43.203.118.89:8090', {
      method: 'POST', // POST 메서드 지정
      headers: {
        'Content-Type': 'application/json', // JSON 형식으로 데이터를 보낼 때
      },
      body: JSON.stringify({
        msg: 'sibal !! HIHI!!'
      })
    })
    .then(response => response.json())  
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  }, [])
  return (
    <div className="main-page-container">
      <div className="card">
        <div className="placeholder-image"></div>
        <p className="card-text">사진 촬영</p>
      </div>

      <div className="card">
        <div className="placeholder-image"></div>
        <p className="card-text">프레임 제작</p>
      </div>
    </div>
  );
};

export default MainPage;