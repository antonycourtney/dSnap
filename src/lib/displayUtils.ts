import { Display, DisplayConfiguration } from './types';

/**
 * Creates a unique hash for a display configuration
 */
export function hashDisplayConfig(displays: any[]): string {
  const normalized = displays
    .map(d => ({
      w: d.bounds.width,
      h: d.bounds.height,
      x: d.bounds.left,
      y: d.bounds.top,
      p: d.isPrimary
    }))
    .sort((a, b) => {
      // Sort by left position first, then by top
      if (a.x !== b.x) return a.x - b.x;
      return a.y - b.y;
    });

  return JSON.stringify(normalized);
}

/**
 * Converts Chrome display info to our Display type
 */
export function chromeDisplayToDisplay(display: any): Display {
  return {
    id: display.id,
    bounds: {
      left: display.bounds.left,
      top: display.bounds.top,
      width: display.bounds.width,
      height: display.bounds.height
    },
    isPrimary: display.isPrimary
  };
}

/**
 * Creates a DisplayConfiguration from Chrome display info
 */
export function createDisplayConfig(displays: any[]): DisplayConfiguration {
  return {
    id: hashDisplayConfig(displays),
    displays: displays.map(chromeDisplayToDisplay),
    lastSeen: Date.now()
  };
}

/**
 * Calculates scale factor to fit displays within given dimensions
 */
export function calculateScaleFactor(
  displays: Display[],
  maxWidth: number,
  maxHeight: number
): number {
  if (displays.length === 0) return 1;

  // Find the bounding box of all displays
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  displays.forEach(display => {
    minX = Math.min(minX, display.bounds.left);
    minY = Math.min(minY, display.bounds.top);
    maxX = Math.max(maxX, display.bounds.left + display.bounds.width);
    maxY = Math.max(maxY, display.bounds.top + display.bounds.height);
  });

  const totalWidth = maxX - minX;
  const totalHeight = maxY - minY;

  // Calculate scale to fit within max dimensions with padding
  const padding = 20;
  const scaleX = (maxWidth - padding * 2) / totalWidth;
  const scaleY = (maxHeight - padding * 2) / totalHeight;

  return Math.min(scaleX, scaleY, 1); // Don't scale up, only down
}

/**
 * Normalizes display positions to start from (0, 0)
 */
export function normalizeDisplayPositions(displays: Display[]): Display[] {
  if (displays.length === 0) return [];

  // Find minimum x and y
  let minX = Infinity, minY = Infinity;
  displays.forEach(display => {
    minX = Math.min(minX, display.bounds.left);
    minY = Math.min(minY, display.bounds.top);
  });

  // Normalize positions
  return displays.map(display => ({
    ...display,
    bounds: {
      ...display.bounds,
      left: display.bounds.left - minX,
      top: display.bounds.top - minY
    }
  }));
}