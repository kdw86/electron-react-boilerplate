import { Navigate, useOutlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from 'react';
import { AppstoreOutlined, CustomerServiceOutlined, CommentOutlined, PoweroffOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { ConfigProvider, theme as Th, Menu, Flex, FloatButton, Row, Col, Button, ColorPicker, Space } from 'antd';
import { useTheme } from "../hooks/useTheme";

export const ProtectedLayout = () => {
  const { user, logout } = useAuth();
  const { theme, primaryColor, changeTheme, changePrimaryColor } = useTheme();
  const outlet = useOutlet();
  const location = useLocation();
  const navigate = useNavigate();
  const { defaultAlgorithm, darkAlgorithm } = Th;
  const [current, setCurrent] = useState(location.pathname.split('/')[2]);
  const [items, setItems] = useState<MenuProps['items']>([
    { label: 'Project Owner', key: 'projectOwner', icon: <AppstoreOutlined />, disabled:!user.user.authority.includes('projectOwner')},
    { label: 'Transcriptor', key: 'transcriptor', icon: <AppstoreOutlined />, disabled:!user.user.authority.includes('transcriptor')},
    { label: 'Transcript Inspector', key: 'transcriptInspector', icon: <AppstoreOutlined />, disabled:!user.user.authority.includes('transcriptInspector')},
    { label: 'Translator', key: 'translator', icon: <AppstoreOutlined />, disabled:!user.user.authority.includes('translator')},
    { label: 'Translate Inspector', key: 'translateInspector', icon: <AppstoreOutlined />, disabled:!user.user.authority.includes('translateInspector')},
    { label: 'Supervisor', key: 'supervisor', icon: <AppstoreOutlined />, disabled:!user.user.authority.includes('supervisor')},
    { label: 'Admin', key: 'admin', icon: <AppstoreOutlined />, disabled:!user.user.authority.includes('admin')},
  ]);

  useEffect(()=>{
    setItems(user.user.authority.map((d: any)=>{
      return { label: d, key: d, icon: <AppstoreOutlined />}
    }));
  },[]);

  if (!user) {
    return <Navigate to="/" />;
  }

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
    navigate(`/main/${e.key}`);
  };



  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryColor,
        },
        algorithm:theme==='default'?defaultAlgorithm:darkAlgorithm
      }}
    >
      <Row>
        <Col flex="200px" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
          <Button>SUBEDITOR</Button>

        </Col>
        <Col flex="auto">
          <Flex align="center" justify="space-between">
            <Menu style={{minWidth:500}} onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items}/>
            <Space>
              <Button onClick={()=>changeTheme('default')}>default</Button>
              <Button onClick={()=>changeTheme('dark')}>dark</Button>
              <ColorPicker value={primaryColor} onChangeComplete={(color) => changePrimaryColor(color.toHexString())} />
              <Button onClick={logout} icon={<PoweroffOutlined />}>로그아웃</Button>
            </Space>
          </Flex>
        </Col>
      </Row>

      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ right: 24 }}
        icon={<CustomerServiceOutlined />}
      >
        <FloatButton />
        <FloatButton icon={<CommentOutlined />} />
      </FloatButton.Group>
      {outlet}
    </ConfigProvider>
  );
};
