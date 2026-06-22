"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { MenuRow } from "@/components/menu/MenuRow";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Search, Star } from "lucide-react";
import { cn } from "@/utils/cn";

export default function RestaurantPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"menu" | "reviews">("menu");
  const [ratingData, setRatingData] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const response = await api.get(`/restaurants/${id}`);
        const restaurantData = response.data.data || response.data;
        setRestaurant(restaurantData);
      } catch (error) {
        console.error("Failed to fetch restaurant details", error);
      } finally {
        setLoading(false);
      }
    }
    async function fetchReviews() {
      try {
        const [avgRes, reviewsRes] = await Promise.all([
          api.get(`/reviews/restaurant/${id}/average`),
          api.get(`/reviews/restaurant/${id}`),
        ]);
        setRatingData(avgRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        // Reviews may not exist yet
      }
    }
    if (id) {
      fetchDetails();
      fetchReviews();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base pt-[64px]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-base pt-[64px]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <h2 className="text-2xl font-serif text-primary">Restaurant not found</h2>
        </div>
      </div>
    );
  }

  const image = restaurant.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop";
  const cuisine = restaurant.description ? restaurant.description.substring(0, 15) : "Gourmet";

  // Filter menu items by search query
  const filterItems = (items: any[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item: any) =>
      item.name.toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q)
    );
  };

  // Get categories to display (filter by active category + search)
  const categoriesToShow = restaurant.categories?.filter((cat: any) => {
    if (activeCategory && cat.id !== activeCategory) return false;
    const catItems = restaurant.menuItems?.filter((item: any) => item.categoryId === cat.id) || [];
    const filtered = filterItems(catItems);
    return filtered.length > 0;
  }) || [];

  return (
    <div className="min-h-screen bg-base pt-[64px]">
      <Navbar />
      
      {/* Hero Image Section */}
      <div className="relative w-full h-[40vh] md:h-[50vh] bg-surface">
        <img 
          src={image} 
          alt={restaurant.name} 
          className="w-full h-full object-cover"
        />
      </div>

      <main className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
        {/* Restaurant Header */}
        <div className="mb-12 border-b border-divider pb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-block px-3 py-1 bg-surface text-secondary text-xs uppercase tracking-widest font-medium rounded-[4px] border border-divider">
              {cuisine}
            </div>
            {ratingData.count > 0 && (
              <div className="inline-flex items-center gap-2 mt-0.5">
                <Star className="w-5 h-5 text-[#D9B65E] fill-[#D9B65E]" />
                <span className="font-serif text-2xl text-primary leading-none">{ratingData.average}</span>
                <span className="text-sm text-secondary">({ratingData.count} {ratingData.count === 1 ? "review" : "reviews"})</span>
              </div>
            )}
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6 leading-tight tracking-tight">
            {restaurant.name}
          </h1>
          <p className="text-lg text-secondary leading-relaxed max-w-2xl mb-8">
            {restaurant.description}
          </p>

          {/* Tabs */}
          <div className="flex border-b border-divider">
            <button
              onClick={() => setActiveTab("menu")}
              className={cn(
                "pb-3 px-1 mr-8 text-sm font-medium transition-colors relative cursor-pointer",
                activeTab === "menu" ? "text-primary" : "text-secondary hover:text-primary"
              )}
            >
              Menu
              {activeTab === "menu" && (
                <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-accent" />
              )}
            </button>
            {reviews.length > 0 && (
              <button
                onClick={() => setActiveTab("reviews")}
                className={cn(
                  "pb-3 px-1 text-sm font-medium transition-colors relative cursor-pointer",
                  activeTab === "reviews" ? "text-primary" : "text-secondary hover:text-primary"
                )}
              >
                Reviews ({reviews.length})
                {activeTab === "reviews" && (
                  <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-accent" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Tab Content: Menu */}
        {activeTab === "menu" && (
          <>
            {/* Search & Category Filters */}
            <div className="mb-10 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-secondary/60" />
            </div>
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-divider rounded-lg pl-11 pr-4 py-3 text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-secondary/50"
            />
          </div>

          {restaurant.categories && restaurant.categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer",
                  !activeCategory
                    ? "bg-accent text-[#FBF7F0] border-transparent"
                    : "bg-transparent text-secondary border-[#E5DACB] hover:text-primary hover:border-accent"
                )}
              >
                All
              </button>
              {restaurant.categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer",
                    activeCategory === cat.id
                      ? "bg-accent text-[#FBF7F0] border-transparent"
                      : "bg-transparent text-secondary border-[#E5DACB] hover:text-primary hover:border-accent"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Menu Sections */}
        <div className="space-y-16">
          {categoriesToShow.map((category: any) => (
            <section key={category.id}>
              <h2 className="text-sm font-medium uppercase tracking-widest text-primary mb-6">
                {category.name}
              </h2>
              <div className="flex flex-col">
                {(() => {
                  const catItems = restaurant.menuItems?.filter((item: any) => item.categoryId === category.id) || [];
                  const filtered = filterItems(catItems);
                  
                  const grouped = new Map<string, any[]>();
                  filtered.forEach((item: any) => {
                    const key = item.name.trim().toLowerCase();
                    if (!grouped.has(key)) grouped.set(key, []);
                    grouped.get(key)!.push(item);
                  });
                  
                  return Array.from(grouped.values()).map((group: any[], idx) => (
                    <MenuRow key={`${group[0].name}-${idx}`} items={group} restaurantId={restaurant.id} />
                  ));
                })()}
              </div>
            </section>
          ))}
          {categoriesToShow.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <p className="text-secondary text-base">No dishes match "<span className="text-primary font-medium">{searchQuery}</span>"</p>
            </div>
          )}
          {(!restaurant.categories || restaurant.categories.length === 0) && (
             <p className="text-secondary text-base">This restaurant hasn't added a menu yet.</p>
          )}
        </div>
          </>
        )}

        {/* Tab Content: Reviews */}
        {activeTab === "reviews" && reviews.length > 0 && (
          <div className="pt-4">
            <div className="space-y-6">
              {reviews.map((review: any) => (
                <div key={review.id} className="bg-surface border border-divider rounded-[14px] p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                        {(review.user?.name || "U")[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-primary">{review.user?.name || "Customer"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "w-3.5 h-3.5",
                            star <= review.rating ? "text-[#D9B65E] fill-[#D9B65E]" : "text-secondary/30"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-secondary leading-relaxed ml-10">{review.comment}</p>
                  )}
                  <p className="text-[10px] text-secondary/60 ml-10 mt-2">
                    {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
