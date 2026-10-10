"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DistanceResult } from "@/components/trips/distance-result";
import { ApiError, apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { DistanceStatus } from "@/types";

interface CalculateResponse {
  distance_km: number | string | null;
  distance_status: DistanceStatus;
  distance_note: string | null;
}

type PreviewState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; result: CalculateResponse }
  | { kind: "error"; message: string };

interface DistanceCalculatorProps {
  platformId: string;
  destinations: string[];
  disabled?: boolean;
}

function useFakeProgress(active: boolean): [number, () => void] {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setProgress((current) => current + (92 - current) * 0.12);
    }, 150);
    return () => clearInterval(interval);
  }, [active]);

  return [progress, () => setProgress(0)];
}

export function DistanceCalculator({ platformId, destinations, disabled }: DistanceCalculatorProps) {
  const [state, setState] = useState<PreviewState>({ kind: "idle" });
  const requestKey = useRef<string>("");
  const [progress, resetProgress] = useFakeProgress(state.kind === "loading");

  const cleanDestinations = destinations.map((value) => value.trim()).filter(Boolean);
  const canCalculate = Boolean(platformId) && cleanDestinations.length > 0;
  const currentKey = `${platformId}|${cleanDestinations.join("|")}`;

  useEffect(() => {
    if (state.kind !== "idle" && requestKey.current !== currentKey) {
      setState({ kind: "idle" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey]);

  async function handleCalculate() {
    if (!canCalculate) return;
    requestKey.current = currentKey;
    resetProgress();
    setState({ kind: "loading" });
    try {
      const result = await apiFetch<CalculateResponse>("/trips/calculate-distance", {
        method: "POST",
        body: { platform_id: Number(platformId), destinations: cleanDestinations },
      });
      setState({ kind: "done", result });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof ApiError ? error.firstMessage() : "Impossibile calcolare i km.",
      });
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full gap-2"
        disabled={disabled || !canCalculate || state.kind === "loading"}
        onClick={() => void handleCalculate()}
      >
        {state.kind === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Route className="size-4" />}
        {state.kind === "loading" ? "Calcolo del percorso..." : "Calcola km del viaggio"}
      </Button>

      {state.kind === "loading" && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}

      {state.kind === "done" && (
        <div className="animate-in fade-in slide-in-from-top-1 rounded-lg bg-secondary/60 px-3 py-2 duration-200">
          <DistanceResult
            status={state.result.distance_status}
            km={state.result.distance_km}
            note={state.result.distance_note}
          />
        </div>
      )}

      {state.kind === "error" && (
        <p role="alert" className={cn("text-sm font-medium text-destructive")}>
          {state.message}
        </p>
      )}
    </div>
  );
}
