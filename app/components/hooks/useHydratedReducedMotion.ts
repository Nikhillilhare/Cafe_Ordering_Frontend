"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";

let hydrated = false;

const hydrationListeners = new Set<() => void>();

function subscribeToHydration(listener: () => void): () => void {
  hydrationListeners.add(listener);

  return () => {
    hydrationListeners.delete(listener);
  };
}

function getHydrationSnapshot(): boolean {
  return hydrated;
}

function getServerHydrationSnapshot(): boolean {
  return false;
}

function markAsHydrated(): void {
  if (hydrated) {
    return;
  }

  hydrated = true;

  hydrationListeners.forEach((listener) => {
    listener();
  });
}

export function useHydratedReducedMotion(): boolean {
  const reducedMotion = useReducedMotion();

  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  /*
   * Effects run only after React has completed hydration.
   * After that, subscribers safely receive the real preference.
   */
  useEffect(() => {
    markAsHydrated();
  }, []);

  if (!isHydrated) {
    return false;
  }

  return reducedMotion ?? false;
}