import React from 'react';
import { DisplayConfiguration } from '@/lib/types';
import { calculateScaleFactor, normalizeDisplayPositions } from '@/lib/displayUtils';
import { cn } from '@/lib/utils';

interface DisplayConfigProps {
  configuration: DisplayConfiguration;
  isCurrent?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export const DisplayConfig: React.FC<DisplayConfigProps> = ({
  configuration,
  isCurrent = false,
  width = 400,
  height = 200,
  className
}) => {
  const normalizedDisplays = normalizeDisplayPositions(configuration.displays);
  const scale = calculateScaleFactor(normalizedDisplays, width, height);

  return (
    <div
      className={cn(
        "relative border rounded-lg bg-slate-50",
        isCurrent && "ring-2 ring-blue-500",
        className
      )}
      style={{ width, height }}
    >
      {normalizedDisplays.map((display) => (
        <div
          key={display.id}
          className={cn(
            "absolute border-2 bg-white shadow-sm flex items-center justify-center text-xs",
            display.isPrimary ? "border-blue-600 border-4" : "border-gray-400"
          )}
          style={{
            left: `${display.bounds.left * scale + 10}px`,
            top: `${display.bounds.top * scale + 10}px`,
            width: `${display.bounds.width * scale}px`,
            height: `${display.bounds.height * scale}px`,
          }}
        >
          <span className="font-medium">
            {display.bounds.width} × {display.bounds.height}
          </span>
        </div>
      ))}
      {isCurrent && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
          Current
        </div>
      )}
    </div>
  );
};