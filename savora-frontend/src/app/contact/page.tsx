import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-base pt-[64px] flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 md:px-8 py-16 max-w-4xl">
        <h1 className="font-serif text-4xl text-primary mb-8">Contact Us</h1>
        <p className="text-secondary text-lg mb-12">
          We're here to help! Whether you have a question about an order, want to partner with us, or just want to share your feedback, we'd love to hear from you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-surface p-6 rounded-[14px] border border-divider">
              <h3 className="font-medium text-primary text-lg mb-2">Customer Support</h3>
              <p className="text-secondary mb-4 text-sm">For help with your orders, refunds, or technical issues.</p>
              <a href="mailto:admin@bhojanwale.in" className="flex items-center gap-3 text-accent hover:underline font-medium">
                <Mail className="w-5 h-5" />
                admin@bhojanwale.in
              </a>
            </div>

            <div className="bg-surface p-6 rounded-[14px] border border-divider">
              <h3 className="font-medium text-primary text-lg mb-2">General Inquiries</h3>
              <p className="text-secondary mb-4 text-sm">For business partnerships, press inquiries, and other general questions.</p>
              <a href="mailto:info@bhojanwale.in" className="flex items-center gap-3 text-accent hover:underline font-medium">
                <Mail className="w-5 h-5" />
                info@bhojanwale.in
              </a>
            </div>
          </div>

          {/* Contact Form (UI only for now) */}
          <div className="bg-surface p-6 md:p-8 rounded-[14px] border border-divider">
            <h3 className="font-medium text-primary text-xl mb-6">Send us a message</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Name</label>
                <input 
                  type="text" 
                  className="w-full bg-base border border-divider rounded-lg px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-base border border-divider rounded-lg px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
                  placeholder="Your email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Message</label>
                <textarea 
                  rows={4}
                  className="w-full bg-base border border-divider rounded-lg px-4 py-3 text-sm outline-none focus:border-accent transition-colors resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button 
                type="button"
                className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors mt-2"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
