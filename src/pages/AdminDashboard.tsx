
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Calendar, User, Check, X, ShieldAlert } from "lucide-react";
import Navbar from "@/components/Navbar";

const AdminDashboard = () => {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        checkAdminStatus();
    }, []);

    const checkAdminStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setIsAdmin(false);
            setLoading(false);
            return;
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("user_id", user.id)
            .single();

        if (profile?.is_admin) {
            setIsAdmin(true);
            fetchAdminData();
        } else {
            setIsAdmin(false);
            setLoading(false);
        }
    };

    const fetchAdminData = async () => {
        setLoading(true);
        const { data: appts, error } = await supabase
            .from("appointments")
            .select(`
        *,
        profiles:user_id (full_name),
        treatments:treatment_id (title)
      `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching admin data:", error);
            toast({ variant: "destructive", title: "Fetch Failed", description: error.message });
        }
        if (appts) setAppointments(appts);

        const { data: msgs, error: msgError } = await supabase
            .from("messages")
            .select(`
                *,
                profiles:sender_id (full_name)
            `)
            .order("created_at", { ascending: false });

        if (msgError) {
            console.error("Error fetching messages:", msgError);
        }
        if (msgs) setMessages(msgs);

        setLoading(false);
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        const { error } = await supabase
            .from("appointments")
            .update({ status })
            .eq("id", id);

        if (error) {
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
        } else {
            toast({ title: "Updated", description: `Appointment ${status}` });
            fetchAdminData();
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Admin Portal...</div>;

    if (isAdmin === false) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground mt-2">You do not have administrative privileges to view this page.</p>
                <Button className="mt-6" onClick={() => window.location.href = "/"}>Return Home</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="container mx-auto py-8 px-4 mt-20">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-display">Admin Portal</h1>
                        <p className="text-muted-foreground">Manage patient requests and system activity</p>
                    </div>
                </div>

                <Tabs defaultValue="appointments" className="space-y-6">
                    <TabsList className="bg-white border">
                        <TabsTrigger value="appointments" className="gap-2">
                            <Calendar className="w-4 h-4" />
                            Appointments
                        </TabsTrigger>
                        <TabsTrigger value="chats" className="gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Patient Chats
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="appointments">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Patient Requests</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Treatment</TableHead>
                                            <TableHead>Date Requested</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {appointments.map((appt) => (
                                            <TableRow key={appt.id}>
                                                <TableCell className="font-medium">{appt.profiles?.full_name || "Unknown Patient"}</TableCell>
                                                <TableCell>{appt.treatments?.title || "General Inquiry"}</TableCell>
                                                <TableCell>{new Date(appt.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        appt.status === "confirmed" ? "default" :
                                                            appt.status === "pending" ? "secondary" :
                                                                "destructive"
                                                    }>
                                                        {appt.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {appt.status === "pending" && (
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" variant="outline" className="text-green-600 border-green-200" onClick={() => handleUpdateStatus(appt.id, "confirmed")}>
                                                                <Check className="w-4 h-4 mr-1" /> Approve
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => handleUpdateStatus(appt.id, "cancelled")}>
                                                                <X className="w-4 h-4 mr-1" /> Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="chats">
                        <Card>
                            <CardHeader>
                                <CardTitle>Global Chat Logs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Message</TableHead>
                                            <TableHead>Type</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {messages.map((msg) => (
                                            <TableRow key={msg.id}>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {new Date(msg.created_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {msg.profiles?.full_name || "Unknown"}
                                                </TableCell>
                                                <TableCell className="max-w-md truncate">
                                                    {msg.content}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={msg.is_agent ? "outline" : "secondary"}>
                                                        {msg.is_agent ? "AI Agent" : "Patient"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {messages.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                                    No messages found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminDashboard;
