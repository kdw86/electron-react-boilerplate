import { useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Button } from 'antd';
import './App.css';

function Hello() {

  useEffect(()=>{
    window.electron.ipcRenderer.on('test', (arg) => {
      console.log('test : ', arg);
    });
  }, []);


  const test = ()=> {
    window.electron.ipcRenderer.sendMessage('test', '테스트');
  }

  return (
    <>
      <div>
        <Button onClick={test}>테스트</Button>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
