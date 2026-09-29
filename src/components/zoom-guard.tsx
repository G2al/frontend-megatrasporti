"use client";

import { useEffect } from "react";

export function ZoomGuard() {
  useEffect(() => {
    function preventGesture(event: Event) {
      event.preventDefault();
    }

    let lastTouchEnd = 0;
    function preventDoubleTapZoom(event: TouchEvent) {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) event.preventDefault();
      lastTouchEnd = now;
    }

    document.addEventListener("gesturestart", preventGesture);
    document.addEventListener("gesturechange", preventGesture);
    document.addEventListener("touchend", preventDoubleTapZoom, { passive: false });

    return () => {
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("gesturechange", preventGesture);
      document.removeEventListener("touchend", preventDoubleTapZoom);
    };
  }, []);

  return null;
}
