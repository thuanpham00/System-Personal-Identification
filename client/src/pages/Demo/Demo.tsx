/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge, Button, Input, Select, Table, Tabs, Tag } from "antd";
import { PlusOutlined, SearchOutlined, EllipsisOutlined, MailOutlined } from "@ant-design/icons";
import "./Demo.css";
import type { ColumnsType } from "antd/es/table";

interface Account {
  key: string;
  name: string;
  email: string;
  type: string;
  passionPoint: string;
  rejectDate: string;
  reminderDate1: string;
  reminderDate2: string;
}

const data: Account[] = [
  {
    key: "1",
    name: "Bùi Thị Bích Trâm",
    email: "_000LdmSepcdk7P3X3UvugiiEMgfg-gQSAs@mecreator.asia",
    type: "Cá nhân",
    passionPoint: "-",
    rejectDate: "08/06/2026",
    reminderDate1: "10/06/2026",
    reminderDate2: "15/06/2026",
  },
  {
    key: "2",
    name: "Ánh Dương Sunny",
    email: "_000ov5BmIG8sRwXxftnAuIXspmCBL_kfIZn@mecreator.asia",
    type: "Cá nhân",
    passionPoint: "-",
    rejectDate: "09/06/2026",
    reminderDate1: "12/06/2026",
    reminderDate2: "18/06/2026",
  },
  {
    key: "3",
    name: "blessypham",
    email: "_000GIR8FvY3m4MY4kw0s7uH02-Kk_oPPzPE@mecreator.asia",
    type: "Cá nhân",
    passionPoint: "-",
    rejectDate: "05/06/2026",
    reminderDate1: "08/06/2026",
    reminderDate2: "13/06/2026",
  },
];

const columns: ColumnsType<Account> = [
  {
    title: "Tài khoản",
    width: 350,
    render: (_: any, record: Account) => (
      <div className="flex flex-col">
        <span className="font-semibold text-[#7C3AED] text-[15px]">{record.name}</span>

        <span className="text-gray-400 text-sm mt-1">{record.email}</span>
      </div>
    ),
  },

  {
    title: "Passion Point",
    dataIndex: "passionPoint",
    align: "center",
  },

  {
    title: "Phân loại hồ sơ",
    dataIndex: "type",
  },

  {
    title: "Ngày từ chối",
    dataIndex: "rejectDate",
  },

  {
    title: "Ngày hẹn nhắc lần 1",
    dataIndex: "reminderDate1",
  },

  {
    title: "Ngày hẹn nhắc lần 2",
    dataIndex: "reminderDate2",
  },

  {
    title: "T. thái hoạt động",
    render: () => (
      <Tag color="success" className="rounded-full px-3 py-1">
        • Đang hoạt động
      </Tag>
    ),
  },

  {
    title: "T. thái xác thực",
    render: () => (
      <Tag color="error" className="rounded-full px-3 py-1">
        • Xác thực thất bại
      </Tag>
    ),
  },

  {
    title: "",
    width: 60,
    render: () => <Button type="primary" size="small" className="!rounded-full" icon={<MailOutlined />} />,
  },
  {
    fixed: "right",
    width: 60,
    render: () => <Button type="text" icon={<EllipsisOutlined />} />,
  },
];

export default function AccountList() {
  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Danh sách tài khoản</h1>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="!h-12 !px-6 !rounded-xl"
            style={{
              background: "#7C3AED",
            }}
          >
            Tạo hồ sơ
          </Button>
        </div>

        {/* Tabs */}
        <div className="px-8 border-b">
          <Tabs
            defaultActiveKey="creator"
            items={[
              {
                key: "creator",
                label: (
                  <div className="flex gap-2 items-center">
                    Creator
                    <Badge
                      count={343}
                      style={{
                        background: "#7C3AED",
                      }}
                    />
                  </div>
                ),
              },
              {
                key: "vendor",
                label: (
                  <div className="flex gap-2">
                    Vendor
                    <span className="text-gray-400">4</span>
                  </div>
                ),
              },
              {
                key: "brand",
                label: "Brand",
              },
              {
                key: "admin",
                label: "Admin",
              },
            ]}
          />
        </div>

        {/* Filter */}
        <div className="p-8 flex gap-3 flex-wrap">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên tài khoản"
            className="!w-[320px] !h-12"
          />

          <Select
            placeholder="Phân loại hồ sơ"
            className="!w-[220px]"
            options={[
              {
                label: "Cá nhân",
                value: "1",
              },
            ]}
          />

          <Select placeholder="T.thái hoạt động" className="!w-[220px]" />

          <Select defaultValue="Xác thực thất bại" className="!w-[220px]" />

          <Select placeholder="Vendor quản lý" className="!w-[220px]" />

          <Select placeholder="Passion points" className="!w-[220px]" />
        </div>

        {/* Table */}
        <div className="px-4 pb-8">
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: 1800 }}
            rowClassName={() => "hover:bg-violet-50 transition-all"}
          />
        </div>
      </div>
    </div>
  );
}
