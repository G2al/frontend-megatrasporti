"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { VerificationStatus } from "@/types";

const VERIFICATION_KEY = ["verification-status"];

export function useVerificationStatus(enabled = true) {
  return useQuery({
    queryKey: VERIFICATION_KEY,
    queryFn: () => apiFetch<VerificationStatus>("/verification/status"),
    enabled,
  });
}

export function useSubmitVerificationField() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return async function submit(data: FormData): Promise<VerificationStatus> {
    const result = await apiFetch<VerificationStatus>("/verification", { method: "POST", body: data });
    queryClient.setQueryData(VERIFICATION_KEY, result);
    updateUser({
      is_approved: result.is_approved,
      must_change_password: result.must_change_password,
      documents_verified: result.documents_verified,
    });
    return result;
  };
}

export function useConfirmVerification() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return async function confirm(): Promise<VerificationStatus> {
    const result = await apiFetch<VerificationStatus>("/verification/confirm", { method: "POST" });
    queryClient.setQueryData(VERIFICATION_KEY, result);
    updateUser({
      is_approved: result.is_approved,
      must_change_password: result.must_change_password,
      documents_verified: result.documents_verified,
    });
    return result;
  };
}
