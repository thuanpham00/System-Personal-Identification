/* eslint-disable @typescript-eslint/no-explicit-any */
import { MailOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Modal, Row, Select, Tag } from "antd";
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

  const handleSendMail = async () => {
    const res = await fetch("https://system-personal-identification.onrender.com/send-verify-email", {
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
      okText="Xác nhận"
      cancelText="Hủy"
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
            <Form.Item label="Trạng thái check" name="status">
              <Tag color={form.getFieldValue("status") === "OK" ? "green" : "red"}>
                {form.getFieldValue("status") === "OK" ? "OK" : "FAILED"}
              </Tag>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Trạng thái hoàn thành định dạnh" name="status_identification">
              <Select
                options={[
                  { value: "completed", label: "Đã hoàn thành" },
                  { value: "pending", label: "Chưa hoàn thành" },
                ]}
              />
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
      ></Modal>
    </Modal>
  );
});
