"use client";

import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, CheckCircle, Tag, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/utils/currency";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [address, setAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ code: string; discount: number; promoId: string } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);
  
  const { cartItems, subtotal, clearCart } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();
  const discount = promoApplied?.discount || 0;
  const total = Math.max(0, subtotal - discount);
  const router = useRouter();

  // Protect route
  useEffect(() => {
    // If not authenticated, redirect home and open modal to login and return
    if (typeof window !== "undefined" && !localStorage.getItem("savora-customer-token")) {
      router.replace("/");
      // Small timeout to allow the layout to mount if needed
      setTimeout(() => {
        openAuthModal(() => router.push("/checkout"), "Almost there — sign in to complete your order");
      }, 100);
    }
  }, [router, openAuthModal]);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError("");
    setValidatingPromo(true);
    try {
      const res = await api.post("/promos/validate", {
        code: promoInput.trim(),
        orderAmount: subtotal,
        restaurantId: cartItems.length > 0 ? cartItems[0].menuItem?.restaurantId : undefined,
      });
      setPromoApplied({
        code: res.data.code,
        discount: res.data.discount,
        promoId: res.data.promoId,
      });
    } catch (error: any) {
      setPromoError(error.response?.data?.message || "Invalid promo code");
      setPromoApplied(null);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(null);
    setPromoInput("");
    setPromoError("");
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);

    try {
      // Ensure any local 'temp' cart items are synced to the backend before placing the order
      for (const item of cartItems) {
        if (item.cartId === 'temp') {
          await api.post('/cart/add', { menuItemId: item.menuItemId, quantity: item.quantity });
        }
      }
    } catch (syncError) {
      console.error("Failed to sync cart items before checkout", syncError);
    }

    try {
      await api.post('/orders', {
        deliveryAddress: address || "123 Default Street",
        customerName: customerName || undefined,
        customerPhone: phone || undefined,
        promoCode: promoApplied?.code || undefined,
      });
      clearCart();
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/orders");
      }, 2000);
    } catch (error: any) {
      console.error("Failed to place order", error);
      if (error.response?.data?.message === "Validation failed" && error.response.data.errors) {
        const errorMessages = Object.entries(error.response.data.errors)
          .map(([key, val]: any) => `${key}: ${val.join(', ')}`)
          .join('\n');
        alert("Please check your details:\n" + errorMessages);
      } else {
        alert(error.response?.data?.message || "Failed to place order. Ensure you are logged in and have items in the cart.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base pt-[64px]">
      <Navbar />

      {isSuccess && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center transition-all duration-500">
          <div className="bg-surface p-10 rounded-[20px] shadow-2xl flex flex-col items-center animate-in zoom-in duration-300 transform scale-100">
            <div className="relative mb-6 animate-[pulse_2s_ease-in-out_infinite]">
              <img src="/logo.png" alt="Bhojanwale" className="h-24 w-auto object-contain drop-shadow-xl" />
            </div>
            <h2 className="text-3xl font-serif text-primary mb-2">Order Confirmed!</h2>
            <p className="text-secondary text-center max-w-xs text-sm leading-relaxed">
              Your order has been sent to the kitchen. Redirecting to your tracking page...
            </p>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 md:px-8 py-12 pb-32 lg:pb-12 max-w-5xl">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Link>
          <h1 className="font-serif text-4xl text-primary">Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left Column: Form */}
          <div className="flex-1">
            <section className="mb-12">
              <h2 className="text-sm font-medium uppercase tracking-widest text-primary mb-8 border-b border-divider pb-4">
                Delivery Details
              </h2>
              
              <div className="space-y-8">
                <div className="flex flex-col">
                  <label htmlFor="customerName" className="text-xs font-medium uppercase tracking-wider text-secondary mb-2">
                    Customer Name
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Rahul Kumar"
                    className="w-full bg-transparent border-0 border-b border-divider py-2 text-primary placeholder-secondary/50 focus:ring-0 focus:border-accent focus:border-b-accent transition-colors outline-none"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="address" className="text-xs font-medium uppercase tracking-wider text-secondary mb-2">
                    Delivery Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Flat 402, Shivam Apartments, Andheri West, Mumbai"
                    className="w-full bg-transparent border-0 border-b border-divider py-2 text-primary placeholder-secondary/50 focus:ring-0 focus:border-accent focus:border-b-accent transition-colors outline-none"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="phone" className="text-xs font-medium uppercase tracking-wider text-secondary mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-transparent border-0 border-b border-divider py-2 text-primary placeholder-secondary/50 focus:ring-0 focus:border-accent focus:border-b-accent transition-colors outline-none"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="notes" className="text-xs font-medium uppercase tracking-wider text-secondary mb-2">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    id="notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Leave at the front door"
                    className="w-full bg-transparent border-0 border-b border-divider py-2 text-primary placeholder-secondary/50 focus:ring-0 focus:border-accent focus:border-b-accent transition-colors outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-sm font-medium uppercase tracking-widest text-primary mb-8 border-b border-divider pb-4">
                Payment Method
              </h2>
              <p className="text-secondary text-sm">Payment integration will be added in the next phase. Cash on Delivery is selected by default.</p>
            </section>
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="w-full lg:w-[380px]">
            <div className="sticky top-[100px] bg-surface rounded-[14px] p-6 md:p-8">
              <h2 className="text-lg font-medium text-primary mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 pb-6 border-b border-divider/60">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-secondary">{item.quantity}x</span>
                      <span className="text-base text-primary truncate max-w-[200px]">{item.menuItem?.name}</span>
                    </div>
                    <span className="text-lg font-serif font-medium text-accent">{formatCurrency((item.menuItem?.price || 0) * item.quantity)}</span>
                  </div>
                ))}
                {cartItems.length === 0 && (
                  <p className="text-sm text-secondary">Your cart is empty.</p>
                )}
              </div>

              {/* Promo Code */}
              <div className="mb-6 pb-6 border-b border-divider/60">
                <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-2">
                  Promo Code
                </label>
                {promoApplied ? (
                  <div className="flex items-center justify-between bg-[#FBF7F0] border border-dashed border-[#D9B65E] rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#2F4F3E]" />
                      <span className="text-sm font-medium text-[#2F4F3E]">{promoApplied.code} applied — -{formatCurrency(promoApplied.discount)}</span>
                    </div>
                    <button onClick={handleRemovePromo} className="text-secondary hover:text-error cursor-pointer transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                      placeholder="Enter code"
                      className="flex-1 bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent font-mono placeholder:text-secondary/50"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={validatingPromo || !promoInput.trim()}
                      className="px-3 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {validatingPromo ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-xs text-error mt-1.5">{promoError}</p>
                )}
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-sm text-secondary">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-accent">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-secondary">
                  <span>Delivery Fee</span>
                  <span className="italic">Calculated after confirmation</span>
                </div>
                <div className="text-[11px] text-secondary/80 flex items-start gap-1.5 mt-1 bg-surface/50 p-2 rounded border border-divider/50">
                  <span className="text-accent">ⓘ</span>
                  <p><strong>Delivery Rule:</strong> First 2 km are free! After that, it is ₹10 for every additional kilometer.</p>
                </div>
                <div className="flex justify-between text-lg font-medium text-primary pt-4 border-t border-divider">
                  <span>Total (excl. delivery)</span>
                  <span className="text-xl font-serif text-accent">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-divider/50 z-50 lg:static lg:p-0 lg:border-none lg:bg-transparent lg:z-auto">
                <button 
                  onClick={handlePlaceOrder}
                  disabled={loading || cartItems.length === 0}
                  className="w-full py-4 bg-primary text-base text-center transition-colors hover:bg-primary/90 disabled:opacity-50 font-medium rounded-lg cursor-pointer shadow-lg lg:shadow-none" 
                  style={{ color: "var(--base)" }}
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
