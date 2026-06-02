import { useEffect, useMemo, useState } from "react";
import { Card, Spin, Statistic } from "antd";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "../../utils/supabase";

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
        console.error("Loi fetch dashboard:", error);
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
      .map(([date, count]) => ({ date, count }));
  }, [records]);

  const statusChartData = useMemo(
    () => [
      { name: "OK", value: totals.okCount },
      { name: "FAILED", value: totals.failedCount },
      { name: "Khác", value: totals.total - totals.okCount - totals.failedCount },
    ],
    [totals],
  );

  const identificationChartData = useMemo(
    () => [
      { name: "Đã hoàn thành", value: totals.completedCount },
      { name: "Chưa hoàn thành", value: totals.pendingCount },
    ],
    [totals],
  );

  const reminderChartData = useMemo(
    () => [
      { name: "5 phút", value: totals.reminder5m },
      { name: "3 ngày", value: totals.reminder3d },
      { name: "7 ngày", value: totals.reminder7d },
    ],
    [totals],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl shadow-sm" bordered={false}>
          <Statistic
            title={<span className="font-semibold text-red-500">Tổng hồ sơ</span>}
            value={totals.total}
          />
        </Card>
        <Card className="rounded-2xl shadow-sm" bordered={false}>
          <Statistic
            title={<span className="font-semibold text-blue-500">Hồ sơ OK</span>}
            value={totals.okCount}
          />
        </Card>
        <Card className="rounded-2xl shadow-sm" bordered={false}>
          <Statistic
            title={<span className="font-semibold text-red-500">Hồ sơ FAILED</span>}
            value={totals.failedCount}
          />
        </Card>
        <Card className="rounded-2xl shadow-sm" bordered={false}>
          <Statistic
            title={<span className="font-semibold text-green-500">Đã hoàn thành</span>}
            value={totals.completedCount}
          />
        </Card>
      </div>

      <Spin spinning={loading}>
        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="rounded-2xl shadow-sm" bordered={false} title="Xu hướng tạo hồ sơ (14 ngày)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 16, right: 16, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#2563eb" fill="url(#trend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="rounded-2xl shadow-sm" bordered={false} title="Trạng thái check">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="rounded-2xl shadow-sm" bordered={false} title="Trạng thái định danh">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={identificationChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                  >
                    {identificationChartData.map((entry, index) => (
                      <Cell key={entry.name} fill={IDENT_COLORS[index % IDENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="rounded-2xl shadow-sm" bordered={false} title="Lịch nhắc đã thiết lập">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reminderChartData} margin={{ top: 16, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Spin>
    </div>
  );
}
