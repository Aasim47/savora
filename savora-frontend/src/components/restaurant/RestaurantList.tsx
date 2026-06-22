"use client";

import { useEffect, useState } from "react";
import { RestaurantCard } from "./RestaurantCard";
import { RestaurantRail } from "./RestaurantRail";
import { Search, X } from "lucide-react";
import api from "@/lib/axios";
import { cn } from "@/utils/cn";

interface RestaurantListProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  categories: string[];
}

export function RestaurantList({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories
}: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sort State
  const [sortBy, setSortBy] = useState("Recommended"); // Recommended, Rating, Newest

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        // Fetch ALL restaurants to populate all rails
        const response = await api.get('/restaurants');
        const restaurantList = Array.isArray(response.data) ? response.data : response.data.data;

        // Compute average ratings and a popularity score on the frontend
        const withRatings = restaurantList.map((r: any) => {
          const totalReviews = r.reviews?.length || 0;
          const avgRating = totalReviews > 0
            ? r.reviews.reduce((sum: number, rev: any) => sum + rev.rating, 0) / totalReviews
            : 0;
          
          // Popularity score: combines average rating with the volume of reviews
          // A 5-star with 100 reviews scores higher than a 5-star with 1 review
          const popularityScore = avgRating * (1 + Math.log10(totalReviews + 1));
            
          return { 
            ...r, 
            averageRating: avgRating, 
            reviewCount: totalReviews,
            popularityScore 
          };
        });

        setRestaurants(withRatings);
      } catch (error) {
        console.error("Failed to load restaurants", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col space-y-16 py-10 px-4 md:px-0">
        {[1, 2, 3].map((rail) => (
          <div key={rail}>
            <div className="w-48 h-8 bg-surface animate-pulse rounded-md mb-2"></div>
            <div className="w-64 h-4 bg-surface animate-pulse rounded-md mb-6"></div>
            <div className="flex flex-col md:flex-row gap-5 overflow-hidden">
              {[1, 2, 3].map((card, idx) => (
                <div key={card} className={`flex-shrink-0 bg-surface rounded-[14px] overflow-hidden border border-divider ${idx === 0 ? "w-full md:w-[480px]" : "w-full md:w-[360px]"}`}>
                  <div className="w-full h-[180px] bg-divider/40 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="w-3/4 h-6 bg-divider/40 animate-pulse rounded"></div>
                      <div className="w-10 h-6 bg-divider/40 animate-pulse rounded"></div>
                    </div>
                    <div className="w-1/2 h-4 bg-divider/40 animate-pulse rounded"></div>
                    <div className="flex gap-2 pt-2">
                       <div className="w-16 h-6 bg-divider/40 animate-pulse rounded-full"></div>
                       <div className="w-16 h-6 bg-divider/40 animate-pulse rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center max-w-md mx-auto">
        <div className="w-32 h-32 mb-6 opacity-80">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M15 65C15 45.67 30.67 30 50 30C69.33 30 85 45.67 85 65H15Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-secondary" />
            <path d="M10 65H90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-secondary" />
            <path d="M45 30V25C45 22.2386 47.2386 20 50 20C52.7614 20 55 22.2386 55 25V30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-secondary" />
            <path d="M70 25L72 18L79 16L72 14L70 7L68 14L61 16L68 18L70 25Z" fill="currentColor" className="text-[#D9B65E]" />
          </svg>
        </div>
        <h3 className="text-[20px] font-medium text-primary mb-2">We're still setting things up.</h3>
        <p className="text-secondary text-base leading-relaxed">
          Check back soon. We're curating the best dining experiences in your area.
        </p>
      </div>
    );
  }

  // --- Filtering Logic ---
  const isFiltering = searchQuery.trim().length > 0 || selectedCategory !== "All" || sortBy !== "Recommended";

  // Derive filtered results if search/filter is active
  let filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All" ||
      (r.description || "").toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // Apply sorting to the filtered grid view
  if (sortBy === "Rating") {
    filteredRestaurants.sort((a, b) => b.averageRating - a.averageRating);
  } else if (sortBy === "Popularity") {
    filteredRestaurants.sort((a, b) => b.reviewCount - a.reviewCount);
  } else if (sortBy === "Newest") {
    filteredRestaurants.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === "Alphabetical") {
    filteredRestaurants.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "Recommended") {
    filteredRestaurants.sort((a, b) => b.popularityScore - a.popularityScore);
  }

  // --- Rail Logic (Only used when NOT filtering) ---
  const openRightNow = [...restaurants]
    .filter(r => r.isActive === true)
    .sort((a, b) => b.popularityScore - a.popularityScore);

  const popularThisWeek = [...restaurants]
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, 8);

  const newOnSavora = [...restaurants]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="w-full">
      {/* Main Content Area */}
      {isFiltering ? (
        /* Filtered Grid View */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-serif text-[24px] font-medium text-primary">
                Search Results <span className="text-secondary text-lg ml-2 font-sans font-normal">({filteredRestaurants.length})</span>
              </h2>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSortBy("Recommended");
                }}
                className="text-[13px] font-medium text-accent hover:underline cursor-pointer mt-1 block"
              >
                Clear filters
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm text-secondary font-medium">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
              >
                <option value="Recommended">Recommended</option>
                <option value="Rating">Highest Rated</option>
                <option value="Popularity">Most Popular</option>
                <option value="Newest">Newest Arrivals</option>
                <option value="Alphabetical">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {filteredRestaurants.length === 0 ? (
            <div className="py-20 text-center text-secondary">
              No restaurants match your search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={{
                    ...restaurant,
                    cuisine: restaurant.description ? restaurant.description.substring(0, 15) : "Gourmet"
                  }}
                  isFeatured={false}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Rails View */
        <div className="space-y-16 -mx-4 md:mx-0">
          <RestaurantRail
            title="Open Right Now"
            description="Ready to deliver — order now"
            restaurants={openRightNow}
            isFirstRail={true}
          />
          <RestaurantRail
            title="Popular This Week"
            description="Top-rated spots in your city"
            restaurants={popularThisWeek}
          />
          <RestaurantRail
            title="New On Bhojanwale"
            description="Fresh arrivals worth trying"
            restaurants={newOnSavora}
          />
        </div>
      )}

      {/* Ensure hide-scrollbar classes exist if not using a plugin */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
