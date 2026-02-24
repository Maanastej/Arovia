
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  MessageSquare, Calendar, Check, X, ShieldAlert, RefreshCw,
  Search, Users, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  BarChart3, FileText, Bot, User2
} from "lucide-react";
import Navbar from "@/components/Navbar";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Appointment {
  id: string;
  user_id: string;
  treatment_id: string | null;
  status: string;
  scheduled_at: string | null;
  notes: string | null;
  created_at: string;
  // resolved client-side after merging
  patientName: string;
  treatmentTitle: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  is_agent: boolean;
  created_at: string;
  // resolved client-side
  senderName: string;
}

interface ConversationGroup {
  userId: string;
  userName: string;
  messages: Message[];
  lastMessageAt: string;
}

// ─── Status Badge Helper ───────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className: string }> = {
    pending: { variant: "secondary", label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
    confirmed: { variant: "default", label: "Confirmed", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    completed: { variant: "outline", label: "Completed", className: "bg-blue-100 text-blue-700 border-blue-200" },
    cancelled: { variant: "destructive", label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200" },
  };
  const cfg = map[status] ?? { variant: "outline" as const, label: status, className: "" };
  return <Badge variant={cfg.variant} className={`capitalize font-medium ${cfg.className}`}>{cfg.label}</Badge>;
};

// ─── Main Component ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apptSearch, setApptSearch] = useState("");
  const [apptStatusFilter, setApptStatusFilter] = useState<string>("all");
  const [chatSearch, setChatSearch] = useState("");
  const [expandedConvo, setExpandedConvo] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { checkAdminStatus(); }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsAdmin(false); setLoading(false); return; }
    const { data: profile } = await supabase
      .from("profiles").select("is_admin").eq("user_id", user.id).single();
    if (profile?.is_admin) { setIsAdmin(true); fetchAdminData(); }
    else { setIsAdmin(false); setLoading(false); }
  };

  const fetchAdminData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);

    // Fetch all four tables in parallel — no cross-table joins (avoids RLS FK issues)
    const [apptResult, profileResult, treatmentResult, msgResult] = await Promise.all([
      supabase.from("appointments").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, full_name"),
      supabase.from("treatments").select("id, title"),
      supabase.from("messages").select("*").order("created_at", { ascending: true }),
    ]);

    // ── Verbose diagnostics ──────────────────────────────────────────────────
    console.group("[AdminDashboard] fetchAdminData results");
    console.log("appointments → count:", apptResult.data?.length, "| error:", apptResult.error?.message ?? "none");
    console.log("profiles     → count:", profileResult.data?.length, "| error:", profileResult.error?.message ?? "none");
    console.log("treatments   → count:", treatmentResult.data?.length, "| error:", treatmentResult.error?.message ?? "none");
    console.log("messages     → count:", msgResult.data?.length, "| error:", msgResult.error?.message ?? "none");
    console.groupEnd();

    if (apptResult.error) toast({ variant: "destructive", title: "Appointments query failed", description: apptResult.error.message });
    if (profileResult.error) toast({ variant: "destructive", title: "Profiles query failed", description: profileResult.error.message });
    if (treatmentResult.error) toast({ variant: "destructive", title: "Treatments query failed", description: treatmentResult.error.message });
    if (msgResult.error) toast({ variant: "destructive", title: "Messages query failed", description: msgResult.error.message });

    // Build lookup maps
    const profileMap: Record<string, string> = {};
    (profileResult.data ?? []).forEach((p: any) => { profileMap[p.user_id] = p.full_name ?? "Unknown Patient"; });

    const treatmentMap: Record<string, string> = {};
    (treatmentResult.data ?? []).forEach((t: any) => { treatmentMap[t.id] = t.title ?? ""; });

    // Merge appointments
    const mergedAppts: Appointment[] = (apptResult.data ?? []).map((a: any) => ({
      ...a,
      patientName: profileMap[a.user_id] ?? "Unknown Patient",
      treatmentTitle: a.treatment_id ? (treatmentMap[a.treatment_id] ?? "General Inquiry") : "General Inquiry",
    }));
    setAppointments(mergedAppts);

    // Merge messages
    const mergedMsgs: Message[] = (msgResult.data ?? []).map((m: any) => ({
      ...m,
      senderName: profileMap[m.sender_id] ?? "Unknown",
    }));
    setMessages(mergedMsgs);

    setLoading(false);
    setRefreshing(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } else {
      toast({ title: "✅ Updated", description: `Appointment marked as ${status}.` });
      fetchAdminData(true);
    }
  };

  // ── Derived stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter(a => a.status === "pending").length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
    patients: new Set(appointments.map(a => a.user_id)).size,
    chatTotal: messages.filter(m => !m.is_agent).length,
  }), [appointments, messages]);

  // ── Filtered appointments ───────────────────────────────────────────────────
  const filteredAppts = useMemo(() => {
    return appointments.filter(a => {
      const matchSearch =
        a.patientName.toLowerCase().includes(apptSearch.toLowerCase()) ||
        a.treatmentTitle.toLowerCase().includes(apptSearch.toLowerCase()) ||
        (a.notes ?? "").toLowerCase().includes(apptSearch.toLowerCase());
      const matchStatus = apptStatusFilter === "all" || a.status === apptStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [appointments, apptSearch, apptStatusFilter]);

  // ── Group messages by patient (non-admin sender) ────────────────────────────
  const conversations: ConversationGroup[] = useMemo(() => {
    const map: Record<string, ConversationGroup> = {};
    messages.forEach(msg => {
      // Group by the human sender (sender_id when is_agent=false)
      const uid = msg.sender_id;
      if (msg.is_agent) return; // skip agent echo-messages for grouping key
      if (!map[uid]) {
        map[uid] = {
          userId: uid,
          userName: msg.senderName ?? "Unknown Patient",
          messages: [],
          lastMessageAt: msg.created_at,
        };
      }
      map[uid].messages.push(msg);
      map[uid].lastMessageAt = msg.created_at;
    });
    // Also add agent replies into their groups
    messages.forEach(msg => {
      if (msg.is_agent && map[msg.sender_id]) {
        map[msg.sender_id].messages.push(msg);
      }
    });
    // Sort each conversation messages by time
    return Object.values(map)
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }, [messages]);

  const filteredConversations = useMemo(() => {
    if (!chatSearch) return conversations;
    return conversations.filter(c =>
      c.userName.toLowerCase().includes(chatSearch.toLowerCase())
    );
  }, [conversations, chatSearch]);

  // ── Access denied ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Loading Admin Portal…</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-50">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You do not have administrative privileges.</p>
        <Button className="mt-6" onClick={() => window.location.href = "/"}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4 mt-20 max-w-7xl">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Admin Portal
            </h1>
            <p className="text-muted-foreground mt-1">Manage patient bookings and review chat conversations.</p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => fetchAdminData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh Data"}
          </Button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: stats.total, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Unique Patients", value: stats.patients, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Cancelled", value: stats.cancelled, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
            { label: "Patient Messages", value: stats.chatTotal, icon: MessageSquare, color: "text-sky-600", bg: "bg-sky-50" },
          ].map((s, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="pt-5 pb-4">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="bg-white border shadow-sm h-11">
            <TabsTrigger value="bookings" className="gap-2 text-sm">
              <Calendar className="w-4 h-4" /> Bookings
              {stats.pending > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none">{stats.pending}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="chats" className="gap-2 text-sm">
              <MessageSquare className="w-4 h-4" /> Patient Chats
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold leading-none">{filteredConversations.length}</span>
            </TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════
              TAB: BOOKINGS
          ══════════════════════════════ */}
          <TabsContent value="bookings">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by patient, treatment, or notes…"
                      className="pl-9"
                      value={apptSearch}
                      onChange={e => setApptSearch(e.target.value)}
                    />
                  </div>
                  {/* Status filter */}
                  <div className="flex gap-2 flex-wrap">
                    {["all", "pending", "confirmed", "completed", "cancelled"].map(s => (
                      <Button
                        key={s}
                        size="sm"
                        variant={apptStatusFilter === s ? "default" : "outline"}
                        className="capitalize h-9"
                        onClick={() => setApptStatusFilter(s)}
                      >
                        {s === "all" ? "All" : s}
                      </Button>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {filteredAppts.length} booking{filteredAppts.length !== 1 ? "s" : ""} shown
                </p>
              </CardHeader>
              <CardContent className="pt-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">Patient</TableHead>
                      <TableHead className="font-semibold">Treatment</TableHead>
                      <TableHead className="font-semibold">Requested On</TableHead>
                      <TableHead className="font-semibold">Scheduled For</TableHead>
                      <TableHead className="font-semibold">Notes</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p className="font-medium">No bookings found</p>
                          <p className="text-sm mt-1">Try adjusting your search or filter.</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredAppts.map((appt) => (
                      <TableRow key={appt.id} className="group hover:bg-slate-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <User2 className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-sm">{appt.patientName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{appt.treatmentTitle || <span className="text-muted-foreground italic">General Inquiry</span>}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(appt.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {appt.scheduled_at
                            ? new Date(appt.scheduled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                            : <span className="italic">Not scheduled</span>}
                        </TableCell>
                        <TableCell className="max-w-[200px] text-sm text-muted-foreground">
                          <span className="truncate block" title={appt.notes ?? ""}>
                            {appt.notes ?? <span className="italic">—</span>}
                          </span>
                        </TableCell>
                        <TableCell><StatusBadge status={appt.status} /></TableCell>
                        <TableCell className="text-right">
                          {appt.status === "pending" ? (
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 h-8"
                                onClick={() => handleUpdateStatus(appt.id, "confirmed")}
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 gap-1 h-8"
                                onClick={() => handleUpdateStatus(appt.id, "cancelled")}
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </Button>
                            </div>
                          ) : appt.status === "confirmed" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 h-8"
                              onClick={() => handleUpdateStatus(appt.id, "completed")}
                            >
                              Mark Completed
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════
              TAB: CHATS
          ══════════════════════════════ */}
          <TabsContent value="chats">
            <div className="space-y-4">
              {/* Chat search */}
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name…"
                  className="pl-9 bg-white"
                  value={chatSearch}
                  onChange={e => setChatSearch(e.target.value)}
                />
              </div>

              {filteredConversations.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-16 text-center text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No conversations found</p>
                    <p className="text-sm mt-1">Patient messages will appear here.</p>
                  </CardContent>
                </Card>
              ) : filteredConversations.map((convo) => {
                const isExpanded = expandedConvo === convo.userId;
                const patientMessages = convo.messages.filter(m => !m.is_agent);
                const lastMsg = [...convo.messages].sort((a, b) =>
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )[0];

                return (
                  <Card key={convo.userId} className="border-0 shadow-sm overflow-hidden">
                    {/* Conversation header — always visible */}
                    <button
                      className="w-full text-left"
                      onClick={() => setExpandedConvo(isExpanded ? null : convo.userId)}
                    >
                      <CardHeader className="pb-3 hover:bg-slate-50/70 transition-colors">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <User2 className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <CardTitle className="text-base">{convo.userName}</CardTitle>
                              <CardDescription className="text-xs truncate max-w-sm mt-0.5">
                                {lastMsg?.content ?? "No messages"}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right hidden sm:block">
                              <p className="text-xs text-muted-foreground">
                                {new Date(convo.lastMessageAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(convo.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {patientMessages.length} msg{patientMessages.length !== 1 ? "s" : ""}
                            </Badge>
                            {isExpanded
                              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            }
                          </div>
                        </div>
                      </CardHeader>
                    </button>

                    {/* Expanded conversation thread */}
                    {isExpanded && (
                      <CardContent className="pt-0 border-t border-slate-100">
                        <div className="max-h-96 overflow-y-auto py-4 space-y-3 pr-2">
                          {[...convo.messages]
                            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                            .map((msg) => (
                              <div key={msg.id} className={`flex gap-2.5 ${msg.is_agent ? "justify-start" : "justify-end"}`}>
                                {msg.is_agent && (
                                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                                    <Bot className="w-3.5 h-3.5 text-violet-600" />
                                  </div>
                                )}
                                <div className={`max-w-[75%] ${msg.is_agent ? "" : "order-first"}`}>
                                  <div
                                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.is_agent
                                      ? "bg-slate-100 text-slate-800 rounded-tl-none"
                                      : "bg-primary text-primary-foreground rounded-tr-none"
                                      }`}
                                  >
                                    {msg.content}
                                  </div>
                                  <p className={`text-[10px] text-muted-foreground mt-1 ${msg.is_agent ? "text-left" : "text-right"}`}>
                                    {msg.is_agent ? "Arovia Assistant" : convo.userName} ·{" "}
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </p>
                                </div>
                                {!msg.is_agent && (
                                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <User2 className="w-3.5 h-3.5 text-primary" />
                                  </div>
                                )}
                              </div>
                            ))
                          }
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
