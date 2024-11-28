// components/SkeletonCard.tsx

import { Card, CardHeader, CardContent } from '@/components/ui/card';

export function SkeletonCard() {
  return (
    <Card className="animate-pulse border-none shadow-sm">
      <CardHeader>
        <div className="h-8 w-2/3 rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
          <div className="h-4 w-4/6 rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}
