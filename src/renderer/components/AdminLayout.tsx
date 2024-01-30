import { Navigate, useOutlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ConfigProvider, theme, Layout, Menu } from 'antd';
import { useState } from 'react';

const { Header, Sider, Content } = Layout;
const { defaultAlgorithm, darkAlgorithm } = theme;

export const AdminLayout = () => {
  const { user } = useAuth();
  const outlet = useOutlet();
  const [collapsed, setCollapsed] = useState(false);
  const [primary, setPrimary] = useState('#1677ff');
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primary,
        },
        algorithm: defaultAlgorithm
      }}
    >
      <Layout style={{height:'100vh'}}>

      </Layout>
      {outlet}
    </ConfigProvider>
  );
};