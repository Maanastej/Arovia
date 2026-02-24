import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const procedures = [
  { name: "Heart Bypass Surgery", usPrice: 123000, indiaPrice: 12000 },
  { name: "Hip Replacement", usPrice: 40000, indiaPrice: 7000 },
  { name: "Knee Replacement", usPrice: 35000, indiaPrice: 6500 },
  { name: "Dental Implants (Full)", usPrice: 28000, indiaPrice: 5000 },
  { name: "IVF Treatment", usPrice: 20000, indiaPrice: 5500 },
  { name: "Rhinoplasty", usPrice: 12000, indiaPrice: 3000 },
  { name: "LASIK (Both Eyes)", usPrice: 5000, indiaPrice: 1000 },
  { name: "Spinal Fusion", usPrice: 110000, indiaPrice: 10000 },
];

const SavingsCalculator = () => {
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const proc = procedures[selected];
  const savings = proc.usPrice - proc.indiaPrice;
  const pct = Math.round((savings / proc.usPrice) * 100);

  return (
    <section id="savings" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Cost Comparison</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3">
            See How Much You Can Save
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Compare US hospital costs with India's top accredited hospitals. Prices include treatment, hospital stay, and Arovia's full-service package.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Procedure selector */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {procedures.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setSelected(i)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selected === i
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Comparison card */}
          <motion.div
            key={selected}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-2xl shadow-card border border-border overflow-hidden"
          >
            <div className="grid md:grid-cols-3">
              {/* US Price */}
              <div className="p-8 text-center border-b md:border-b-0 md:border-r border-border">
                <span className="text-sm font-medium text-muted-foreground">🇺🇸 United States</span>
                <div className="text-4xl font-display font-bold text-foreground mt-3">
                  ${proc.usPrice.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Average cost</p>
              </div>

              {/* India Price */}
              <div className="p-8 text-center border-b md:border-b-0 md:border-r border-border bg-primary/5">
                <span className="text-sm font-medium text-primary">🇮🇳 India (via Arovia)</span>
                <div className="text-4xl font-display font-bold text-primary mt-3">
                  ${proc.indiaPrice.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-2">All-inclusive package</p>
              </div>

              {/* Savings */}
              <div className="p-8 text-center bg-savings-gradient text-primary-foreground">
                <span className="text-sm font-medium text-primary-foreground/80">Your Savings</span>
                <div className="text-4xl font-display font-bold mt-3">
                  ${savings.toLocaleString()}
                </div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm font-semibold">{pct}% less</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="text-center mt-8">
            <Button size="lg" className="gap-2" onClick={() => navigate('/auth')}>
              Get Your Personalized Quote <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SavingsCalculator;
