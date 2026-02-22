import { motion } from "framer-motion";
import { Shield, Award, Clock, HeadphonesIcon, Plane, UserCheck } from "lucide-react";

const features = [
  { icon: Shield, title: "JCI & NABH Accredited", desc: "Every partner hospital meets the highest international quality and safety standards." },
  { icon: Award, title: "Verified Doctors", desc: "All surgeons are credentialed with 10+ years of experience and verified success rates." },
  { icon: Clock, title: "24/7 Support", desc: "Your personal coordinator is available around the clock — before, during, and after treatment." },
  { icon: Plane, title: "End-to-End Logistics", desc: "Airport pickup, hotel, hospital transfers, and return travel — all managed for you." },
  { icon: HeadphonesIcon, title: "Emergency Hotline", desc: "Immediate access to medical emergency support throughout your stay in India." },
  { icon: UserCheck, title: "Local Care Buddy", desc: "A dedicated assistant accompanies you to appointments, pharmacy visits, and around the city." },
];

const TrustSection = () => (
  <section className="py-20 md:py-28 bg-secondary/50">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Why Arovia</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3">
          Your Safety Is Our Priority
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-4"
          >
            <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <f.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustSection;
