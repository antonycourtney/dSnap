import { captureCurrentLayout, layoutsAreDifferent } from '@/lib/windowUtils';
import { updateCurrentLayout, getStorageData } from '@/lib/storage';
import { WindowLayout } from '@/lib/types';

let currentLayout: WindowLayout | null = null;
let updateDebounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Updates the current window layout with debouncing
 */
async function updateLayoutDebounced(): Promise<void> {
  if (updateDebounceTimer) {
    clearTimeout(updateDebounceTimer);
  }

  updateDebounceTimer = setTimeout(async () => {
    try {
      const newLayout = await captureCurrentLayout();

      // Only update if the layout has changed significantly
      if (layoutsAreDifferent(currentLayout, newLayout)) {
        currentLayout = newLayout;
        await updateCurrentLayout(newLayout);
        console.log('Window layout updated:', newLayout.windows.length, 'windows');
      }
    } catch (error) {
      console.error('Error updating window layout:', error);
    }
  }, 500); // 500ms debounce
}

/**
 * Handles window creation
 */
function handleWindowCreated(window: chrome.windows.Window): void {
  if (window.type === 'normal') {
    console.log('Window created:', window.id);
    updateLayoutDebounced();
  }
}

/**
 * Handles window removal
 */
function handleWindowRemoved(windowId: number): void {
  console.log('Window removed:', windowId);
  updateLayoutDebounced();
}

/**
 * Handles window bounds changes
 */
function handleBoundsChanged(window: chrome.windows.Window): void {
  if (window.type === 'normal') {
    updateLayoutDebounced();
  }
}

/**
 * Initializes the window tracker
 */
export async function initializeWindowTracker(): Promise<void> {
  // Capture initial layout
  currentLayout = await captureCurrentLayout();
  await updateCurrentLayout(currentLayout);

  // Set up window event listeners
  chrome.windows.onCreated.addListener(handleWindowCreated);
  chrome.windows.onRemoved.addListener(handleWindowRemoved);
  chrome.windows.onBoundsChanged.addListener(handleBoundsChanged);

  console.log('Window tracker initialized with', currentLayout.windows.length, 'windows');
}

/**
 * Gets the current window layout
 */
export function getCurrentLayout(): WindowLayout | null {
  return currentLayout;
}

/**
 * Forces an immediate layout update
 */
export async function forceLayoutUpdate(): Promise<void> {
  currentLayout = await captureCurrentLayout();
  await updateCurrentLayout(currentLayout);
}

/**
 * Restores the current layout from storage
 */
export async function restoreCurrentLayout(): Promise<void> {
  const data = await getStorageData();
  if (data.currentLayout) {
    currentLayout = data.currentLayout;
  }
}