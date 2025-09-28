import { TrackedWindow, WindowLayout } from './types';

/**
 * Converts a Chrome window to our TrackedWindow type
 */
export function chromeWindowToTracked(window: chrome.windows.Window): TrackedWindow | null {
  // Only track normal browser windows
  if (window.type !== 'normal') {
    return null;
  }

  return {
    id: window.id!,
    bounds: {
      left: window.left,
      top: window.top,
      width: window.width,
      height: window.height
    },
    state: window.state!,
    type: window.type!
  };
}

/**
 * Creates a WindowLayout from current Chrome windows
 */
export async function captureCurrentLayout(): Promise<WindowLayout> {
  const chromeWindows = await chrome.windows.getAll();
  const windows: TrackedWindow[] = [];

  for (const window of chromeWindows) {
    const tracked = chromeWindowToTracked(window);
    if (tracked) {
      windows.push(tracked);
    }
  }

  return {
    windows,
    timestamp: Date.now()
  };
}

/**
 * Restores windows to a saved layout
 */
export async function restoreWindowLayout(layout: WindowLayout): Promise<void> {
  const currentWindows = await chrome.windows.getAll();

  for (const savedWindow of layout.windows) {
    const existingWindow = currentWindows.find(w => w.id === savedWindow.id);

    if (existingWindow) {
      try {
        // First restore the window state if it's minimized
        if (existingWindow.state === 'minimized' && savedWindow.state !== 'minimized') {
          await chrome.windows.update(savedWindow.id, {
            state: 'normal'
          });
        }

        // Then update position and size
        const updateInfo: chrome.windows.UpdateInfo = {};

        if (savedWindow.bounds.left !== undefined) {
          updateInfo.left = savedWindow.bounds.left;
        }
        if (savedWindow.bounds.top !== undefined) {
          updateInfo.top = savedWindow.bounds.top;
        }
        if (savedWindow.bounds.width !== undefined) {
          updateInfo.width = savedWindow.bounds.width;
        }
        if (savedWindow.bounds.height !== undefined) {
          updateInfo.height = savedWindow.bounds.height;
        }

        // Finally set the desired state
        if (savedWindow.state !== 'normal') {
          updateInfo.state = savedWindow.state;
        }

        await chrome.windows.update(savedWindow.id, updateInfo);
      } catch (error) {
        console.error(`Failed to restore window ${savedWindow.id}:`, error);
      }
    }
  }
}

/**
 * Checks if two window layouts are significantly different
 */
export function layoutsAreDifferent(layout1: WindowLayout | null, layout2: WindowLayout | null): boolean {
  if (!layout1 || !layout2) return true;
  if (layout1.windows.length !== layout2.windows.length) return true;

  // Check if any window has moved or resized significantly (more than 10 pixels)
  const threshold = 10;

  for (const window1 of layout1.windows) {
    const window2 = layout2.windows.find(w => w.id === window1.id);
    if (!window2) return true;

    const leftDiff = Math.abs((window1.bounds.left || 0) - (window2.bounds.left || 0));
    const topDiff = Math.abs((window1.bounds.top || 0) - (window2.bounds.top || 0));
    const widthDiff = Math.abs((window1.bounds.width || 0) - (window2.bounds.width || 0));
    const heightDiff = Math.abs((window1.bounds.height || 0) - (window2.bounds.height || 0));

    if (leftDiff > threshold || topDiff > threshold || widthDiff > threshold || heightDiff > threshold) {
      return true;
    }

    if (window1.state !== window2.state) {
      return true;
    }
  }

  return false;
}