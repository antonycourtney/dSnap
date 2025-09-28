import { createDisplayConfig, hashDisplayConfig } from '@/lib/displayUtils';
import { saveDisplayConfig, updateCurrentConfigId, getStorageData } from '@/lib/storage';

let currentConfigId: string | null = null;

/**
 * Gets the current display configuration
 */
export async function getCurrentDisplayConfig(): Promise<any[]> {
  return new Promise((resolve) => {
    chrome.system.display.getInfo(resolve);
  });
}

/**
 * Checks if the display configuration has changed
 */
export async function checkDisplayConfigChange(): Promise<boolean> {
  const displays = await getCurrentDisplayConfig();
  const newConfigId = hashDisplayConfig(displays);

  if (newConfigId !== currentConfigId) {
    currentConfigId = newConfigId;

    // Save the new configuration
    const config = createDisplayConfig(displays);
    await saveDisplayConfig(config);
    await updateCurrentConfigId(newConfigId);

    console.log('Display configuration changed:', newConfigId);
    return true;
  }

  return false;
}

/**
 * Initializes the display monitor
 */
export async function initializeDisplayMonitor(): Promise<void> {
  // Get initial configuration
  const displays = await getCurrentDisplayConfig();
  currentConfigId = hashDisplayConfig(displays);

  // Save initial configuration
  const config = createDisplayConfig(displays);
  await saveDisplayConfig(config);
  await updateCurrentConfigId(currentConfigId);

  // Listen for display changes
  chrome.system.display.onDisplayChanged.addListener(async () => {
    const changed = await checkDisplayConfigChange();
    if (changed) {
      // Notify UI if it's open
      chrome.runtime.sendMessage({
        type: 'CONFIG_CHANGED',
        payload: { configId: currentConfigId }
      }).catch(() => {
        // UI might not be open, that's okay
      });
    }
  });

  console.log('Display monitor initialized with config:', currentConfigId);
}

/**
 * Gets the current configuration ID
 */
export function getCurrentConfigId(): string | null {
  return currentConfigId;
}

/**
 * Restores the current configuration ID from storage
 */
export async function restoreCurrentConfigId(): Promise<void> {
  const data = await getStorageData();
  if (data.currentConfigId) {
    currentConfigId = data.currentConfigId;
  }
}