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

  // Calculate the original display bounds before normalization for window positioning
  let originalMinX = Infinity, originalMinY = Infinity;
  displays.forEach(display => {
    originalMinX = Math.min(originalMinX, display.bounds.left);
    originalMinY = Math.min(originalMinY, display.bounds.top);
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
            display.isPrimary ? "border-blue-400 border-2" : "border-gray-300"
          )}
          style={{
            left: `${display.bounds.left * scale + 10}px`,
            top: `${display.bounds.top * scale + 10}px`,
            width: `${display.bounds.width * scale}px`,
            height: `${display.bounds.height * scale}px`,
          }}
        />
      ))}

      {/* Render windows overlaid on displays */}
      {windows.map((window) => {
        if (
          window.bounds.left === undefined ||
          window.bounds.top === undefined ||
          window.bounds.width === undefined ||
          window.bounds.height === undefined
        ) {
          return null;
        }

        // Normalize window position relative to the same origin as displays
        const normalizedWindowLeft = window.bounds.left - originalMinX;
        const normalizedWindowTop = window.bounds.top - originalMinY;

        return (
          <div
            key={window.id}
            className={cn(
              "absolute border-2 rounded shadow-sm z-10",
              window.state === 'minimized'
                ? "bg-yellow-200 opacity-70 border-yellow-500"
                : window.state === 'maximized'
                ? "bg-green-200 opacity-80 border-green-500"
                : "bg-blue-200 opacity-80 border-blue-500"
            )}
            style={{
              left: `${normalizedWindowLeft * scale + 10}px`,
              top: `${normalizedWindowTop * scale + 10}px`,
              width: `${window.bounds.width * scale}px`,
              height: `${window.bounds.height * scale}px`,
            }}
            title={`Window ${window.id} (${window.state}) - ${window.bounds.width}×${window.bounds.height}`}
          />
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 p-2 rounded text-xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-2 bg-blue-200 border border-blue-500 rounded"></div>
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-2 bg-green-200 border border-green-500 rounded"></div>
          <span>Maximized</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-2 bg-yellow-200 border border-yellow-500 rounded"></div>
          <span>Minimized</span>
        </div>
      </div>
    </div>
  );
};