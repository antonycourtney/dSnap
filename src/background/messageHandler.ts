import { Message, MessageResponse } from '@/lib/types';
import { restoreWindowLayout } from '@/lib/windowUtils';
import {
  getAllConfigurations,
  getAllSnapshots,
  getSnapshotsForConfig,
  deleteSnapshot,
  getStorageData
} from '@/lib/storage';
import { getCurrentConfigId } from './displayMonitor';

/**
 * Handles messages from the UI
 */
export function handleMessage(
  message: Message,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: MessageResponse) => void
): boolean {
  console.log('Received message:', message.type, 'with payload:', message.payload);

  // Handle async operations
  (async () => {
    try {
      switch (message.type) {
        case 'GET_CONFIGURATIONS': {
          console.log('Handling GET_CONFIGURATIONS');
          const configurations = await getAllConfigurations();
          console.log('Found configurations:', configurations.length);
          sendResponse({
            success: true,
            data: configurations
          });
          break;
        }

        case 'GET_SNAPSHOTS': {
          console.log('Handling GET_SNAPSHOTS');
          if (message.payload?.configId) {
            const snapshots = await getSnapshotsForConfig(message.payload.configId);
            sendResponse({
              success: true,
              data: snapshots
            });
          } else {
            const snapshots = await getAllSnapshots();
            sendResponse({
              success: true,
              data: snapshots
            });
          }
          break;
        }

        case 'APPLY_SNAPSHOT': {
          console.log('Handling APPLY_SNAPSHOT');
          const { snapshotId } = message.payload;
          const snapshots = await getAllSnapshots();
          const snapshot = snapshots.find(s => s.id === snapshotId);

          if (snapshot) {
            await restoreWindowLayout(snapshot.layout);
            sendResponse({
              success: true,
              data: { message: 'Snapshot applied successfully' }
            });
          } else {
            sendResponse({
              success: false,
              error: 'Snapshot not found'
            });
          }
          break;
        }

        case 'DELETE_SNAPSHOT': {
          console.log('Handling DELETE_SNAPSHOT');
          const { snapshotId } = message.payload;
          await deleteSnapshot(snapshotId);
          sendResponse({
            success: true,
            data: { message: 'Snapshot deleted successfully' }
          });
          break;
        }

        case 'GET_CURRENT_CONFIG': {
          console.log('Handling GET_CURRENT_CONFIG');
          const configId = getCurrentConfigId();
          const data = await getStorageData();
          sendResponse({
            success: true,
            data: {
              configId,
              configuration: data.configurations.find(c => c.id === configId) || null
            }
          });
          break;
        }

        default:
          console.error('Unknown message type:', message.type);
          sendResponse({
            success: false,
            error: `Unknown message type: ${message.type}`
          });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })();

  return true; // Will respond asynchronously
}

/**
 * Initializes the message handler
 */
export function initializeMessageHandler(): void {
  // Remove any existing listeners to avoid duplicates
  if (chrome.runtime.onMessage.hasListener(handleMessage)) {
    chrome.runtime.onMessage.removeListener(handleMessage);
  }

  chrome.runtime.onMessage.addListener(handleMessage);
  console.log('Message handler initialized and listening for messages');

  // Test the handler is working
  console.log('Message handler test: listener count =', chrome.runtime.onMessage.hasListener(handleMessage));
}