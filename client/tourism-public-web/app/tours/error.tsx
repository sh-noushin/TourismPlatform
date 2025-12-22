"use client";

import { useEffect } from "react";
import { Button, Card, EmptyState } from "@/components/ui";

interface ToursErrorProps {
  error: Error;
  reset: () => void;
}

export default function ToursError({ error, reset }: ToursErrorProps) {
  useEffect(() => {
    console.error("Tours page error", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <Card className="p-6">
        <EmptyState
          title="Unable to load tours"
          description="Something went wrong while fetching tours. Refresh to try again."
          action={
            <Button variant="primary" onClick={reset}>
              Try again
            </Button>
          }
        />
      </Card>
    </div>
  );
}
