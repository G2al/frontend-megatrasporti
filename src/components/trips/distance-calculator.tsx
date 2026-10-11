"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DistanceResult } from "@/components/trips/distance-result";
import { ApiError, apiFetch } from "@/lib/api";
import type { DistanceErrorCode, DistanceStatus } from "@/types";

interface CalculateResponse {
  distance_km: number | string | null;
  distance_status: DistanceStatus;
  distance_note: string | null;
  distance_error_code: DistanceErrorCode | null;
  distance_error_destination: string | null;
}

type PreviewState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "completing"; result: CalculateResponse }
  | { kind: "verified"; result: CalculateResponse }
  | { kind: "done"; result: CalculateResponse }
  | { kind: "error"; message: string };

interface DistanceCalculatorProps {
  platformId: string;
  destinations: string[];
  disabled?: boolean;
  onResult?: (result: CalculateResponse | null) => void;
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

export function DistanceCalculator({ platformId, destinations, disabled, onResult }: DistanceCalculatorProps) {
  const [state, setState] = useState<PreviewState>({ kind: "idle" });
  const requestKey = useRef<string>("");
  const [progress, resetProgress] = useFakeProgress(state.kind === "loading");

  const cleanDestinations = destinations.map((value) => value.trim()).filter(Boolean);
  const canCalculate = Boolean(platformId) && cleanDestinations.length > 0;
  const currentKey = `${platformId}|${cleanDestinations.join("|")}`;

  useEffect(() => {
    if (state.kind !== "idle" && (!canCalculate || requestKey.current !== currentKey)) {
      setState({ kind: "idle" });
      onResult?.(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey, canCalculate]);

  useEffect(() => {
    if (state.kind === "completing") {
      const timeout = setTimeout(() => setState({ kind: "verified", result: state.result }), 220);
      return () => clearTimeout(timeout);
    }
    if (state.kind === "verified") {
      const timeout = setTimeout(() => setState({ kind: "done", result: state.result }), 550);
      return () => clearTimeout(timeout);
    }
  }, [state]);

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
      onResult?.(result);
      if (result.distance_status === "unavailable") {
        setState({ kind: "done", result });
      } else {
        setState({ kind: "completing", result });
      }
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof ApiError ? error.firstMessage() : "Impossibile calcolare i km.",
      });
    }
  }

  const isBusy = state.kind === "loading" || state.kind === "completing" || state.kind === "verified";
  const barProgress = state.kind === "completing" || state.kind === "verified" ? 100 : progress;

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full gap-2"
        disabled={disabled || !canCalculate || isBusy}
        onClick={() => void handleCalculate()}
      >
        {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Route className="size-4" />}
        {isBusy ? "Calcolo del percorso..." : "Calcola km del viaggio"}
      </Button>

      {isBusy && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
            style={{ width: `${Math.min(barProgress, 100)}%` }}
          />
        </div>
      )}

      {state.kind === "verified" && (
        <div className="flex items-center justify-center py-1">
          <div className="animate-in zoom-in-50 flex size-8 items-center justify-center rounded-full bg-green-100 text-green-700 duration-300">
            <Check className="size-5" aria-hidden />
          </div>
        </div>
      )}

      {state.kind === "done" && (
        <div className="animate-in fade-in slide-in-from-top-1 rounded-lg bg-secondary/60 px-3 py-2 duration-200">
          <DistanceResult
            status={state.result.distance_status}
            km={state.result.distance_km}
            note={state.result.distance_note}
            errorCode={state.result.distance_error_code}
            errorDestination={state.result.distance_error_destination}
          />
        </div>
      )}

      {state.kind === "error" && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.message}
        </p>
      )}
    </div>
  );
}
