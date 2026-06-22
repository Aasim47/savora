"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function GlobalErrorHandler() {
  const [error, setError] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    const handleApiError = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; message: string }>;
      setError(customEvent.detail);
      // Auto dismiss after 8 seconds
      setTimeout(() => setError(null), 8000);
    };
    window.addEventListener("api-error", handleApiError);
    return () => window.removeEventListener("api-error", handleApiError);
  }, []);

  return (
    <AnimatePresence>
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -50, x: "-50%" }}
          className="fixed top-24 left-1/2 z-[100] w-[90%] max-w-md bg-surface border border-error/20 p-4 rounded-2xl shadow-2xl flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-error" />
          </div>
          <div className="flex-1 pt-0.5">
            <h4 className="font-serif text-lg text-primary">{error.title}</h4>
            <p className="text-sm text-secondary mt-1">{error.message}</p>
          </div>
          <button onClick={() => setError(null)} className="text-secondary hover:text-error transition-colors mt-1">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
