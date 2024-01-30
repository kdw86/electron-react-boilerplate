import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import update from 'immutability-helper';
import { Button } from 'antd';
import './App.css';

function Hello() {

  const [msgList, setMsgList] = useState<string[]>([]);

  useEffect(()=>{
    window.electron.ipcRenderer.on('test', (msg) => {
      setMsgList([...msgList, msg as string]);
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
      <div>
        {msgList.join('\n')}
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
