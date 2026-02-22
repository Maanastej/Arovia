import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Clock, DollarSign, CheckCircle2, ChevronLeft,
    Calendar, ShieldCheck, Star, ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TreatmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [treatment, setTreatment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTreatment();
    }, [id]);

    const fetchTreatment = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("treatments")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching treatment:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not find treatment details."
            });
            navigate("/treatments");
        } else {
            setTreatment(data);
        }
        setLoading(false);
    };

    const handleBookNow = () => {
        // If not logged in, redirect to auth
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                toast({
                    title: "Session Required",
                    description: "Please sign in to book a consultation."
                });
                navigate("/auth");
            } else {
                // I will implement the actual booking modal later or redirect to dashboard with context
                toast({
                    title: "Booking Initiated",
                    description: "Redirecting you to complete your booking consultation."
                });
                navigate("/dashboard");
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="container mx-auto px-4 pt-24 pb-16">
                <Button
                    variant="ghost"
                    className="mb-8 gap-2 -ml-4"
                    onClick={() => navigate("/treatments")}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Treatments
                </Button>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Left Column: Media */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border border-border">
                            <img
                                src={treatment.image_url || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop"}
                                alt={treatment.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="aspect-video rounded-xl overflow-hidden bg-muted border border-border">
                                    <img
                                        src={`https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=400&auto=format&fit=crop&sig=${i}`}
                                        alt="Facility"
                                        className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Column: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col"
                    >
                        <div className="mb-6">
                            <Badge variant="secondary" className="mb-4">{treatment.category}</Badge>
                            <h1 className="font-display text-4xl font-bold mb-4">{treatment.title}</h1>
                            <div className="flex items-center gap-6 text-muted-foreground mb-6">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <span className="font-medium text-foreground">{treatment.duration_days} Days</span>
                                    <span>Estimated Stay</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <DollarSign className="w-5 h-5 text-primary" />
                                    <span className="font-medium text-foreground">{treatment.price_estimate}</span>
                                    <span>Avg. Savings: 65%</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8 bg-card border border-border rounded-2xl p-8 shadow-card mb-8">
                            <div>
                                <h3 className="text-xl font-semibold mb-3">About this Treatment</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {treatment.description || "Comprehensive medical care provided by world-class specialists in state-of-the-art facilities."}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-4">What's Included?</h3>
                                <ul className="grid sm:grid-cols-2 gap-3 text-sm">
                                    {[
                                        "Pre-operative consultation",
                                        "Advanced diagnostic imaging",
                                        "Hospital & surgical fees",
                                        "Post-operative medications",
                                        "Airport transfers & local transport",
                                        "Dedicated care coordinator"
                                    ].map(item => (
                                        <li key={item} className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="flex-1 h-14 text-lg" onClick={handleBookNow}>
                                Book Consultation
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8" onClick={() => window.print()}>
                                Download Guide
                            </Button>
                        </div>

                        <div className="mt-8 flex items-center justify-between p-4 bg-muted rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">JCI Accredited Facility</div>
                                    <div className="text-xs text-muted-foreground">Certified Safety & Quality</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-primary">
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TreatmentDetail;
