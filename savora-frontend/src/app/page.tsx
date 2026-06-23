"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { RestaurantList } from "@/components/restaurant/RestaurantList";
import { AnimatedHero } from "@/components/home/AnimatedHero";
import Link from "next/link";

const CATEGORIES = ["All", "Italian", "Indian", "Asian", "American", "Healthy", "Dessert", "Fast Food"];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [availableLocations, setAvailableLocations] = useState<string[]>(["All"]);

  return (
    <div className="min-h-screen bg-base pt-[64px]">
      <Navbar />
      
      <main>
        {/* Animated Hero Section replaces static header */}
        <AnimatedHero 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={CATEGORIES}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          availableLocations={availableLocations}
        />

        {/* 1px gold separator between Hero and content */}
        <hr className="w-full border-t border-[#D9B65E] my-12" />

        <div className="container mx-auto px-4 md:px-8 pb-20">
          <RestaurantList 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={CATEGORIES}
            selectedLocation={selectedLocation}
            onLocationsLoaded={(locs) => setAvailableLocations(["All", ...locs])}
          />
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-divider py-12 mt-12 bg-surface">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-secondary gap-4">
          <p>© {new Date().getFullYear()} Bhojanwale. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/login?role=admin" className="hover:text-primary transition-colors hover:underline">
              Restaurant Partner Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
