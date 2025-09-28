import { useState, useEffect } from 'react';
import { Snapshot, Message, MessageResponse } from '@/lib/types';

export function useSnapshots(configId?: string) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshots = async () => {
    setLoading(true);
    setError(null);

    const message: Message = {
      type: 'GET_SNAPSHOTS',
      payload: configId ? { configId } : undefined
    };

    try {
      const response = await chrome.runtime.sendMessage(message) as MessageResponse;

      if (response.success) {
        setSnapshots(response.data as Snapshot[]);
      } else {
        setError(response.error || 'Failed to fetch snapshots');
      }
    } catch (err) {
      setError('Failed to communicate with background service');
      console.error('Error fetching snapshots:', err);
    } finally {
      setLoading(false);
    }
  };

  const applySnapshot = async (snapshotId: string) => {
    const message: Message = {
      type: 'APPLY_SNAPSHOT',
      payload: { snapshotId }
    };

    try {
      const response = await chrome.runtime.sendMessage(message) as MessageResponse;

      if (!response.success) {
        throw new Error(response.error || 'Failed to apply snapshot');
      }

      return true;
    } catch (err) {
      console.error('Error applying snapshot:', err);
      throw err;
    }
  };

  const deleteSnapshot = async (snapshotId: string) => {
    const message: Message = {
      type: 'DELETE_SNAPSHOT',
      payload: { snapshotId }
    };

    try {
      const response = await chrome.runtime.sendMessage(message) as MessageResponse;

      if (response.success) {
        // Remove from local state
        setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
      } else {
        throw new Error(response.error || 'Failed to delete snapshot');
      }
    } catch (err) {
      console.error('Error deleting snapshot:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSnapshots();

    // Listen for snapshot updates
    const handleMessage = (message: Message) => {
      if (message.type === 'SNAPSHOT_CREATED') {
        if (!configId || message.payload.snapshot.configId === configId) {
          setSnapshots(prev => [message.payload.snapshot, ...prev].slice(0, 5));
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [configId]);

  return {
    snapshots,
    loading,
    error,
    applySnapshot,
    deleteSnapshot,
    refetch: fetchSnapshots
  };
}