import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

export function useRealtimeSync(enabled = true) {
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || typeof EventSource === "undefined") return;
    const source = new EventSource("/api/realtime");
    const refresh = () => { void utils.orders.list.invalidate(); };
    source.addEventListener("orders", refresh);
    source.addEventListener("ready", refresh);
    return () => {
      source.removeEventListener("orders", refresh);
      source.removeEventListener("ready", refresh);
      source.close();
    };
  }, [enabled, utils]);
}
