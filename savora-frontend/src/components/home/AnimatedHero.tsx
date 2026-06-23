"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Search, X } from "lucide-react";
import { cn } from "@/utils/cn";

interface AnimatedHeroProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  categories: string[];
  selectedLocation: string;
  setSelectedLocation: (val: string) => void;
  availableLocations: string[];
}

export function AnimatedHero({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  selectedLocation,
  setSelectedLocation,
  availableLocations
}: AnimatedHeroProps) {
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 1000], [0, -250]);
  const imageScale = useTransform(scrollY, [0, 1000], [1, 1.1]);

  // Left column scroll fade out
  const textY = useTransform(scrollY, [0, 600], [0, -120]);
  const textOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
    }
  };

  const lineVariants = {
    hidden: { y: "100%" },
    visible: {
      y: "0%",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
    }
  };

  return (
    <section className="w-full relative overflow-hidden bg-base">

      {/* MOBILE IMAGE HEADER */}
      <div className="sm:hidden relative w-full h-[220px]">
        <img
          src="https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&q=80&w=800"
          alt="Premium Biryani"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Mobile Headline Overlaid */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="overflow-hidden pb-1">
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.08 }}
              className="font-serif text-4xl font-normal tracking-tight leading-[1.1]"
            >
              Curated tastes,
            </motion.h1>
          </div>
          <div className="overflow-hidden pt-1">
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.16 }}
              className="font-serif text-4xl font-normal tracking-tight leading-[1.1] italic text-white/90"
            >
              delivered to you.
            </motion.h1>
          </div>
        </div>
      </div>

      {/* OPTIMIZED ABSTRACT AURAS (No expensive blur filters or continuous movement) */}
      <div
        className="absolute top-[-20%] right-[10%] w-[600px] h-[600px] pointer-events-none hidden md:block opacity-60"
        style={{ background: 'radial-gradient(circle, rgba(201, 98, 42, 0.15) 0%, transparent 60%)' }}
      />
      <div
        className="absolute bottom-[-20%] left-[5%] w-[700px] h-[700px] pointer-events-none hidden md:block opacity-50"
        style={{ background: 'radial-gradient(circle, rgba(217, 182, 94, 0.15) 0%, transparent 60%)' }}
      />

      <div className="container mx-auto px-4 md:px-8 py-6 sm:py-16 md:py-24 flex flex-col md:flex-row items-center md:items-start relative z-10">

        {/* LEFT COLUMN */}
        <motion.div
          className="w-full md:w-[55%] z-10 flex flex-col justify-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ y: textY, opacity: textOpacity }}
        >
          {/* Eyebrow Label - Desktop only */}
          <motion.div variants={itemVariants} className="hidden sm:flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[12px] uppercase tracking-[0.1em] text-[#2F4F3E] font-medium">
              Now delivering in your city
            </span>
          </motion.div>

          {/* Desktop Headline */}
          <div className="hidden sm:block mb-6">
            <div className="overflow-hidden pb-1">
              <motion.h1 variants={lineVariants} className="font-serif text-5xl md:text-6xl font-normal tracking-tight leading-[1.1] text-primary">
                Curated tastes,
              </motion.h1>
            </div>
            <div className="overflow-hidden pt-1">
              <motion.h1 variants={lineVariants} className="font-serif text-5xl md:text-6xl font-normal tracking-tight leading-[1.1] text-secondary italic">
                delivered to you.
              </motion.h1>
            </div>
          </div>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-[16px] sm:text-[18px] leading-[1.6] text-secondary max-w-[480px] mb-10 font-light">
            Discover extraordinary culinary experiences. We curate the finest kitchens in the city, delivering their masterpieces directly to your table.
          </motion.p>

          {/* Search Bar (Glassmorphism) */}
          <motion.div variants={itemVariants} className="w-full max-w-[500px] mb-10 relative z-20">
            <div className="relative group transition-all duration-300 rounded-full">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                <Search className="h-5 w-5 text-primary/60 group-focus-within:text-accent transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[60px] bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:bg-white/60 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-full pl-14 pr-12 text-[16px] text-primary outline-none focus:bg-white/80 focus:border-white/80 focus:ring-[4px] focus:ring-accent/10 transition-all placeholder:text-primary/40 font-light"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-primary/40 hover:text-primary transition-colors cursor-pointer z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Filters Area */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4 pb-2 w-screen sm:w-full -mx-4 px-4 sm:mx-0 sm:px-0">
            
            {/* Location Chips */}
            {availableLocations.length > 1 && (
              <div className="flex items-center gap-3 w-full">
                <span className="text-[11px] font-semibold text-secondary uppercase tracking-widest hidden sm:block whitespace-nowrap">Location</span>
                <div className="flex overflow-x-auto gap-2.5 pb-2 scrollbar-hide w-full">
                  {availableLocations.map((loc, idx) => (
                    <button
                      key={loc}
                      onClick={() => setSelectedLocation(loc)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all outline-none cursor-pointer flex-shrink-0 backdrop-blur-md border",
                        selectedLocation === loc
                          ? "bg-primary text-white border-primary shadow-lg"
                          : "bg-white/40 border-white/60 text-secondary hover:bg-white/60 hover:text-primary shadow-sm"
                      )}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Chips */}
            <div className="flex items-center gap-3 w-full">
              <span className="text-[11px] font-semibold text-secondary uppercase tracking-widest hidden sm:block whitespace-nowrap">Cuisine</span>
              <div className="flex overflow-x-auto gap-2.5 pb-2 scrollbar-hide w-full">
                {categories.map((cat, idx) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all outline-none cursor-pointer flex-shrink-0 backdrop-blur-md border",
                      selectedCategory === cat
                        ? "bg-accent/90 text-white border-accent/20 shadow-lg"
                        : "bg-white/30 border-white/50 text-secondary hover:bg-white/50 hover:text-primary shadow-sm"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

          </motion.div>

        </motion.div>

        {/* RIGHT COLUMN - SINGLE ELEGANT IMAGE (Desktop Only) */}
        <motion.div
          className="hidden md:flex w-[45%] h-full min-h-[500px] relative pointer-events-none justify-end items-center pr-8"
        >
          <motion.div
            style={{ y: yParallax, scale: imageScale }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="relative w-full max-w-[420px] aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="w-full h-full"
            >
              <img
                src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=800"
                alt="Exquisite Biryani"
                className="w-full h-full object-cover scale-105"
              />
            </motion.div>
            {/* Elegant inner shadow/overlay */}
            <div className="absolute inset-0 rounded-[2rem] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] pointer-events-none" />
          </motion.div>
        </motion.div>

      </div>

      {/* Ensure hide-scrollbar classes exist */}
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
    </section>
  );
}
