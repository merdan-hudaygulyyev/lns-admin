import { Loader2 } from "lucide-react";

export function Loader({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-muted">
      <Loader2 className="h-7 w-7 animate-spin text-brand" aria-hidden="true" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
