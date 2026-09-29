"use client";

const KEY = "mega_last_vehicle";

export function readLastVehicle(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveLastVehicle(vehicleId: string) {
  try {
    window.localStorage.setItem(KEY, vehicleId);
  } catch {
    return;
  }
}
