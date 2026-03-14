"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("--- GLOBAL ERROR BOUNDARY ---", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4 text-center">
      <div className="p-6 border border-destructive bg-destructive/10 text-destructive rounded-xl max-w-lg">
        <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
        <p className="text-sm opacity-80 mb-4">
          {error.message || "A server-side error occurred while rendering this page."}
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => window.location.assign("/agency")}
          >
            Go to Agency
          </Button>
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
          >
            Try again
          </Button>
        </div>
      </div>
      {error.digest && (
        <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
      )}
    </div>
  );
}
