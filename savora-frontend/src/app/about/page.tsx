import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-base pt-[64px] flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 md:px-8 py-16 max-w-4xl">
        <h1 className="font-serif text-4xl text-primary mb-8">About Bhojanwale</h1>
        <div className="prose prose-stone max-w-none text-secondary">
          <p className="mb-4 text-lg">
            Bhojanwale is more than just a food delivery platform. We are a bridge between culinary excellence and your dining table.
          </p>

          <h2 className="text-xl font-medium text-primary mt-8 mb-4">Our Mission</h2>
          <p className="mb-4">
            Our mission is simple: to curate the finest dining experiences in the city and make them accessible to everyone, directly at their doorstep. We partner exclusively with premium restaurants, passionate chefs, and local culinary artisans who share our dedication to quality.
          </p>

          <h2 className="text-xl font-medium text-primary mt-8 mb-4">The Bhojanwale Standard</h2>
          <p className="mb-4">
            We believe that food delivery shouldn't mean compromising on quality. That's why every restaurant on our platform is carefully vetted to ensure they meet our rigorous standards for taste, hygiene, and presentation. When you order from Bhojanwale, you are guaranteed a premium experience from kitchen to door.
          </p>

          <h2 className="text-xl font-medium text-primary mt-8 mb-4">Supporting Local Businesses</h2>
          <p className="mb-4">
            By choosing Bhojanwale, you are supporting a network of local businesses and dedicated delivery personnel. We provide our restaurant partners with the tools they need to thrive in the digital age, while ensuring fair compensation for everyone involved in bringing your meal to you.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
