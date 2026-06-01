/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  Tag,
  Spin,
  Space,
  Button,
  message,
  Popconfirm,
  Checkbox,
  Form,
  Input,
  DatePicker,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { supabase } from "../../utils/supabase";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { DataModal, type DataModalRef } from "../../components/DataModal";
import * as ExcelJS from "exceljs";

interface DataRecord {
  id: string;
  ho_ten: string;
  cccd_number: string;
  ngay_cap: string;
  noi_cap: string;
  email_nhan_hd: string;
  email_login: string;
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
  const [form] = Form.useForm();
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const dataItemRef = useRef<DataModalRef>(null);

  const [query, setQuery] = useState<{
    name?: string;
    startDate?: string;
    endDate?: string;
  }>();

  const fetchData = async () => {
    let q = supabase.from("data").select("*").order("created_at", { ascending: false });

    if (query?.name) {
      q = q.ilike("ho_ten", `%${query.name}%`);
    }
    if (query?.startDate) {
      q = q.gte("created_at", query.startDate);
    }
    if (query?.endDate) {
      q = q.lte("created_at", query.endDate);
    }

    const { data, error } = await q;

    if (error) {
      console.error("Lỗi fetch data:", error);
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [query]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

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

  const isAllSelected = useMemo(() => {
    return records.length > 0 && selectedRowKeys.length === records.length;
  }, [records, selectedRowKeys]);

  const columns: ColumnsType<DataRecord> = [
    {
      title: (
        <div className="flex flex-col gap-2">
          <Checkbox
            checked={isAllSelected}
            onChange={(value) => {
              const isChecked = value.target.checked;
              if (isChecked) {
                const listIds = records.map((item) => {
                  return item.id;
                });
                setSelectedRowKeys(listIds);
              } else {
                setSelectedRowKeys([]);
              }
            }}
          />
        </div>
      ),
      key: "index",
      render: (_, record) => (
        <Checkbox
          checked={selectedRowKeys.includes(record.id)}
          onChange={(checked) => {
            const isChecked = checked.target.checked;
            if (isChecked) {
              setSelectedRowKeys((prev) => [...prev, record.id]);
            } else {
              setSelectedRowKeys((prev) => prev.filter((key) => key !== record.id));
            }
          }}
        />
      ),
      fixed: "left",
      width: 60,
    },
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
      title: "Trạng thái định dạnh",
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

  const handleDeleteMultiple = async () => {
    try {
      for (const id of selectedRowKeys) {
        const { error } = await supabase.from("data").delete().eq("id", id);

        if (error) {
          message.error("Xóa thất bại");
          console.error(error);
          return;
        }
      }
      message.success("Xóa thành công");
      setSelectedRowKeys([]);
      fetchData();
    } catch (error) {
      console.log(error);
      message.error("Có lỗi xảy ra khi xóa hàng loạt");
    }
  };

  const handleExportExcel = async () => {
    if (records.length === 0) {
      message.info("Không có dữ liệu để xuất");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Danh_sach");

    worksheet.columns = [
      { header: "STT", key: "index", width: 6 },
      { header: "Họ tên", key: "ho_ten", width: 24 },
      { header: "Số CCCD", key: "cccd_number", width: 18 },
      { header: "Ngày cấp", key: "ngay_cap", width: 14 },
      { header: "Nơi cấp", key: "noi_cap", width: 20 },
      { header: "SĐT", key: "sdt", width: 14 },
      { header: "Tên tài khoản", key: "username", width: 18 },
      { header: "Email hợp đồng", key: "email_hd", width: 30 },
      { header: "Email đăng nhập", key: "email_dn", width: 30 },
      { header: "Ngày tạo", key: "created_at", width: 20 },
      { header: "Trạng thái check", key: "status", width: 16 },
      { header: "Trạng thái định danh", key: "status_identification", width: 22 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.alignment = { vertical: "middle" };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF16A34A" },
      };
    });

    records.forEach((record, index) => {
      worksheet.addRow({
        index: index + 1,
        ho_ten: record.ho_ten,
        cccd_number: record.cccd_number,
        ngay_cap: record.ngay_cap,
        noi_cap: record.noi_cap,
        sdt: record.sdt,
        username: record.username,
        email_hd: record.email_nhan_hd,
        email_dn: record.email_login,
        created_at: record.created_at ? new Date(record.created_at).toLocaleString("vi-VN") : "",
        status: record.status,
        status_identification: record.status_identification,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `danh_sach_ho_so_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (values: any) => {
    setQuery({
      name: values.name?.trim(),
      startDate: values.startDate?.toISOString(),
      endDate: values.endDate?.endOf("day").toISOString(),
    });
  };

  return (
    <div className="overflow-auto">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-slate-800">Bộ lọc tìm kiếm</p>
            </div>
          </div>
          <Form
            form={form}
            layout="vertical"
            className="flex gap-2 items-end"
            onFinish={handleSubmit}
            onReset={() => {
              form.resetFields();
              setQuery({});
            }}
          >
            <Form.Item name="name" label="Họ tên" className="mb-0!">
              <Input placeholder="Nhập họ tên" allowClear className="mb-0!" />
            </Form.Item>
            <Form.Item name="startDate" label="Ngày bắt đầu" className="mb-0!">
              <DatePicker placeholder="Chọn ngày" className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="endDate" label="Ngày kết thúc" className="mb-0!">
              <DatePicker placeholder="Chọn ngày" className="w-full" format="DD/MM/YYYY" />
            </Form.Item>

            <Button type="primary" htmlType="submit" className="inline-block w-20 mb-0!">
              Tìm kiếm
            </Button>
            <Button type="primary" htmlType="reset" danger className="inline-block w-20 mb-0!">
              Reset
            </Button>
          </Form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex justify-end gap-2 mb-4">
            <Button className="" type="primary" onClick={handleExportExcel}>
              Xuất excel
            </Button>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc muốn xóa các dữ liệu đã chọn không?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={handleDeleteMultiple}
              disabled={selectedRowKeys.length === 0}
            >
              <Button disabled={selectedRowKeys.length === 0} danger type="primary">
                Xóa hàng loạt
              </Button>
            </Popconfirm>
          </div>
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
        </div>
      </div>

      <DataModal ref={dataItemRef} onClose={() => {}} onSubmitOk={fetchData} />
    </div>
  );
}
