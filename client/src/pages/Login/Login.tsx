import { Button, Card, Form, Input, message } from "antd";
import { useAppStore } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { setIsLoginToLS, setNameUserToLS } from "../../utils/auth";

type LoginFormValues = {
  username: string;
  password: string;
};

export default function Login() {
  const [form] = Form.useForm<LoginFormValues>();
  const setNameUser = useAppStore((state) => state.setNameUser);
  const setIsLogin = useAppStore((state) => state.setIsLogin);
  const navigate = useNavigate();

  const handleFinish = (values: LoginFormValues) => {
    console.log("login submit", values);
    if (values.username === "admin" && values.password === "meCreator2026") {
      message.success("Login successful!");
      setNameUserToLS(values.username);
      setNameUser(values.username);
      setIsLoginToLS(true);
      setIsLogin(true);
      navigate("/");
    } else {
      message.error("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-orbit" />
      <div className="login-glow" />
      <Card className="login-card" bordered={false}>
        <div className="login-brand">
          <span className="login-mark" />
          <div>
            <div className="login-title">Personal Identification</div>
            <div className="login-subtitle">Log in to continue</div>
          </div>
        </div>
        <Form form={form} layout="vertical" onFinish={handleFinish} autoComplete="off">
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter your username" }]}
          >
            <Input placeholder="Enter username" size="large" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="Enter password" size="large" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large" className="login-submit">
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <div className="login-footnote">Data security in accordance with internal standards.</div>
    </div>
  );
}
