"use client";

import { Search, Moon, Sun, ShoppingBag, Menu, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { StickyCartBar } from "@/components/cart/StickyCartBar";
import { SearchModal } from "@/components/search/SearchModal";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  const { cartItems } = useCart();
  const { isAuthenticated, logout, openAuthModal } = useAuth();
  const router = useRouter();
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Check dark mode preference
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push("/");
  };

  const handleProtectedNavigation = (path: string, title: string) => {
    setProfileOpen(false);
    if (isAuthenticated) {
      router.push(path);
    } else {
      openAuthModal(() => router.push(path), title);
    }
  };

  const handleProfileClick = () => {
    setProfileOpen(!profileOpen);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[64px] flex items-center transition-colors duration-200 border-b border-divider dark:border-[#E0824A]/15 ${
          scrolled ? "bg-base/80 backdrop-blur-md" : "bg-base"
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center h-full">
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Bhojanwale Logo" className="h-12 w-auto object-contain" />
              <div className="hidden md:flex flex-col">
                <span className="font-serif text-xl tracking-tight text-primary leading-none mt-1">Bhojanwale.in</span>
                <span className="text-[10px] text-accent font-medium tracking-wide">GHAR JAISA SWAAD</span>
              </div>
            </Link>
          </div>

          {/* Right: Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => setSearchOpen(true)} className="text-secondary hover:text-primary transition-colors cursor-pointer">
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>
            
            <button onClick={toggleDarkMode} className="text-secondary hover:text-primary transition-colors cursor-pointer">
              {isDark ? <Sun className="w-5 h-5 stroke-[1.5]" /> : <Moon className="w-5 h-5 stroke-[1.5]" />}
            </button>

            <button 
              onClick={() => setCartOpen(true)}
              className="relative text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Avatar Dropdown */}
            <div className="relative">
              <div 
                onClick={handleProfileClick}
                className="w-8 h-8 rounded-full bg-surface border border-divider overflow-hidden ml-2 cursor-pointer flex justify-center items-center text-secondary hover:text-primary transition-colors"
              >
                <User className="w-5 h-5 stroke-[1.5]" />
              </div>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-surface border border-divider rounded-[14px] shadow-lg py-2 z-50">
                  {isAuthenticated ? (
                    <>
                      <button onClick={() => handleProtectedNavigation('/profile', 'Sign in to view your profile')} className="w-full flex items-center gap-2 px-4 py-3 border-b border-divider mb-1 text-sm font-medium text-primary hover:bg-base transition-colors cursor-pointer">
                        <User className="w-4 h-4" />
                        My Account
                      </button>
                      <button onClick={() => handleProtectedNavigation('/orders', 'Sign in to view your orders')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-base transition-colors cursor-pointer">
                        <ShoppingBag className="w-4 h-4" />
                        My Orders
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-base transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => { setProfileOpen(false); openAuthModal(undefined, "Sign in to your account"); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-base transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      Sign in / Register
                    </button>
                  )}
                  <div className="my-1 border-t border-divider"></div>
                  <Link 
                    href="/login?role=admin"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-base transition-colors cursor-pointer"
                  >
                    Restaurant Partner
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right: Mobile Actions */}
          <div className="md:hidden flex items-center gap-5">
            <button onClick={() => setSearchOpen(true)} className="text-secondary hover:text-primary transition-colors cursor-pointer">
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>
            <button onClick={toggleDarkMode} className="text-secondary hover:text-primary transition-colors cursor-pointer">
              {isDark ? <Sun className="w-5 h-5 stroke-[1.5]" /> : <Moon className="w-5 h-5 stroke-[1.5]" />}
            </button>
            <button 
              onClick={() => setCartOpen(true)}
              className="relative text-secondary hover:text-primary cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button className="text-primary cursor-pointer" onClick={() => setProfileOpen(!profileOpen)}>
              <Menu className="w-6 h-6 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {profileOpen && (
        <div className="md:hidden fixed top-[64px] left-0 right-0 bg-surface border-b border-divider shadow-lg z-40 flex flex-col">
          {isAuthenticated ? (
            <>
              <button 
                onClick={() => handleProtectedNavigation('/profile', 'Sign in to view your profile')}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 border-b border-divider text-sm text-primary hover:bg-base transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                My Account
              </button>
              <button 
                onClick={() => handleProtectedNavigation('/orders', 'Sign in to view your orders')}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 border-b border-divider text-sm text-primary hover:bg-base transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                My Orders
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 text-sm text-error hover:bg-base transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </>
          ) : (
            <button 
              onClick={() => { setProfileOpen(false); openAuthModal(undefined, "Sign in to your account"); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 text-sm text-primary hover:bg-base transition-colors cursor-pointer"
            >
              <User className="w-4 h-4" />
              Sign in / Create Account
            </button>
          )}
          
          <div className="border-t border-divider my-1"></div>
          <Link 
            href="/login?role=admin"
            onClick={() => setProfileOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 text-sm text-secondary hover:text-primary hover:bg-base transition-colors cursor-pointer"
          >
            Restaurant Partner Login
          </Link>
        </div>
      )}

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <StickyCartBar isCartOpen={cartOpen} onOpenCart={() => setCartOpen(true)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
