/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldTimeOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Modal, Popconfirm, Row, Select, Space, Tag } from "antd";
import React, { useImperativeHandle, useState } from "react";
import CreatorVerificationGuideline from "./PreviewEmailModal";
import { supabase } from "../utils/supabase";

export interface DataModalRef {
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
  const [openReminder, setOpenReminder] = useState(false);
  const [nameUser, setNameUser] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [guide, setGuide] = useState<string>("");
  const [listReminder, setListReminder] = useState<string[]>([]);

  useImperativeHandle<any, DataModalRef>(
    ref,
    () => ({
      handleUpdate(Data: any) {
        form.setFieldsValue({ ...Data });
        setVisible(true);
        setNameUser(Data.ho_ten);
      },
    }),
    [form],
  );

  const submitForm = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("data")
        .update({
          status_identification: form.getFieldValue("status_identification"),
        })
        .eq("id", form.getFieldValue("id"));

      if (error) {
        throw error;
      }

      message.success("Cập nhật thành công!");

      onSubmitOk();
      handleClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose?.();
    setVisible(false);
  };

  const handleSendMail = async () => {
    await fetch("https://system-personal-identification.onrender.com/send-verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to_address: form.getFieldValue("email_nhan_hd"),
        name: nameUser,
        reason,
        instruction: guide,
      }),
    });

    setGuide("");
    setReason("");
    setNameUser("");
    message.success("Email đã được gửi đi!");
  };

  const handleReminder = async (transactionId: string) => {
    const now = new Date();
    const rows = [];

    if (listReminder.includes("5m")) {
      const remindAt = new Date(now);
      remindAt.setMinutes(remindAt.getMinutes() + 5);
      rows.push({
        transaction_id: transactionId,
        title: "Nhắc nhở giao dịch",
        message: `Bạn có giao dịch cần xử lý: ${transactionId}`,
        remind_at: remindAt.toISOString(),
      });
    }

    if (listReminder.includes("3d")) {
      const remindAt = new Date(now);
      remindAt.setDate(remindAt.getDate() + 3);
      rows.push({
        transaction_id: transactionId,
        title: "Nhắc nhở giao dịch",
        message: `Bạn có giao dịch cần xử lý: ${transactionId}`,
        remind_at: remindAt.toISOString(),
      });
    }

    if (listReminder.includes("7d")) {
      const remindAt = new Date(now);
      remindAt.setDate(remindAt.getDate() + 7);
      rows.push({
        transaction_id: transactionId,
        title: "Nhắc nhở giao dịch",
        message: `Bạn có giao dịch cần xử lý: ${transactionId}`,
        remind_at: remindAt.toISOString(),
      });
    }

    if (rows.length === 0) return;

    await supabase.from("reminders").insert(rows); // insert 1 hoặc 2 rows cùng lúc
    message.success("Lịch nhắc đã được thiết lập!");
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
      centered
      confirmLoading={loading}
      onOk={submitForm}
      okText="Xác nhận"
      cancelText="Hủy"
      footer={[
        <Button
          type="primary"
          danger
          icon={<FieldTimeOutlined />}
          className="bg-green-500!"
          onClick={() => setOpenReminder(true)}
        >
          Hẹn nhắc
        </Button>,
        <Button type="primary" danger icon={<MailOutlined />} onClick={() => setOpen(true)}>
          Gửi mail
        </Button>,
        <Button key="submit" type="primary" onClick={submitForm} loading={loading}>
          Xác nhận
        </Button>,
      ]}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Form.Item hidden label="Họ tên" name="id">
            <Input placeholder="" disabled />
          </Form.Item>
          <Col span={12}>
            <Form.Item label={<strong>Họ tên</strong>} name="ho_ten">
              <Input placeholder="" disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label={<strong>Số CCCD</strong>} name="cccd_number">
              <Input placeholder="" disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label={<strong>Ngày cấp</strong>} name="ngay_cap">
              <Input placeholder="" disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label={<strong>Nơi cấp</strong>} name="noi_cap">
              <Input placeholder="" disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label={<strong>Email nhận HĐ</strong>} name="email_nhan_hd">
              <Input placeholder="" disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label={<strong>User name</strong>} name="username">
              <Input placeholder="" disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label={<strong>Trạng thái check</strong>} name="status">
              <Tag color={form.getFieldValue("status") === "OK" ? "green" : "red"}>
                {form.getFieldValue("status") === "OK" ? "OK" : "FAILED"}
              </Tag>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label={<strong>Trạng thái hoàn thành định dạnh</strong>} name="status_identification">
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

      <Modal
        title="Preview email"
        open={open}
        onCancel={() => setOpen(false)}
        width={900}
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
          <Popconfirm
            title="Xác nhận gửi email?"
            description={`Bạn có chắc chắn muốn gửi email này cho ${form.getFieldValue("email_nhan_hd")} không?`}
            okText="Gửi"
            cancelText="Hủy"
            onConfirm={() => {
              handleSendMail();
              setOpen(false);
            }}
          >
            <Button key="send" type="primary" icon={<MailOutlined />}>
              Xác nhận gửi
            </Button>
          </Popconfirm>,
        ]}
      >
        <CreatorVerificationGuideline
          nameUser={nameUser}
          reason={reason}
          instruction={guide}
          setGuide={setGuide}
          setNameUser={setNameUser}
          setReason={setReason}
        />
      </Modal>

      <Modal
        title="Chọn lịch nhắc tôi"
        open={openReminder}
        centered
        width={400}
        style={{ top: 20 }}
        styles={{
          body: {
            maxHeight: "70vh",
            overflowY: "auto",
          },
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setOpenReminder(false);
              setListReminder([]);
            }}
          >
            Hủy
          </Button>,
          <Popconfirm
            title="Xác nhận thiết lập lịch nhắc?"
            description="Bạn có chắc chắn muốn thiết lập lịch nhắc này không?"
            okText="Gửi"
            cancelText="Hủy"
            onConfirm={() => {
              handleReminder(form.getFieldValue("id"));
              setOpenReminder(false);
              setListReminder([]);
            }}
          >
            <Button key="send" type="primary" icon={<MailOutlined />}>
              Xác nhận gửi
            </Button>
          </Popconfirm>,
        ]}
      >
        <Space style={{ width: "100%" }} vertical>
          <Select
            mode="multiple"
            allowClear
            style={{ width: "100%" }}
            placeholder="Please select"
            value={listReminder}
            onChange={(values) => setListReminder(values as string[])}
            options={[
              { value: "5m", label: "5 phút sau" },
              { value: "3d", label: "3 ngày sau" },
              { value: "7d", label: "7 ngày sau" },
            ]}
          />
        </Space>
      </Modal>
    </Modal>
  );
});
