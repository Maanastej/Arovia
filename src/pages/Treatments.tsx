import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Clock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const categories = ["All", "Dental", "Cosmetic", "Orthopedic", "Cardiology", "Fertility", "Health Screening"];

const Treatments = () => {
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    setLoading(true);
    let query = supabase.from("treatments").select("*");
    
    const { data, error } = await query;
    if (error) console.error("Error fetching treatments:", error);
    else setTreatments(data || []);
    setLoading(false);
  };

  const filteredTreatments = treatments.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || t.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <section className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">Explore Treatments</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find world-class medical procedures at a fraction of the cost, performed by internationally accredited specialists.
          </p>
        </section>

        <section className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search treatments..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat)}
                className="whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTreatments.map((treatment, i) => (
              <motion.div
                key={treatment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow border-border">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={treatment.image_url || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop"} 
                      alt={treatment.title}
                      className="object-cover w-full h-full transition-transform hover:scale-105 duration-500"
                    />
                    <Badge className="absolute top-4 right-4 bg-background/90 text-foreground backdrop-blur-sm border-none">
                      {treatment.category}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{treatment.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{treatment.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{treatment.duration_days} days</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{treatment.price_estimate}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-border/50">
                    <Link to={`/treatments/${treatment.id}`} className="w-full">
                      <Button className="w-full">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredTreatments.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-xl text-muted-foreground">No treatments found matching your criteria.</p>
            <Button variant="link" onClick={() => { setSearch(""); setCategory("All"); }}>
              Clear all filters
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Treatments;
