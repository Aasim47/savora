"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Star } from "lucide-react";
import { cn } from "@/utils/cn";
import api from "@/lib/axios";

export function ReviewModal({ onReviewSubmitted }: { onReviewSubmitted?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOpen = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail;
    setOrderId(detail.orderId);
    setRestaurantName(detail.restaurantName || "Restaurant");
    setRating(0);
    setHoveredRating(0);
    setComment("");
    setIsOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener("open-review-modal", handleOpen);
    return () => window.removeEventListener("open-review-modal", handleOpen);
  }, [handleOpen]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await api.post("/reviews", {
        orderId,
        rating,
        comment: comment.trim() || undefined,
      });
      setIsOpen(false);
      onReviewSubmitted?.();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface rounded-[14px] shadow-xl w-full max-w-sm border border-divider overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-divider">
          <div>
            <h2 className="font-serif text-lg text-primary">Rate Your Experience</h2>
            <p className="text-xs text-secondary mt-0.5">{restaurantName}</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-secondary hover:text-primary cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-secondary">How was your order?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="cursor-pointer transition-transform hover:scale-110 p-0.5"
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      star <= (hoveredRating || rating)
                        ? "text-[#D9B65E] fill-[#D9B65E]"
                        : "text-secondary/30"
                    )}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="text-xs text-secondary">
                {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Great" : "Excellent!"}
              </span>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={3}
              className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent resize-none placeholder:text-secondary/50"
            />
          </div>
        </div>

        <div className="p-5 border-t border-divider flex justify-end gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm text-secondary hover:text-primary cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 cursor-pointer transition-colors disabled:opacity-50"
            style={{ color: "var(--base)" }}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
