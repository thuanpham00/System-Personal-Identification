/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { Table, Tag, Spin, Typography, Space, Button, message, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";
import { supabase } from "../../utils/supabase";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { DataModal, type DataModalRef } from "../../components/DataModal";

const { Title } = Typography;

interface DataRecord {
  id: string;
  ho_ten: string;
  cccd_number: string;
  ngay_cap: string;
  noi_cap: string;
  email_nhan_hd: string;
  username: string;
  created_at: string;
  status: string;
  status_identification: string;
  reminder_3day: string;
  reminder_7day: string;
  reminder_5m: string;
  sdt: string;
}

export default function DataList() {
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const dataItemRef = useRef<DataModalRef>(null);

  const fetchData = async () => {
    const { data, error } = await supabase.from("data").select("*").order("created_at", { ascending: false });

    if (error) {
      console.error("Lỗi fetch data:", error);
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("data").delete().eq("id", id);

      if (error) {
        message.error("Xóa thất bại");
        console.error(error);
        return;
      }

      message.success("Xóa thành công");
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Có lỗi xảy ra");
    }
  };

  const columns: ColumnsType<DataRecord> = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
      fixed: "left",
      width: 60,
    },
    {
      title: "Họ tên",
      dataIndex: "ho_ten",
      key: "ho_ten",
    },
    {
      title: "Số CCCD",
      dataIndex: "cccd_number",
      key: "cccd_number",
    },
    {
      title: "Ngày cấp",
      dataIndex: "ngay_cap",
      key: "ngay_cap",
    },
    {
      title: "Nơi cấp",
      dataIndex: "noi_cap",
      key: "noi_cap",
      ellipsis: true,
    },
    {
      title: "Email nhận HĐ",
      dataIndex: "email_nhan_hd",
      key: "email_nhan_hd",
    },
    {
      title: "SĐT",
      dataIndex: "sdt",
      key: "sdt",
    },
    {
      title: "Tên tài khoản",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (val: string) => new Date(val).toLocaleString("vi-VN"),
    },
    {
      title: "Ngày nhắc 5 phút (nháp)",
      dataIndex: "reminder_5m",
      key: "reminder_5m",
      render: (val: string) => (val ? new Date(val).toLocaleString("vi-VN") : null),
    },
    {
      title: "Ngày nhắc lần 1",
      dataIndex: "reminder_3day",
      key: "reminder_3day",
      render: (val: string) => (val ? new Date(val).toLocaleString("vi-VN") : null),
    },
    {
      title: "Ngày nhắc lần 2",
      dataIndex: "reminder_7day",
      key: "reminder_7day",
      render: (val: string) => (val ? new Date(val).toLocaleString("vi-VN") : null),
    },
    {
      title: "Trạng thái check",
      key: "status",
      fixed: "right",
      render: (_, record) => {
        const ok = record.status;
        return ok === "OK" ? <Tag color="green">OK</Tag> : <Tag color="red">FAILED</Tag>;
      },
    },
    {
      title: "Trạng thái hoàn thành định dạnh",
      key: "status_identification",
      fixed: "right",
      render: (_, record) => {
        const ok = record.status_identification;
        return ok === "completed" ? (
          <Tag color="green">Đã hoàn thành</Tag>
        ) : (
          <Tag color="red">Chưa hoàn thành</Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => dataItemRef.current?.handleUpdate(record)}>
            <EditOutlined />
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc muốn xóa dữ liệu này không?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)} // record.id là dòng hiện tại
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        Danh sách hồ sơ
      </Title>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
          bordered
        />
      </Spin>

      <DataModal ref={dataItemRef} onClose={() => {}} onSubmitOk={fetchData} />
    </div>
  );
}
