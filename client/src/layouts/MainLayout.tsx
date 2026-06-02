import { Layout } from "antd";
import { useState } from "react";
import { ContainerOutlined, MenuFoldOutlined, MenuUnfoldOutlined, PieChartOutlined } from "@ant-design/icons";
import { Button, Menu } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  path: string;
  name: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const items: MenuItem[] = [
  {
    key: "1",
    icon: <PieChartOutlined />,
    path: "/",
    name: "Dashboard",
  },
  {
    key: "2",
    icon: <PieChartOutlined />,
    path: "/personal-identification",
    name: "Identification",
  },
  {
    key: "3",
    icon: <ContainerOutlined />,
    path: "/data",
    name: "Data",
  },
];

const { Sider, Content } = Layout;

const siderStyle: React.CSSProperties = {
  color: "#fff",
  backgroundColor: "#001529",
  padding: 16,
  position: "fixed",
  top: 0,
  left: 0,
  height: "100vh",
  overflow: "auto",
};

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const siderWidth = 240;
  const siderCollapsedWidth = 90;
  const contentStyle: React.CSSProperties = {
    color: "#000",
    padding: 24,
    minHeight: "100vh",
  };

  const selectedKey = (() => {
    if (pathname.startsWith("/data")) return "3";
    if (pathname.startsWith("/personal-identification")) return "2";
    return "1";
  })();

  return (
    <Layout style={{ width: "100%", minHeight: "100vh" }}>
      <Sider
        width={siderWidth}
        collapsedWidth={siderCollapsedWidth}
        collapsible
        collapsed={collapsed}
        trigger={null}
        style={siderStyle}
      >
        <Button type="primary" onClick={() => setCollapsed(!collapsed)} style={{ marginBottom: 16 }}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>
        <Menu
          selectedKeys={[selectedKey]}
          mode="inline"
          theme="dark"
          inlineCollapsed={collapsed}
          items={items.map((item) => {
            return {
              key: item.key,
              icon: item.icon,
              label: (
                <Link to={item.path} className="font-semibold">
                  {item.name}
                </Link>
              ),
            };
          })}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? siderCollapsedWidth : siderWidth, minHeight: "100vh" }}>
        <Header />
        <Content style={contentStyle}>{<Outlet />}</Content>
      </Layout>
    </Layout>
  );
}
