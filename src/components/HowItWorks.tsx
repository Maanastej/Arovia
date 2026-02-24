import { motion } from "framer-motion";
import { FileText, Video, Plane, Heart, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Share Your Reports",
    description: "Upload your medical records and tell us about your condition. Our team reviews everything within 24 hours.",
  },
  {
    icon: Video,
    title: "Virtual Consultation",
    description: "Connect with top Indian specialists via secure messaging. Get a personalized treatment plan and transparent cost breakdown.",
  },
  {
    icon: Plane,
    title: "We Handle Everything",
    description: "Flights, visa assistance, airport pickup, hotel, hospital appointments — your dedicated coordinator manages it all.",
  },
  {
    icon: Heart,
    title: "Treatment & Recovery",
    description: "Receive world-class care with a personal care buddy. We support your recovery and follow-ups even after you return home.",
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-20 md:py-28 bg-background">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">How It Works</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3">
          Your Healing Journey, Simplified
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          From your first inquiry to post-treatment follow-up, Arovia is with you every step of the way.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-8 relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-border" />

        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="relative text-center"
          >
            <div className="relative z-10 w-24 h-24 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6 shadow-card">
              <step.icon className="w-10 h-10 text-primary" />
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Step {i + 1}</span>
            <h3 className="font-display text-xl font-semibold text-foreground mt-2 mb-3">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
