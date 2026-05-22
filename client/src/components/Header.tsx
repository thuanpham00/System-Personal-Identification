import { Avatar, Button, Popover, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/store";
import { clearLS } from "../utils/auth";

export default function Header() {
  const navigate = useNavigate();
  const setIsLogin = useAppStore((state) => state.setIsLogin);
  const setNameUser = useAppStore((state) => state.setNameUser);

  const handleLogout = () => {
    clearLS();
    setIsLogin(false);
    setNameUser("");
    navigate("/login");
  };

  const popoverContent = (
    <Button type="text" onClick={handleLogout} style={{ padding: 0 }}>
      Logout
    </Button>
  );

  return (
    <div
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <div style={{ fontWeight: 600 }}>Personal Identification</div>
      <Popover content={popoverContent} trigger="click" placement="bottomRight">
        <Space style={{ cursor: "pointer" }}>
          <span>Admin</span>
          <Avatar icon={<UserOutlined />} />
        </Space>
      </Popover>
    </div>
  );
}
