import { Navigate, useOutlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Layout, Watermark, ConfigProvider, theme as Th, Row, Col, Flex, Space, Button, ColorPicker } from 'antd';
import { useTheme } from "../hooks/useTheme";
const { Header, Footer, Sider, Content } = Layout;

export const HomeLayout = () => {
  const { user } = useAuth();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const { theme, primaryColor, changeTheme, changePrimaryColor } = useTheme();
  const { defaultAlgorithm, darkAlgorithm } = Th;

  // if (user) {
  //   return <Navigate to="/dashboard/profile" replace />;
  // }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryColor,
        },
        algorithm:theme==='default'?defaultAlgorithm:darkAlgorithm
      }}
    >
      <Layout>
        <Content>
          <Watermark content="test">
            <Flex align="center" justify="flex-end" style={{padding:'0px 30px'}}>
              <Space>
                <Button onClick={()=>changeTheme('default')}>default</Button>
                <Button onClick={()=>changeTheme('dark')}>dark</Button>
                <ColorPicker value={primaryColor} onChangeComplete={(color) => changePrimaryColor(color.toHexString())} />
              </Space>
            </Flex>
            {outlet}
          </Watermark>
        </Content>
      </Layout>
    </ConfigProvider>

  );
};
