import { cn } from "@/utils/cn";
import Link from "next/link";

interface RestaurantProps {
  restaurant: {
    id: string;
    name: string;
    cuisine: string;
    imageUrl: string;
    isActive?: boolean;
  };
  isFeatured?: boolean;
}

export function RestaurantCard({ restaurant, isFeatured }: RestaurantProps) {
  // If imageUrl is empty, provide a fallback
  const image = restaurant.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop";
  const isOpen = restaurant.isActive !== false; // Default to open if not explicitly false

  return (
    <Link 
      href={`/restaurant/${restaurant.id}`}
      className={cn(
        "group relative overflow-hidden bg-surface cursor-pointer rounded-[14px] block",
        isFeatured ? "md:col-span-2 aspect-[16/9] md:aspect-[21/9]" : "col-span-1 aspect-[4/3]"
      )}
    >
      <img 
        src={image} 
        alt={restaurant.name}
        className="w-full h-full object-cover transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-90" />
      <div className="absolute top-4 left-4 flex gap-2">
        {restaurant.cuisine && (
          <span className="bg-black/40 backdrop-blur-sm text-white/90 text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-[4px] border border-white/10">
            {restaurant.cuisine}
          </span>
        )}
        {isOpen ? (
          <span className="bg-[#2F4F3E] text-[#F5EFE6] text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-[4px] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse opacity-80" />
            Open Now
          </span>
        ) : (
          <span className="bg-[#E5DACB] text-[#7A7468] text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-[4px]">
            Closed
          </span>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
        {isFeatured && (
          <div className="w-[60px] h-[2px] bg-[#D9B65E] mb-3 opacity-90" />
        )}
        <h2 className={cn(
          "font-serif text-white leading-tight",
          isFeatured ? "text-3xl md:text-4xl" : "text-2xl"
        )}>
          {restaurant.name}
        </h2>
      </div>
    </Link>
  );
}
