import { Heart } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground/70 py-16">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-10 mb-12">
        <div>
          <span className="font-display text-2xl font-bold text-primary-foreground">Arovia</span>
          <p className="text-sm mt-3 leading-relaxed">
            Your trusted partner for medical tourism from the US to India. World-class care, end-to-end support.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-primary-foreground mb-4 text-sm uppercase tracking-wider">Treatments</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Cardiac Surgery</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Orthopedics</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Dental Care</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Fertility (IVF)</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-primary-foreground mb-4 text-sm uppercase tracking-wider">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-primary-foreground transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Partner Hospitals</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Patient Stories</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-primary-foreground mb-4 text-sm uppercase tracking-wider">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-primary-foreground transition-colors">FAQs</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-primary-foreground transition-colors">Emergency: 1-800-AROVIA</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 pt-8 text-center text-xs text-primary-foreground/50">
        © 2026 Arovia. All rights reserved. Made with <Heart className="w-3 h-3 inline text-accent" /> for patients worldwide.
      </div>
    </div>
  </footer>
);

export default Footer;
