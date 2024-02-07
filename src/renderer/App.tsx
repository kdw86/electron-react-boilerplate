import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import update from 'immutability-helper';
import { Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import './App.css';

function Hello() {

  const [msgList, setMsgList] = useState<string[]>([]);
  const [vttPath, setVttPath] = useState<string>();

  useEffect(()=>{
    window.electron.ipcRenderer.on('test', (msg) => {
      if(msg){
        console.log('test : ', msg)
        setMsgList((msgList)=>[...msgList, msg as string]);
      }
    });
    window.electron.ipcRenderer.on('test2', (path) => {
      if(path){
        console.log('test2 : ', path)
        setVttPath(path as string);
      }
    });
  }, []);


  const test = ()=> {
    window.electron.ipcRenderer.sendMessage('test', '테스트');
  }

  const props: UploadProps = {
    beforeUpload: (file) => {
      console.log('beforeUpload : ', file.path)
      window.electron.ipcRenderer.sendMessage('test2', file.path);
      return false;
    }
  };

  const test3 = ()=> {
    window.electron.ipcRenderer.sendMessage('test3', ['C:\\Users\\ssade\\OneDrive\\바탕 화면\\테스트\\한글_en.vtt', 'ko']);
    // if(vttPath){
    //   window.electron.ipcRenderer.sendMessage('test3', [vttPath, 'ko']);
    // }
  }

  return (
    <>
      <div>
        <Button onClick={test}>파이썬 환경 세팅</Button>
        <Upload {...props}>
          <Button icon={<UploadOutlined />}>영상 파일 선택</Button>
        </Upload>
        <Button onClick={test3}>번역</Button>
      </div>
      <div>
        {msgList.map((d,i)=><div key={`test+${i}`}>{d}</div>)}
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
