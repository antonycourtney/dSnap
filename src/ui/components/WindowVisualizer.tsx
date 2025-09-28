import React from 'react';
import { TrackedWindow, Display } from '@/lib/types';
import { calculateScaleFactor, normalizeDisplayPositions } from '@/lib/displayUtils';
import { cn } from '@/lib/utils';

interface WindowVisualizerProps {
  windows: TrackedWindow[];
  displays: Display[];
  width?: number;
  height?: number;
  className?: string;
}

export const WindowVisualizer: React.FC<WindowVisualizerProps> = ({
  windows,
  displays,
  width = 400,
  height = 200,
  className
}) => {
  const normalizedDisplays = normalizeDisplayPositions(displays);
  const scale = calculateScaleFactor(normalizedDisplays, width, height);

  // Calculate display bounds for clipping
  let minX = 0, minY = 0;
  let maxX = 0, maxY = 0;

  normalizedDisplays.forEach(display => {
    maxX = Math.max(maxX, display.bounds.left + display.bounds.width);
    maxY = Math.max(maxY, display.bounds.top + display.bounds.height);
  });

  return (
    <div
      className={cn("relative", className)}
      style={{ width, height }}
    >
      {/* Render displays as background */}
      {normalizedDisplays.map((display) => (
        <div
          key={display.id}
          className={cn(
            "absolute border bg-gray-100",
            display.isPrimary ? "border-blue-400" : "border-gray-300"
          )}
          style={{
            left: `${display.bounds.left * scale + 10}px`,
            top: `${display.bounds.top * scale + 10}px`,
            width: `${display.bounds.width * scale}px`,
            height: `${display.bounds.height * scale}px`,
          }}
        />
      ))}

      {/* Render windows */}
      {windows.map((window) => {
        if (
          window.bounds.left === undefined ||
          window.bounds.top === undefined ||
          window.bounds.width === undefined ||
          window.bounds.height === undefined
        ) {
          return null;
        }

        // Normalize window position relative to display bounds
        const windowLeft = window.bounds.left - minX;
        const windowTop = window.bounds.top - minY;

        return (
          <div
            key={window.id}
            className={cn(
              "absolute border-2 rounded shadow-sm",
              window.state === 'minimized'
                ? "bg-gray-400 opacity-50 border-gray-500"
                : window.state === 'maximized'
                ? "bg-blue-200 border-blue-500"
                : "bg-white border-gray-400"
            )}
            style={{
              left: `${windowLeft * scale + 10}px`,
              top: `${windowTop * scale + 10}px`,
              width: `${window.bounds.width * scale}px`,
              height: `${window.bounds.height * scale}px`,
            }}
            title={`Window ${window.id} (${window.state})`}
          />
        );
      })}
    </div>
  );
};