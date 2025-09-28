import { initializeDisplayMonitor, restoreCurrentConfigId } from './displayMonitor';
import { initializeWindowTracker, restoreCurrentLayout } from './windowTracker';
import { initializeSnapshotManager } from './snapshotManager';
import { initializeMessageHandler } from './messageHandler';
import { cleanupOldConfigurations } from '@/lib/storage';

// Track initialization state
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Initializes the background service worker
 */
async function initialize(): Promise<void> {
  if (isInitialized) {
    console.log('dSnap background service already initialized');
    return;
  }

  if (initializationPromise) {
    console.log('dSnap background service initialization in progress, waiting...');
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('Initializing dSnap background service...');

      // Initialize message handler first so UI can communicate
      initializeMessageHandler();
      console.log('Message handler initialized');

      // Restore state from storage
      await restoreCurrentConfigId();
      await restoreCurrentLayout();
      console.log('State restored from storage');

      // Initialize components
      await initializeDisplayMonitor();
      console.log('Display monitor initialized');

      await initializeWindowTracker();
      console.log('Window tracker initialized');

      await initializeSnapshotManager();
      console.log('Snapshot manager initialized');

      // Clean up old configurations periodically
      cleanupOldConfigurations();

      // Schedule cleanup every 24 hours
      setInterval(() => {
        cleanupOldConfigurations();
      }, 24 * 60 * 60 * 1000);

      isInitialized = true;
      console.log('dSnap background service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize dSnap:', error);
      initializationPromise = null; // Allow retry
      throw error;
    }
  })();

  return initializationPromise;
}

// Initialize when the service worker starts
initialize();

// Handle extension icon clicks - open UI page
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('ui/index.html')
  });
});