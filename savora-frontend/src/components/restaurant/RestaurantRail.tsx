"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RestaurantCard } from "./RestaurantCard";

interface RestaurantRailProps {
  title: string;
  description: string;
  restaurants: any[];
  isFirstRail?: boolean;
}

export function RestaurantRail({ title, description, restaurants, isFirstRail = false }: RestaurantRailProps) {
  const scrollContainerRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      // Allow a 1px tolerance for rounding issues
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [restaurants]);

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // Scroll by roughly 2 normal cards (360 * 2 + gaps)
      const scrollAmount = 740;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!restaurants || restaurants.length === 0) return null;

  return (
    <section className="mb-10 md:mb-16 relative">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 px-4 md:px-0">
        <div>
          <h2 className="font-serif text-[28px] font-medium text-primary leading-tight">
            {title}
          </h2>
          <p className="text-[14px] text-secondary mt-1">
            {description}
          </p>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scrollByAmount('left')}
            disabled={!canScrollLeft}
            className="w-9 h-9 rounded-full border border-[#E5DACB] flex items-center justify-center text-primary hover:text-accent hover:border-accent disabled:opacity-30 disabled:hover:text-primary disabled:hover:border-[#E5DACB] transition-colors cursor-pointer outline-none"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollByAmount('right')}
            disabled={!canScrollRight}
            className="w-9 h-9 rounded-full border border-[#E5DACB] flex items-center justify-center text-primary hover:text-accent hover:border-accent disabled:opacity-30 disabled:hover:text-primary disabled:hover:border-[#E5DACB] transition-colors cursor-pointer outline-none"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Rail Container Wrapper (for the fade mask) */}
      <div className="relative group">
        {/* The scrolling container */}
        <ul
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex flex-col md:flex-row md:overflow-x-auto md:snap-x md:snap-mandatory gap-8 md:gap-5 pb-4 px-4 md:px-0 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {restaurants.map((restaurant, index) => {
            const isFeaturedCard = isFirstRail && index === 0;
            return (
              <li
                key={restaurant.id}
                className={`md:snap-start flex-shrink-0 ${
                  isFeaturedCard
                    ? "w-full md:w-[480px]"
                    : "w-full md:w-[320px] lg:w-[360px]"
                } ${
                  // Add a small spacer to the very last item so it doesn't flush with the right edge on desktop
                  index === restaurants.length - 1 ? "md:pr-0" : ""
                }`}
              >
                <div className="w-full">
                  <RestaurantCard
                    restaurant={restaurant}
                    isFeatured={isFeaturedCard}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        {/* Right edge fade mask */}
        {canScrollRight && (
          <div className="absolute top-0 right-0 bottom-4 w-[8%] bg-gradient-to-l from-[var(--base)] to-transparent pointer-events-none hidden md:block" />
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </section>
  );
}
