import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-base pt-[64px] flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 md:px-8 py-16 max-w-4xl">
        <h1 className="font-serif text-4xl text-primary mb-8">Privacy Policy</h1>
        <div className="prose prose-stone max-w-none text-secondary">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-medium text-primary mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">We collect information you provide directly to us, such as your name, email address, phone number, and delivery address when you create an account or place an order. We also collect transaction data regarding your food orders.</p>

          <h2 className="text-xl font-medium text-primary mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Process and deliver your food orders.</li>
            <li>Send you order updates and notifications.</li>
            <li>Respond to your comments, questions, and customer service requests.</li>
            <li>Communicate with you about products, services, offers, and promotions.</li>
          </ul>

          <h2 className="text-xl font-medium text-primary mt-8 mb-4">3. Sharing of Information</h2>
          <p className="mb-4">We share your delivery details (name, phone number, and address) with the restaurant partners and delivery personnel to ensure your food is delivered successfully. We do not sell your personal information to third parties.</p>

          <h2 className="text-xl font-medium text-primary mt-8 mb-4">4. Security</h2>
          <p className="mb-4">We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.</p>

          <h2 className="text-xl font-medium text-primary mt-8 mb-4">5. Contact Us</h2>
          <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at:</p>
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
