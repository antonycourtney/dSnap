import { StorageData, DisplayConfiguration, Snapshot, WindowLayout } from './types';

const STORAGE_KEY = 'dsnap_data';
const MAX_SNAPSHOTS_PER_CONFIG = 5;

/**
 * Initializes storage with default data
 */
async function initializeStorage(): Promise<StorageData> {
  const defaultData: StorageData = {
    configurations: [],
    snapshots: [],
    currentLayout: null,
    currentConfigId: null
  };

  await chrome.storage.local.set({ [STORAGE_KEY]: defaultData });
  return defaultData;
}

/**
 * Gets all storage data
 */
export async function getStorageData(): Promise<StorageData> {
  const result = await chrome.storage.local.get(STORAGE_KEY);

  if (!result[STORAGE_KEY]) {
    return await initializeStorage();
  }

  return result[STORAGE_KEY] as StorageData;
}

/**
 * Updates storage data
 */
export async function updateStorageData(data: Partial<StorageData>): Promise<void> {
  const current = await getStorageData();
  const updated = { ...current, ...data };
  await chrome.storage.local.set({ [STORAGE_KEY]: updated });
}

/**
 * Saves or updates a display configuration
 */
export async function saveDisplayConfig(config: DisplayConfiguration): Promise<void> {
  const data = await getStorageData();

  const existingIndex = data.configurations.findIndex(c => c.id === config.id);

  if (existingIndex >= 0) {
    data.configurations[existingIndex] = config;
  } else {
    data.configurations.push(config);
  }

  await updateStorageData({ configurations: data.configurations });
}

/**
 * Gets a display configuration by ID
 */
export async function getDisplayConfig(configId: string): Promise<DisplayConfiguration | null> {
  const data = await getStorageData();
  return data.configurations.find(c => c.id === configId) || null;
}

/**
 * Saves a snapshot, enforcing the maximum limit per configuration
 */
export async function saveSnapshot(snapshot: Snapshot): Promise<void> {
  const data = await getStorageData();

  // Get snapshots for this configuration
  const configSnapshots = data.snapshots
    .filter(s => s.configId === snapshot.configId)
    .sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first

  // If we're at the limit, remove the oldest snapshot
  if (configSnapshots.length >= MAX_SNAPSHOTS_PER_CONFIG) {
    const toRemove = configSnapshots.slice(MAX_SNAPSHOTS_PER_CONFIG - 1);
    data.snapshots = data.snapshots.filter(s => !toRemove.includes(s));
  }

  // Add the new snapshot
  data.snapshots.push(snapshot);

  await updateStorageData({ snapshots: data.snapshots });
}

/**
 * Gets snapshots for a specific configuration
 */
export async function getSnapshotsForConfig(configId: string): Promise<Snapshot[]> {
  const data = await getStorageData();
  return data.snapshots
    .filter(s => s.configId === configId)
    .sort((a, b) => b.timestamp - a.timestamp); // Return newest first
}

/**
 * Deletes a snapshot
 */
export async function deleteSnapshot(snapshotId: string): Promise<void> {
  const data = await getStorageData();
  data.snapshots = data.snapshots.filter(s => s.id !== snapshotId);
  await updateStorageData({ snapshots: data.snapshots });
}

/**
 * Updates the current layout
 */
export async function updateCurrentLayout(layout: WindowLayout | null): Promise<void> {
  await updateStorageData({ currentLayout: layout });
}

/**
 * Updates the current configuration ID
 */
export async function updateCurrentConfigId(configId: string | null): Promise<void> {
  await updateStorageData({ currentConfigId: configId });
}

/**
 * Gets all display configurations
 */
export async function getAllConfigurations(): Promise<DisplayConfiguration[]> {
  const data = await getStorageData();
  return data.configurations.sort((a, b) => b.lastSeen - a.lastSeen); // Return most recent first
}

/**
 * Gets all snapshots
 */
export async function getAllSnapshots(): Promise<Snapshot[]> {
  const data = await getStorageData();
  return data.snapshots.sort((a, b) => b.timestamp - a.timestamp); // Return newest first
}

/**
 * Cleans up old configurations that haven't been seen in 30 days
 */
export async function cleanupOldConfigurations(): Promise<void> {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const data = await getStorageData();

  // Find configurations to remove
  const toRemove = data.configurations.filter(c => c.lastSeen < thirtyDaysAgo);
  const toRemoveIds = toRemove.map(c => c.id);

  if (toRemoveIds.length === 0) return;

  // Remove configurations and their snapshots
  data.configurations = data.configurations.filter(c => !toRemoveIds.includes(c.id));
  data.snapshots = data.snapshots.filter(s => !toRemoveIds.includes(s.configId));

  await updateStorageData({
    configurations: data.configurations,
    snapshots: data.snapshots
  });
}