import { motion } from "framer-motion";
import { Heart, Smile, Bone, Baby, Eye, Brain, Stethoscope, Scissors } from "lucide-react";

const treatments = [
  { icon: Heart, name: "Cardiac Surgery", procedures: "Bypass, Valve Replacement, Angioplasty", savings: "Up to 90%" },
  { icon: Bone, name: "Orthopedics", procedures: "Knee/Hip Replacement, Spine Surgery", savings: "Up to 85%" },
  { icon: Smile, name: "Dental Care", procedures: "Implants, Veneers, Full Mouth Rehab", savings: "Up to 80%" },
  { icon: Scissors, name: "Cosmetic Surgery", procedures: "Rhinoplasty, Liposuction, Facelift", savings: "Up to 75%" },
  { icon: Baby, name: "Fertility (IVF)", procedures: "IVF, IUI, Egg Freezing", savings: "Up to 70%" },
  { icon: Eye, name: "Ophthalmology", procedures: "LASIK, Cataract, Retina Surgery", savings: "Up to 80%" },
  { icon: Brain, name: "Neurology", procedures: "Brain Surgery, Deep Brain Stimulation", savings: "Up to 85%" },
  { icon: Stethoscope, name: "General Surgery", procedures: "Bariatric, Hernia, Transplant", savings: "Up to 80%" },
];

const TreatmentCategories = () => (
  <section id="treatments" className="py-20 md:py-28 bg-secondary/50">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Treatments</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3">
          Explore World-Class Procedures
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          Access the same quality as top US hospitals — at a fraction of the price.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {treatments.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="group bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer border border-border hover:border-primary/30"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <t.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-1">{t.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t.procedures}</p>
            <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Save {t.savings}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TreatmentCategories;
