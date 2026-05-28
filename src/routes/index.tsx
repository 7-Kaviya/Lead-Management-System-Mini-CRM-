import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Trash2, Users, Phone, Search, TrendingUp, CheckCircle2, LayoutDashboard } from "lucide-react";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lead Management — Mini CRM" },
      { name: "description", content: "Simple Mini CRM to capture leads, track sources, and update status." },
    ],
  }),
  component: LeadsPage,
});

type Source = "Call" | "WhatsApp" | "Field";
type Status = "New" | "Interested" | "Not Interested" | "Converted";

interface Lead {
  id: string;
  name: string;
  phone: string;
  source: Source;
  status: Status;
  created_at: string;
}

const STATUS_STYLES: Record<Status, string> = {
  New: "bg-secondary text-secondary-foreground",
  Interested: "bg-accent text-accent-foreground",
  "Not Interested": "bg-destructive/10 text-destructive",
  Converted: "bg-success/15 text-success",
};

const SOURCE_STYLES: Record<Source, string> = {
  Call: "bg-primary/10 text-primary",
  WhatsApp: "bg-success/15 text-success",
  Field: "bg-warning/20 text-warning-foreground",
};

function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState<Source | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

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

  async function addLead(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !source) {
      toast.error("Please fill name, phone and source.");
      return;
    }
    if (!/^[+\d][\d\s-]{6,}$/.test(phone.trim())) {
      toast.error("Enter a valid phone number.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("leads")
      .insert({ name: name.trim(), phone: phone.trim(), source });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Lead added");
    setName(""); setPhone(""); setSource("");
    load();
  }

  async function updateStatus(id: string, status: Status) {
    const prev = leads;
    setLeads(prev.map((l) => (l.id === id ? { ...l, status } : l)));
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      setLeads(prev);
    }
  }

  async function removeLead(id: string) {
    const prev = leads;
    setLeads(prev.filter((l) => l.id !== id));
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      setLeads(prev);
    } else toast.success("Lead deleted");
  }

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchesQuery =
        !query ||
        l.name.toLowerCase().includes(query.toLowerCase()) ||
        l.phone.includes(query);
      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [leads, query, statusFilter]);

  const stats = useMemo(() => ({
    total: leads.length,
    interested: leads.filter((l) => l.status === "Interested").length,
    converted: leads.filter((l) => l.status === "Converted").length,
  }), [leads]);

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-right" />

      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground"
                style={{ background: "var(--gradient-hero)" }}
              >
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Lead Management</h1>
                <p className="text-sm text-muted-foreground">Mini CRM · capture, track, convert</p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total leads" value={stats.total} icon={<Users className="h-4 w-4" />} />
          <StatCard label="Interested" value={stats.interested} icon={<TrendingUp className="h-4 w-4" />} />
          <StatCard label="Converted" value={stats.converted} icon={<CheckCircle2 className="h-4 w-4" />} />
        </section>

        {/* Add Lead */}
        <Card style={{ boxShadow: "var(--shadow-card)" }}>
          <CardHeader>
            <CardTitle className="text-lg">Add new lead</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addLead} className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98XXXXXXXX" />
              </div>
              <div className="space-y-1.5">
                <Label>Source</Label>
                <Select value={source} onValueChange={(v) => setSource(v as Source)}>
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Field">Field</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={submitting} className="w-full md:w-auto">
                  {submitting ? "Adding…" : "Add lead"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search name or phone…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | "all")}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Interested">Interested</SelectItem>
              <SelectItem value="Not Interested">Not Interested</SelectItem>
              <SelectItem value="Converted">Converted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Leads list */}
        <Card style={{ boxShadow: "var(--shadow-card)" }}>
          <CardHeader>
            <CardTitle className="text-lg">Leads ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">No leads found.</p>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((lead) => (
                  <li key={lead.id} className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{lead.name}</p>
                        <Badge variant="outline" className={SOURCE_STYLES[lead.source]}>{lead.source}</Badge>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />{lead.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={lead.status} onValueChange={(v) => updateStatus(lead.id, v as Status)}>
                        <SelectTrigger className={`w-40 ${STATUS_STYLES[lead.status]} border-0`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Interested">Interested</SelectItem>
                          <SelectItem value="Not Interested">Not Interested</SelectItem>
                          <SelectItem value="Converted">Converted</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLead(lead.id)}
                        aria-label="Delete lead"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card style={{ boxShadow: "var(--shadow-card)" }}>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
