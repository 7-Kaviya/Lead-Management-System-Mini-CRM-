import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  Users,
  Phone,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  LayoutDashboard,
  ArrowLeft,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Mini CRM" },
      { name: "description", content: "Lead analytics and conversion dashboard." },
    ],
  }),
  component: DashboardPage,
});
type Status = "New" | "Interested" | "Not Interested" | "Converted";
type Source = "Call" | "WhatsApp" | "Field";
interface Lead {
  id: string;
  name: string;
  phone: string;
  source: Source;
  status: Status;
  created_at: string;
}
const STATUS_COLORS: Record<Status, string> = {
  New: "#94a3b8",
  Interested: "#f59e0b",
  "Not Interested": "#ef4444",
  Converted: "#22c55e",
};
const SOURCE_COLORS: Record<Source, string> = {
  Call: "#3b82f6",
  WhatsApp: "#22c55e",
  Field: "#f59e0b",
};
function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setLeads((data ?? []) as Lead[]);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);
  const stats = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter((l) => l.status === "New").length;
    const interested = leads.filter((l) => l.status === "Interested").length;
    const notInterested = leads.filter((l) => l.status === "Not Interested").length;
    const converted = leads.filter((l) => l.status === "Converted").length;
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;
    return { total, newLeads, interested, notInterested, converted, conversionRate };
  }, [leads]);
  const statusData = useMemo(() => {
    const counts: Record<Status, number> = {
      New: 0,
      Interested: 0,
      "Not Interested": 0,
      Converted: 0,
    };
    leads.forEach((l) => counts[l.status]++);
    return (Object.keys(counts) as Status[])
      .filter((k) => counts[k] > 0)
      .map((name) => ({ name, value: counts[name], color: STATUS_COLORS[name] }));
  }, [leads]);
  const sourceData = useMemo(() => {
    const counts: Record<Source, number> = { Call: 0, WhatsApp: 0, Field: 0 };
    leads.forEach((l) => counts[l.source]++);
    return (Object.keys(counts) as Source[])
      .filter((k) => counts[k] > 0)
      .map((name) => ({ name, count: counts[name], color: SOURCE_COLORS[name] }));
  }, [leads]);
  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-right" />
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground"
                style={{ background: "var(--gradient-hero)" }}
              >
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Lead analytics at a glance</p>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Leads
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total" value={stats.total} icon={<Users className="h-4 w-4" />} color="bg-primary/10 text-primary" />
          <StatCard label="New" value={stats.newLeads} icon={<Clock className="h-4 w-4" />} color="bg-secondary text-secondary-foreground" />
          <StatCard label="Interested" value={stats.interested} icon={<TrendingUp className="h-4 w-4" />} color="bg-accent text-accent-foreground" />
          <StatCard label="Not Interested" value={stats.notInterested} icon={<XCircle className="h-4 w-4" />} color="bg-destructive/10 text-destructive" />
          <StatCard label="Converted" value={stats.converted} icon={<CheckCircle2 className="h-4 w-4" />} color="bg-success/15 text-success" />
          <StatCard label="Conv. Rate" value={`${stats.conversionRate}%`} icon={<Phone className="h-4 w-4" />} color="bg-warning/20 text-warning-foreground" />
        </section>
        {loading ? (
          <p className="py-20 text-center text-sm text-muted-foreground">Loading…</p>
        ) : leads.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">No leads yet. Add some on the Leads page.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Status Pie Chart */}
            <Card style={{ boxShadow: "var(--shadow-card)" }}>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                      strokeWidth={2}
                      stroke="var(--background)"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Source Bar Chart */}
            <Card style={{ boxShadow: "var(--shadow-card)" }}>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Leads by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={sourceData} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card style={{ boxShadow: "var(--shadow-card)" }}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", color)}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
