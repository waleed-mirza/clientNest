"use client";

import { useEffect } from "react";
import { ActionButton } from "@/components/app/action-button";
import { secondaryButtonClass } from "@/components/app/styles";

export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h1 className="text-[1.75rem] font-medium">Something went wrong</h1>
      <p className="mt-2 max-w-xl text-muted" role="status">
        The page failed to load. Try again. If this keeps happening, check your connection and
        Supabase configuration.
      </p>
      <ActionButton
        type="button"
        onClick={() => retry()}
        className={`mt-4 ${secondaryButtonClass}`}
      >
        Try again
      </ActionButton>
    </div>
  );
}
