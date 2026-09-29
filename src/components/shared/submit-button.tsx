import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  pending: boolean;
  label: string;
  disabled?: boolean;
}

export function SubmitButton({ pending, label, disabled }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className="h-12 w-full text-base font-semibold"
    >
      {pending && <Loader2 className="animate-spin" />}
      {pending ? "Salvataggio..." : label}
    </Button>
  );
}
