"use client";

import { cn } from "@/utils/cn";
import { Clock, CheckCircle, ChefHat, Truck, Package, XCircle } from "lucide-react";

const STEPS = [
  { key: "PENDING", label: "Order Placed", icon: Clock },
  { key: "ACCEPTED", label: "Accepted", icon: CheckCircle },
  { key: "PREPARING", label: "Preparing", icon: ChefHat },
  { key: "OUT_FOR_DELIVERY", label: "On the Way", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: Package },
];

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0,
  ACCEPTED: 1,
  PREPARING: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
};

export function OrderTimeline({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 py-3 px-4 bg-[#B0413E]/5 rounded-lg border border-[#B0413E]/20">
        <XCircle className="w-4 h-4 text-[#B0413E]" />
        <span className="text-sm font-medium text-[#B0413E]">Order Cancelled</span>
      </div>
    );
  }

  const currentStep = STATUS_ORDER[status] ?? 0;

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute top-4 left-6 right-6 h-[2px] bg-[#E5DACB]" />
        {/* Active connector line */}
        <div
          className="absolute top-4 left-6 h-[2px] bg-[#2F4F3E] transition-all duration-700 ease-out"
          style={{
            width: currentStep === 0
              ? "0%"
              : `calc(${(currentStep / (STEPS.length - 1)) * 100}% - 48px)`,
          }}
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          const isFuture = idx > currentStep;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5" style={{ width: `${100 / STEPS.length}%` }}>
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                  isCompleted && "bg-[#2F4F3E] border-[#2F4F3E]",
                  isActive && "bg-accent border-accent animate-pulse",
                  isFuture && "bg-transparent border-[#E5DACB]"
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <step.icon
                    className={cn(
                      "w-3.5 h-3.5 transition-colors",
                      isActive && "text-white",
                      isFuture && "text-secondary"
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium text-center leading-tight transition-colors",
                  isCompleted && "text-[#2F4F3E]",
                  isActive && "text-accent font-bold",
                  isFuture && "text-secondary"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
