import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LogOut, User, Calendar, FileText, MessageSquare,
  Heart, MapPin, Bell, Settings, ChevronRight, Plus,
  Upload, Send, Clock, CheckCircle2, History
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
        fetchDashboardData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setProfile(data);
  };

  const fetchDashboardData = async (userId: string) => {
    setLoading(true);

    // Fetch Appointments
    const { data: appts } = await supabase
      .from("appointments")
      .select("*, treatments(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setAppointments(appts || []);

    // Fetch Records
    const { data: recs } = await supabase
      .from("medical_records")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setRecords(recs || []);

    // Fetch Messages
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: true });
    setMessages(msgs || []);

    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send message." });
    } else {
      setNewMessage("");
      setIsTyping(true);
      setTimeout(() => {
        fetchDashboardData(user.id);
        setIsTyping(false);
      }, 2000); // Simulate agent thinking
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData(user.id);

      // Auto-refresh messages every 10 seconds to simulate real-time
      const msgInterval = setInterval(() => {
        if (activeTab === 'messages') {
          fetchDashboardData(user.id);
        }
      }, 10000);

      return () => clearInterval(msgInterval);
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (activeTab === 'messages') {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleFileUpload = async () => {
    if (!user) return;

    // Simulate file upload for demo purposes
    const recordTitle = prompt("Enter a title for your medical record:", "Previous Dental X-Ray.pdf");
    if (!recordTitle) return;

    setLoading(true);
    const { error } = await supabase.from("medical_records").insert({
      user_id: user.id,
      title: recordTitle,
      file_url: "https://example.com/demo-file.pdf",
      file_type: "PDF"
    });

    if (error) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
    } else {
      toast({ title: "Success", description: "Medical record uploaded successfully." });
      fetchDashboardData(user.id);
    }
    setLoading(false);
  };

  const renderOverview = () => (
    <div className="space-y-10">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}! 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your medical journey and manage your care team.
        </p>
      </motion.div>

      {/* Action Required Section */}
      {(records.length === 0 || appointments.length === 0) && (
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent" /> Action Items
            </CardTitle>
            <CardDescription>Complete these steps to speed up your medical consultation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {records.length === 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">1</div>
                  <span className="text-sm font-medium">Upload your recent medical history</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setActiveTab('records'); setSearchParams({ tab: 'records' }); }}>Start <ArrowRight className="ml-1 w-3 h-3" /></Button>
              </div>
            )}
            {appointments.length === 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">2</div>
                  <span className="text-sm font-medium">Browse treatments and book a consult</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/treatments')}>Browse <ArrowRight className="ml-1 w-3 h-3" /></Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Journeys", value: appointments.length > 0 ? "1" : "0", icon: MapPin, color: "text-primary" },
          { label: "Appointments", value: appointments.length.toString(), icon: Calendar, color: "text-accent" },
          { label: "Medical Records", value: records.length.toString(), icon: FileText, color: "text-primary" },
          { label: "Unread Messages", value: messages.filter(m => !m.is_read && m.receiver_id === user?.id).length.toString(), icon: MessageSquare, color: "text-accent" },
        ].map((stat, i) => (
          <Card key={i} className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Action Banner */}
      {appointments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-hero-gradient rounded-3xl p-10 text-primary-foreground relative overflow-hidden group border border-white/10"
        >
          <div className="relative z-10 max-w-xl">
            <h2 className="font-display text-2xl font-bold mb-4">Ready to start your journey?</h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">
              Explore world-class treatments and book a free consultation with our medical experts today.
            </p>
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 h-12"
              onClick={() => navigate("/treatments")}
            >
              Browse Treatments <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-1/2 group-hover:translate-x-1/3 transition-transform duration-700" />
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-display text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Upcoming Appointments
            </h3>
            {appointments.map(appt => (
              <Card key={appt.id} className="group hover:border-primary/50 transition-colors">
                <CardContent className="p-6 flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
                    <img src={appt.treatments?.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{appt.treatments?.title}</h4>
                    <p className="text-sm text-muted-foreground">{new Date(appt.scheduled_at || appt.created_at).toLocaleDateString()} at 10:00 AM</p>
                  </div>
                  <Badge className={appt.status === 'confirmed' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'}>
                    {appt.status.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-6">
            <h3 className="font-display text-xl font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Recent Records
            </h3>
            <div className="space-y-3">
              {records.slice(0, 3).map(rec => (
                <div key={rec.id} className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium truncate flex-1">{rec.title}</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {records.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No documents uploaded yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Appointments</h2>
        <Button onClick={() => navigate("/treatments")} className="gap-2">
          <Plus className="w-4 h-4" /> Book New
        </Button>
      </div>
      <div className="grid gap-4">
        {appointments.length > 0 ? appointments.map(appt => (
          <Card key={appt.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{appt.treatments?.title}</CardTitle>
                <CardDescription>Scheduled for {new Date(appt.scheduled_at || appt.created_at).toLocaleDateString()}</CardDescription>
              </div>
              <Badge>{appt.status}</Badge>
            </CardHeader>
          </Card>
        )) : (
          <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No appointments found.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderRecords = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Medical Records</h2>
        <Button variant="outline" className="gap-2" onClick={handleFileUpload}>
          <Upload className="w-4 h-4" /> Upload Document
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {records.map(rec => (
          <Card key={rec.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <FileText className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-1 truncate">{rec.title}</h3>
              <p className="text-xs text-muted-foreground">{new Date(rec.created_at).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
        {records.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">Your medical vault is empty.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="h-[600px] border border-border rounded-2xl flex flex-col bg-card overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/50">
        <h3 className="font-semibold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Medical Concierge Chat
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length > 0 ? messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender_id === user?.id && !msg.is_agent ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${msg.sender_id === user?.id && !msg.is_agent ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  {msg.is_agent ? "Arovia Assistant" : "You"}
                </span>
              </div>
              <p className="text-sm">{msg.content}</p>
              <span className="text-[10px] opacity-70 mt-1 block">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        )) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <MessageSquare className="w-12 h-12 mb-4" />
            <p>No messages yet. Start a conversation with our team.</p>
          </div>
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-border flex gap-2">
        <Input
          placeholder="Type your message..."
          className="flex-1"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button size="icon" className="shrink-0" onClick={handleSendMessage}><Send className="w-4 h-4" /></Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="font-display text-2xl font-bold text-primary tracking-tight">Arovia</a>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-foreground">
                {profile?.full_name || user?.email}
              </div>
              <div className="text-xs text-muted-foreground">Patient Account</div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:text-destructive">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 flex-1">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 space-y-1">
          <Button
            variant={activeTab === 'overview' ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-3 h-12"
            onClick={() => setActiveTab('overview')}
          >
            <MapPin className="w-5 h-5" /> Overview
          </Button>
          <Button
            variant={activeTab === 'appointments' ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-3 h-12"
            onClick={() => setActiveTab('appointments')}
          >
            <Calendar className="w-5 h-5" /> Appointments
          </Button>
          <Button
            variant={activeTab === 'records' ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-3 h-12"
            onClick={() => setActiveTab('records')}
          >
            <FileText className="w-5 h-5" /> Medical Records
          </Button>
          <Button
            variant={activeTab === 'messages' ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-3 h-12"
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare className="w-5 h-5" /> Messages
          </Button>
          <div className="pt-4 mt-4 border-t border-border">
            <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-muted-foreground" onClick={() => navigate("/treatments")}>
              <Settings className="w-5 h-5" /> Settings
            </Button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'appointments' && renderAppointments()}
              {activeTab === 'records' && renderRecords()}
              {activeTab === 'messages' && renderMessages()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
