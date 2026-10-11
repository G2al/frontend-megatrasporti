"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { VerificationStatus } from "@/types";

const VERIFICATION_KEY = ["verification-status"];

export function useVerificationStatus() {
  return useQuery({
    queryKey: VERIFICATION_KEY,
    queryFn: () => apiFetch<VerificationStatus>("/verification/status"),
  });
}

export function useSubmitVerificationField() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return async function submit(data: FormData): Promise<VerificationStatus> {
    const result = await apiFetch<VerificationStatus>("/verification", { method: "POST", body: data });
    queryClient.setQueryData(VERIFICATION_KEY, result);
    updateUser({ is_approved: result.is_approved, must_change_password: result.must_change_password });
    return result;
  };
}
