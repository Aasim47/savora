import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-base pt-[64px] flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 md:px-8 py-16 max-w-4xl">
        <h1 className="font-serif text-4xl text-primary mb-8">Terms of Service</h1>
        <div className="prose prose-stone max-w-none text-secondary">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-medium text-primary mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">By accessing and using Bhojanwale.in, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>

          <h2 className="text-xl font-medium text-primary mt-8 mb-4">2. Use of Service</h2>
          <p className="mb-4">Bhojanwale acts as a technology platform connecting users with local restaurants. We are not responsible for the quality, safety, or legality of the food provided by restaurant partners.</p>

          <h2 className="text-xl font-medium text-primary mt-8 mb-4">3. User Accounts</h2>
          <p className="mb-4">You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>

          <h2 className="text-xl font-medium text-primary mt-8 mb-4">4. Pricing and Payments</h2>
          <p className="mb-4">All prices are determined by our restaurant partners and may include taxes. Delivery fees and other charges will be clearly displayed before you complete your order.</p>

          <h2 className="text-xl font-medium text-primary mt-8 mb-4">5. Contact Information</h2>
          <p className="mb-4">If you have any questions about these Terms, please contact us at:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Support: <a href="mailto:admin@bhojanwale.in" className="text-accent hover:underline">admin@bhojanwale.in</a></li>
            <li>General Info: <a href="mailto:info@bhojanwale.in" className="text-accent hover:underline">info@bhojanwale.in</a></li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
