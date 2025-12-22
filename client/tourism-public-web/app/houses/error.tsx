"use client";

import { useEffect } from "react";
import { Button, Card, EmptyState } from "@/components/ui";

interface HousesErrorProps {
  error: Error;
  reset: () => void;
}

export default function HousesError({ error, reset }: HousesErrorProps) {
  useEffect(() => {
    console.error("Houses page error", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <Card className="p-6">
        <EmptyState
          title="Unable to load houses"
          description="Something went wrong while fetching the house listings. Try again to refresh the feed."
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
