"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { RestaurantList } from "@/components/restaurant/RestaurantList";
import { AnimatedHero } from "@/components/home/AnimatedHero";
import { Footer } from "@/components/layout/Footer";
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

      <Footer />
    </div>
  );
}
