import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Michael R.",
    location: "Houston, TX",
    procedure: "Heart Bypass Surgery",
    quote: "I saved over $100,000 and received better care than I could have imagined. The Arovia team was with me every step — from the airport to recovery.",
    rating: 5,
  },
  {
    name: "Sarah L.",
    location: "Los Angeles, CA",
    procedure: "Full Dental Implants",
    quote: "The hospital in Mumbai was incredible — state-of-the-art equipment, compassionate staff. My coordinator even arranged for my mom to stay with me.",
    rating: 5,
  },
  {
    name: "James K.",
    location: "Chicago, IL",
    procedure: "Knee Replacement",
    quote: "I was walking within a week. The surgeon had performed thousands of these procedures. Arovia made the whole trip feel like a five-star experience.",
    rating: 5,
  },
];

const Testimonials = () => (
  <section id="testimonials" className="py-20 md:py-28 bg-background">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Testimonials</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3">
          Real Stories, Real Savings
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="bg-card rounded-xl p-8 shadow-card border border-border relative"
          >
            <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10" />
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="w-4 h-4 fill-accent text-accent" />
              ))}
            </div>
            <p className="text-foreground/90 leading-relaxed mb-6 text-sm">"{t.quote}"</p>
            <div>
              <div className="font-semibold text-foreground">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.location} · {t.procedure}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
