import { Card } from "@/components/ui";
import { Skeleton } from "@/components/ui";

export default function HousesLoading() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[320px_1fr]">
      <Card className="space-y-6 p-6 shadow-sm">
        <div className="space-y-3">
          <Skeleton height={16} width="50%" className="mb-1" />
          <Skeleton height={32} width="70%" />
        </div>
        <Skeleton height={48} />
        <Skeleton height={48} />
        <Skeleton height={48} />
      </Card>

      <div className="space-y-6">
        <Card className="space-y-4 p-6">
          <Skeleton height={20} width="40%" />
          <Skeleton height={14} width="60%" />
        </Card>
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="overflow-hidden p-0">
              <div className="flex h-48 w-full items-center justify-center bg-border/20">
                <Skeleton width="90%" height="90%" />
              </div>
              <div className="space-y-2 p-4">
                <Skeleton height={20} width="60%" />
                <Skeleton height={14} width="40%" />
                <Skeleton height={12} width="50%" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
