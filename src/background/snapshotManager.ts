import { saveSnapshot } from '@/lib/storage';
import { getCurrentConfigId } from './displayMonitor';
import { getCurrentLayout } from './windowTracker';
import { Snapshot } from '@/lib/types';

const SNAPSHOT_ALARM_NAME = 'snapshot-timer';
const SNAPSHOT_INTERVAL_MINUTES = 1;

/**
 * Creates a snapshot of the current window layout
 */
async function createSnapshot(): Promise<void> {
  const configId = getCurrentConfigId();
  const layout = getCurrentLayout();

  if (!configId || !layout || layout.windows.length === 0) {
    console.log('Skipping snapshot: no config or layout');
    return;
  }

  const snapshot: Snapshot = {
    id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    configId,
    layout: {
      ...layout,
      timestamp: Date.now() // Update timestamp to current time
    },
    timestamp: Date.now()
  };

  await saveSnapshot(snapshot);
  console.log('Snapshot created for config:', configId);

  // Notify UI if it's open
  chrome.runtime.sendMessage({
    type: 'SNAPSHOT_CREATED',
    payload: { snapshot }
  }).catch(() => {
    // UI might not be open, that's okay
  });
}

/**
 * Handles alarm for periodic snapshots
 */
function handleAlarm(alarm: chrome.alarms.Alarm): void {
  if (alarm.name === SNAPSHOT_ALARM_NAME) {
    createSnapshot();
  }
}

/**
 * Initializes the snapshot manager
 */
export async function initializeSnapshotManager(): Promise<void> {
  // Set up periodic snapshot alarm
  chrome.alarms.create(SNAPSHOT_ALARM_NAME, {
    periodInMinutes: SNAPSHOT_INTERVAL_MINUTES,
    delayInMinutes: SNAPSHOT_INTERVAL_MINUTES
  });

  // Listen for alarms
  chrome.alarms.onAlarm.addListener(handleAlarm);

  // Create initial snapshot
  await createSnapshot();

  console.log('Snapshot manager initialized');
}

/**
 * Stops the snapshot manager
 */
export async function stopSnapshotManager(): Promise<void> {
  await chrome.alarms.clear(SNAPSHOT_ALARM_NAME);
}

/**
 * Forces an immediate snapshot
 */
export async function forceSnapshot(): Promise<void> {
  await createSnapshot();
}