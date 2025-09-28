import React, { useState } from 'react';
import { Snapshot, DisplayConfiguration } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WindowVisualizer } from './WindowVisualizer';
import { Trash2, Eye, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SnapshotListProps {
  snapshots: Snapshot[];
  configuration: DisplayConfiguration;
  onApply: (snapshotId: string) => void;
  onDelete: (snapshotId: string) => void;
  className?: string;
}

export const SnapshotList: React.FC<SnapshotListProps> = ({
  snapshots,
  configuration,
  onApply,
  onDelete,
  className
}) => {
  const [previewSnapshot, setPreviewSnapshot] = useState<string | null>(null);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  if (snapshots.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-500", className)}>
        No snapshots yet for this configuration
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {snapshots.map((snapshot) => (
        <Card
          key={snapshot.id}
          className={cn(
            "p-4 transition-all",
            previewSnapshot === snapshot.id && "ring-2 ring-blue-400"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="text-sm font-medium">
                {formatTimestamp(snapshot.timestamp)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {snapshot.layout.windows.length} window{snapshot.layout.windows.length !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(snapshot.timestamp).toLocaleString()}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setPreviewSnapshot(
                  previewSnapshot === snapshot.id ? null : snapshot.id
                )}
                title="Preview snapshot"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onApply(snapshot.id)}
                title="Apply snapshot"
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(snapshot.id)}
                title="Delete snapshot"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {previewSnapshot === snapshot.id && (
            <div className="mt-4 pt-4 border-t">
              <WindowVisualizer
                windows={snapshot.layout.windows}
                displays={configuration.displays}
                width={360}
                height={180}
                className="mx-auto"
              />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};