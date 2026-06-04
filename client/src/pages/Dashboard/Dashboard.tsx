import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row, Spin, Statistic } from "antd";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { supabase } from "../../utils/supabase";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

interface DashboardRecord {
  id: string;
  status: string | null;
  status_identification: string | null;
  created_at: string | null;
  reminder_5m: string | null;
  reminder_3day: string | null;
  reminder_7day: string | null;
}

const STATUS_COLORS = ["#3ea316", "#ef4444", "#f59e0b"];
const IDENT_COLORS = ["#1351d6", "#f97316"];

const formatDateKey = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<DashboardRecord[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data, error } = await supabase
        .from("data")
        .select("id,status,status_identification,created_at,reminder_5m,reminder_3day,reminder_7day")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setRecords([]);
      } else {
        setRecords((data as DashboardRecord[]) || []);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const totals = useMemo(() => {
    const total = records.length;

    const okCount = records.filter((item) => item.status === "OK").length;

    const failedCount = records.filter((item) => item.status === "FAILED").length;

    const completedCount = records.filter((item) => item.status_identification === "completed").length;

    const pendingCount = records.filter((item) => item.status_identification !== "completed").length;

    const reminder5m = records.filter((item) => item.reminder_5m).length;

    const reminder3d = records.filter((item) => item.reminder_3day).length;

    const reminder7d = records.filter((item) => item.reminder_7day).length;

    return {
      total,
      okCount,
      failedCount,
      completedCount,
      pendingCount,
      reminder5m,
      reminder3d,
      reminder7d,
    };
  }, [records]);

  const trendData = useMemo(() => {
    const map = new Map<string, number>();

    records.forEach((item) => {
      if (!item.created_at) return;

      const key = formatDateKey(item.created_at);

      if (!key) return;

      map.set(key, (map.get(key) || 0) + 1);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, count]) => ({
        date,
        count,
      }));
  }, [records]);

  const statusChartData = [
    {
      name: "OK",
      value: totals.okCount,
    },
    {
      name: "FAILED",
      value: totals.failedCount,
    },
    {
      name: "Khác",
      value: totals.total - totals.okCount - totals.failedCount,
    },
  ];

  const identificationChartData = [
    {
      name: "Đã hoàn thành",
      value: totals.completedCount,
    },
    {
      name: "Chưa hoàn thành",
      value: totals.pendingCount,
    },
  ];

  const reminderChartData = [
    {
      name: "5 phút",
      value: totals.reminder5m,
    },
    {
      name: "3 ngày",
      value: totals.reminder3d,
    },
    {
      name: "7 ngày",
      value: totals.reminder7d,
    },
  ];

  const trendOption: EChartsOption = {
    tooltip: {
      trigger: "axis",
    },

    xAxis: {
      type: "category",
      data: trendData.map((item) => item.date),
    },

    yAxis: {
      type: "value",
      minInterval: 1,
    },

    series: [
      {
        type: "line",
        smooth: true,
        data: trendData.map((item) => item.count),
        areaStyle: {},
      },
    ],
  };

  const statusOption: EChartsOption = {
    tooltip: {
      trigger: "item",
    },

    legend: {
      bottom: 0,
    },

    series: [
      {
        type: "pie",
        radius: ["50%", "75%"],

        data: statusChartData.map((item, index) => ({
          ...item,
          itemStyle: {
            color: STATUS_COLORS[index],
          },
        })),
      },
    ],
  };

  const identificationOption: EChartsOption = {
    tooltip: {
      trigger: "item",
    },

    legend: {
      bottom: 0,
    },

    series: [
      {
        type: "pie",
        radius: ["50%", "75%"],

        data: identificationChartData.map((item, index) => ({
          ...item,
          itemStyle: {
            color: IDENT_COLORS[index],
          },
        })),
      },
    ],
  };

  const reminderOption: EChartsOption = {
    tooltip: {
      trigger: "axis",
    },

    xAxis: {
      type: "category",
      data: reminderChartData.map((item) => item.name),
    },

    yAxis: {
      type: "value",
      minInterval: 1,
    },

    series: [
      {
        type: "bar",
        barWidth: 50,
        data: reminderChartData.map((item) => item.value),

        itemStyle: {
          color: "#0ea5e9",
          borderRadius: [8, 8, 0, 0],
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card className="shadow">
            <Statistic
              title={<span className="font-semibold text-red-500">Tổng hồ sơ</span>}
              value={totals.total}
              valueStyle={{ color: "#cf1322" }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card className="shadow">
            <Statistic
              title={<span className="font-semibold text-green-500">Hồ sơ OK</span>}
              value={totals.okCount}
              valueStyle={{ color: "#3f8600" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card className="shadow">
            <Statistic
              title={<span className="font-semibold text-red-500">Hồ sơ FAILED</span>}
              value={totals.failedCount}
              valueStyle={{ color: "#cf1322" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card className="shadow">
            <Statistic
              title={<span className="font-semibold text-blue-500">Đã hoàn thành</span>}
              value={totals.completedCount}
              valueStyle={{ color: "#1677ff" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card className="shadow" title="Xu hướng tạo hồ sơ (14 ngày)">
              <ReactECharts option={trendOption} style={{ height: 300 }} />
            </Card>
          </Col>

          <Col span={12}>
            <Card className="shadow" title="Trạng thái check">
              <ReactECharts option={statusOption} style={{ height: 300 }} />
            </Card>
          </Col>

          <Col span={12}>
            <Card className="shadow" title="Trạng thái định danh">
              <ReactECharts option={identificationOption} style={{ height: 300 }} />
            </Card>
          </Col>

          <Col span={12}>
            <Card className="shadow" title="Lịch nhắc đã thiết lập">
              <ReactECharts option={reminderOption} style={{ height: 300 }} />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
