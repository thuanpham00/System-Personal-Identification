import { Layout } from "antd";
import { useState } from "react";
import {
  ContainerOutlined,
  DesktopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Menu } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  { key: "1", icon: <PieChartOutlined />, label: <Link to="/">Identification</Link> },
  { key: "2", icon: <DesktopOutlined />, label: <Link to="/storage">Storage</Link> },
  { key: "3", icon: <ContainerOutlined />, label: <Link to="/data">Data</Link> },
];

const { Sider, Content } = Layout;

const contentStyle: React.CSSProperties = {
  color: "#000",
  padding: 24,
};

const siderStyle: React.CSSProperties = {
  color: "#fff",
  backgroundColor: "#001529",
  padding: 16,
};

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  const selectedKey = (() => {
    if (pathname.startsWith("/storage")) return "2";
    if (pathname.startsWith("/data")) return "3";
    return "1";
  })();

  return (
    <Layout style={{ width: "100%", height: "100vh" }}>
      <Sider
        width={240}
        collapsedWidth={90}
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
          items={items}
        />
      </Sider>
      <Layout>
        <Header />
        <Content style={contentStyle}>{<Outlet />}</Content>
      </Layout>
    </Layout>
  );
}
