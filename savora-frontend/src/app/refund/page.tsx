import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-base pt-[64px] flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 md:px-8 py-16 max-w-4xl">
        <h1 className="font-serif text-4xl text-primary mb-8">Refund & Cancellation Policy</h1>
        <div className="prose prose-stone max-w-none text-secondary">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-medium text-primary mt-8 mb-4">1. Order Cancellations</h2>
          <p className="mb-4">You can cancel your order at no cost as long as the restaurant partner has not yet accepted or started preparing it. Once the restaurant has accepted the order, cancellations may be subject to a cancellation fee up to 100% of the order value.</p>

          <h2 className="text-xl font-medium text-primary mt-8 mb-4">2. Refunds for Missing or Incorrect Items</h2>
          <p className="mb-4">If you receive an order with missing items, entirely incorrect items, or items that are spoiled, please contact our support team within 24 hours of delivery. We will investigate the issue with the restaurant partner and issue a partial or full refund to your original payment method as appropriate.</p>

          <h2 className="text-xl font-medium text-primary mt-8 mb-4">3. Delivery Delays</h2>
          <p className="mb-4">While we strive for timely deliveries, factors like traffic, weather, or restaurant delays can affect delivery times. Refunds for delayed deliveries are assessed on a case-by-case basis. If your order is significantly delayed beyond the estimated time, please reach out to support.</p>

          <h2 className="text-xl font-medium text-primary mt-8 mb-4">4. Refund Processing Time</h2>
          <p className="mb-4">Approved refunds are typically processed within 3-5 business days, depending on your bank or payment provider.</p>

          <h2 className="text-xl font-medium text-primary mt-8 mb-4">5. Contact Us for Support</h2>
          <p className="mb-4">For any issues related to cancellations or refunds, please contact us immediately:</p>
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
