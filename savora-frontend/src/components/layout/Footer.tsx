import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-divider pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & Contact */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="font-serif text-2xl text-primary mb-4">Bhojanwale</h2>
            <p className="text-secondary text-sm leading-relaxed mb-6">
              Curating the finest culinary experiences and delivering them straight to your door.
            </p>
            <div className="space-y-3">
              <a href="mailto:support@bhojanwale.in" className="flex items-center gap-3 text-sm text-secondary hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                admin@bhojanwale.in
              </a>
              <a href="mailto:info@bhojanwale.in" className="flex items-center gap-3 text-sm text-secondary hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                info@bhojanwale.in
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-primary mb-4 text-sm tracking-wider uppercase">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-secondary hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-secondary hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/login?role=admin" className="text-sm text-secondary hover:text-primary transition-colors">Restaurant Partner Login</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-primary mb-4 text-sm tracking-wider uppercase">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/terms" className="text-sm text-secondary hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-secondary hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund" className="text-sm text-secondary hover:text-primary transition-colors">Refund & Cancellation Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter / Social */}
          <div>
            <h3 className="font-semibold text-primary mb-4 text-sm tracking-wider uppercase">Stay Updated</h3>
            <p className="text-sm text-secondary mb-4">Subscribe to our newsletter for the latest updates and exclusive offers.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-base border border-divider rounded-lg px-4 py-2 text-sm outline-none focus:border-accent transition-colors"
              />
              <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        <div className="border-t border-divider pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-secondary">
            © {new Date().getFullYear()} Bhojanwale. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {/* Social Icons could go here */}
            <span className="text-xs text-secondary/60">Made with ❤️ in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
