import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Star, MapPin, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-medical.jpg";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";

const stats = [
  { value: "60–90%", label: "Cost Savings" },
  { value: "500+", label: "Partner Hospitals" },
  { value: "10,000+", label: "Patients Served" },
  { value: "4.9★", label: "Patient Rating" },
];

const HeroSection = () => {
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  return (
    <section className="relative pt-16 overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Modern hospital reception" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/70" />
        <div className="absolute inset-0 bg-hero-gradient opacity-40" />
      </div>

      <div className="relative container mx-auto px-4 py-24 md:py-36 lg:py-44">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary-foreground border border-primary/30">
              <Shield className="w-3.5 h-3.5" /> JCI & NABH Accredited Hospitals
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight mb-6"
          >
            World-Class Healthcare.
            <br />
            <span className="text-accent">A Fraction of the Cost.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl font-body"
          >
            Arovia manages your entire medical journey — from consultation to recovery — connecting you with India's top hospitals at up to 90% less than US prices.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            {session ? (
              <Button
                size="lg"
                className="text-base gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-8"
                onClick={() => navigate('/dashboard')}
              >
                Go to Your Dashboard <LayoutDashboard className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="lg"
                className="text-base gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-8"
                onClick={() => navigate('/auth')}
              >
                Start Your Journey <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate('/treatments')}
            >
              Compare Treatment Costs
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <div className="text-2xl md:text-3xl font-display font-bold text-primary-foreground">{stat.value}</div>
                <div className="text-sm text-primary-foreground/60">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
