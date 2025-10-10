"use client";

import { useAppSelector } from "@/hooks/reduxHook";

export function LoadingOverlay() {
  const isLoading = useAppSelector((state) => state.isLoading);

  if (!isLoading.value) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90"
      role="status"
      aria-live="assertive"
      aria-busy="true"
    >
      <div className="relative mb-8 h-15 w-15">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>

      <p className="text-lg font-semibold uppercase tracking-[0.4em] text-primary animate-[pulse_1.6s_ease-in-out_infinite]">
        Loading...
      </p>
    </div>
  );
}