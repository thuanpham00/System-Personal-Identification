/* eslint-disable @typescript-eslint/no-explicit-any */
import { MailOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Modal, Row, Tag } from "antd";
import React, { useImperativeHandle, useState } from "react";

export interface DataModalRef {
  handleCreate: () => void;
  handleUpdate: (Data: any) => void;
}
interface DataModalProps {
  onClose: () => void;
  onSubmitOk: () => void;
}

export const DataModal = React.forwardRef(({ onClose, onSubmitOk }: DataModalProps, ref) => {
  const [form] = Form.useForm<any>();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useImperativeHandle<any, DataModalRef>(
    ref,
    () => ({
      handleCreate() {
        form.resetFields();
        setVisible(true);
      },
      handleUpdate(Data: any) {
        form.setFieldsValue({ ...Data });
        setVisible(true);
      },
    }),
    [form],
  );

  // const getPayload = () => {
  //   const { ...rest } = form.getFieldsValue();
  //   return { Data: rest };
  // };

  const submitForm = async () => {
    try {
      setLoading(true);
      // const valid = await form.validateFields();
      // const data = getPayload();
      // let res: any = undefined;
      // switch (status) {
      //   case "create":
      //     // res = await DataApi.create(data);
      //     message.success("Create Data successfully!");
      //     break;
      //   case "update":
      //     // res = await DataApi.update(selectedData?.id || 0, data);
      //     message.success("Update Data successfully!");
      //     break;
      // }
      onSubmitOk();
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose?.();
    setVisible(false);
  };

  const ho_ten = form.getFieldValue("ho_ten") || "";
  const cccd_number = form.getFieldValue("cccd_number") || "";

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #ff4d4f; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">⚠️ Xác thực thông tin thất bại</h1>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 15px; color: #333;">Xin chào <strong>${ho_ten}</strong>,</p>
        <p style="color: #555; line-height: 1.7;">
          Chúng tôi đã tiến hành xác thực thông tin định danh của bạn trên hệ thống, 
          tuy nhiên thông tin bạn cung cấp <strong style="color: #ff4d4f;">không khớp</strong> 
          với dữ liệu căn cước công dân đã đăng ký.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #fff2f0; border-left: 4px solid #ff4d4f;">
            <td style="padding: 12px 16px; font-weight: bold; color: #333; width: 40%;">Họ và tên</td>
            <td style="padding: 12px 16px; color: #555;">${ho_ten}</td>
          </tr>
          <tr style="border-left: 4px solid #ff4d4f;">
            <td style="padding: 12px 16px; font-weight: bold; color: #333;">Số CCCD</td>
            <td style="padding: 12px 16px; color: #555;">${cccd_number}</td>
          </tr>
        </table>
        <div style="background: #fffbe6; border: 1px solid #ffe58f; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #7c5e00; font-size: 14px; line-height: 1.7;">
            📋 <strong>Vui lòng thực hiện các bước sau:</strong><br/>
            1. Truy cập lại hệ thống của chúng tôi<br/>
            2. Kiểm tra và cập nhật lại thông tin cá nhân<br/>
            3. Tải lại ảnh CCCD rõ nét, đúng mặt trước/sau<br/>
            4. Hoàn tất xác thực tài khoản
          </p>
        </div>
        <p style="color: #888; font-size: 13px;">
          Nếu bạn cần hỗ trợ, vui lòng liên hệ bộ phận chăm sóc khách hàng của chúng tôi.
        </p>
        <div style="margin-top: 32px; text-align: center;">
          <a href="#" style="background: #ff4d4f; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-size: 15px;">
            Quay lại xác thực tài khoản
          </a>
        </div>
      </div>
      <div style="background: #f9f9f9; padding: 16px; text-align: center; color: #aaa; font-size: 12px;">
        © 2026 PersonalIdentification. All rights reserved.
      </div>
    </div>
  `;

  const handleSendMail = async () => {
    const res = await fetch("http://localhost:8000/send-verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to_address: "phamminhthuan912@gmail.com",
      }),
    });

    if (res.ok) {
      console.log("Email sent successfully");
    }
  };

  return (
    <Modal
      onCancel={() => {
        handleClose();
      }}
      open={visible}
      title={"Thông tin chi tiết"}
      style={{ top: 20 }}
      width={700}
      confirmLoading={loading}
      onOk={submitForm}
      footer={null}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Họ tên" name="ho_ten">
              <Input placeholder="" disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Số CCCD" name="cccd_number">
              <Input placeholder="" disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Ngày cấp" name="ngay_cap">
              <Input placeholder="" disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Nơi cấp" name="noi_cap">
              <Input placeholder="" disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Email nhận HĐ" name="email_nhan_hd">
              <Input placeholder="" disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="User name" name="username">
              <Input placeholder="" disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Trạng thái" name="status">
              <Tag color={form.getFieldValue("status") === "OK" ? "green" : "red"}>
                {form.getFieldValue("status") === "OK" ? "OK" : "FAILED"}
              </Tag>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Button type="primary" icon={<MailOutlined />} onClick={() => setOpen(true)}>
        Gửi mail
      </Button>

      <Modal
        title="Preview email"
        open={open}
        onCancel={() => setOpen(false)}
        width={680}
        style={{ top: 20 }}
        styles={{
          body: {
            maxHeight: "70vh",
            overflowY: "auto",
          },
        }}
        footer={[
          <Button key="cancel" onClick={() => setOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="send"
            type="primary"
            icon={<MailOutlined />}
            onClick={() => {
              // TODO: gọi API gửi mail ở đây
              console.log("Gửi mail tới:", "Thuan pham", "0722040040");
              setOpen(false);
              handleSendMail();
            }}
          >
            Xác nhận gửi
          </Button>,
        ]}
      >
        <div dangerouslySetInnerHTML={{ __html: htmlTemplate }} style={{ padding: "8px 0" }} />
      </Modal>
    </Modal>
  );
});
