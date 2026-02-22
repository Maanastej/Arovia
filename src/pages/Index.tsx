import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import TreatmentCategories from "@/components/TreatmentCategories";
import SavingsCalculator from "@/components/SavingsCalculator";
import TrustSection from "@/components/TrustSection";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <HowItWorks />
    <TreatmentCategories />
    <SavingsCalculator />
    <TrustSection />
    <Testimonials />
    <CTASection />
    <Footer />
  </div>
);

export default Index;
