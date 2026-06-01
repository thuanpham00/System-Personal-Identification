import { Layout } from "antd";
import { useState } from "react";
import { ContainerOutlined, MenuFoldOutlined, MenuUnfoldOutlined, PieChartOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Menu } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    key: "1",
    icon: <PieChartOutlined />,
    label: (
      <Link to="/" className="font-semibold">
        Identification
      </Link>
    ),
  },
  {
    key: "2",
    icon: <ContainerOutlined />,
    label: (
      <Link className="font-semibold" to="/data">
        Data
      </Link>
    ),
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
    if (pathname.startsWith("/data")) return "2";
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
          items={items}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? siderCollapsedWidth : siderWidth, minHeight: "100vh" }}>
        <Header />
        <Content style={contentStyle}>{<Outlet />}</Content>
      </Layout>
    </Layout>
  );
}
