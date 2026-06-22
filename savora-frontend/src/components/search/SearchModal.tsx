"use client";

import { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import Link from "next/link";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      fetchRestaurants();
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const res = await api.get('/restaurants');
      const restaurantData = res.data.data || res.data;
      setRestaurants(restaurantData);
    } catch (error) {
      console.error("Failed to fetch search results", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = query.trim() === ""
    ? []
    : restaurants.filter(r => r.name.toLowerCase().includes(query.toLowerCase()) || r.description?.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-4 md:top-24 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] bg-surface rounded-[14px] shadow-2xl z-[70] overflow-hidden border border-divider"
          >
            {/* Search Input */}
            <div className="flex items-center px-4 py-4 border-b border-divider">
              <SearchIcon className="w-5 h-5 text-secondary mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants, cuisines..."
                className="flex-1 bg-transparent border-none outline-none text-primary placeholder-secondary text-lg"
              />
              <button onClick={onClose} className="p-1 text-secondary hover:text-primary transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {query.trim() === "" ? (
                <div className="px-6 py-12 text-center text-secondary flex flex-col items-center">
                  <SearchIcon className="w-8 h-8 mb-3 opacity-20" />
                  <p>Type to start searching...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-6 py-12 text-center text-secondary">
                  <p>No restaurants found for "{query}"</p>
                </div>
              ) : (
                <div className="p-2">
                  <h3 className="px-4 py-2 text-[10px] font-semibold text-secondary uppercase tracking-widest mb-1">Restaurants</h3>
                  {filtered.map(restaurant => (
                    <Link
                      key={restaurant.id}
                      href={`/restaurant/${restaurant.id}`}
                      onClick={onClose}
                      className="group flex items-center justify-between p-4 rounded-lg hover:bg-base transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[10px] bg-base overflow-hidden flex-shrink-0 border border-divider">
                          {restaurant.imageUrl ? (
                            <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-divider"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-primary mb-0.5">{restaurant.name}</h4>
                          <p className="text-xs text-secondary line-clamp-1">{restaurant.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-secondary group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
