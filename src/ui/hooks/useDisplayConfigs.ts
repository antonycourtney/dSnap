import { useState, useEffect } from 'react';
import { DisplayConfiguration, Message, MessageResponse } from '@/lib/types';

export function useDisplayConfigs() {
  const [configurations, setConfigurations] = useState<DisplayConfiguration[]>([]);
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigurations = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if extension context is available
      if (!chrome?.runtime) {
        throw new Error('Chrome extension context not available');
      }

      // Get all configurations
      const configMessage: Message = { type: 'GET_CONFIGURATIONS' };
      console.log('Sending message:', configMessage);

      const configResponse = await Promise.race([
        chrome.runtime.sendMessage(configMessage),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Message timeout after 5 seconds')), 5000)
        )
      ]);
      console.log('Received config response:', configResponse);

      if (!configResponse) {
        throw new Error('No response from background service - background script may not be loaded');
      }

      const typedConfigResponse = configResponse as MessageResponse;

      if (typedConfigResponse.success) {
        setConfigurations(typedConfigResponse.data as DisplayConfiguration[]);
      } else {
        setError(typedConfigResponse.error || 'Failed to fetch configurations');
        return;
      }

      // Get current configuration
      const currentMessage: Message = { type: 'GET_CURRENT_CONFIG' };
      console.log('Sending current config message:', currentMessage);

      const currentResponse = await Promise.race([
        chrome.runtime.sendMessage(currentMessage),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Current config message timeout after 5 seconds')), 5000)
        )
      ]);
      console.log('Received current config response:', currentResponse);

      if (!currentResponse) {
        console.warn('No response for current config, continuing...');
        return;
      }

      const typedCurrentResponse = currentResponse as MessageResponse;

      if (typedCurrentResponse.success) {
        setCurrentConfigId(typedCurrentResponse.data.configId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to communicate with background service: ${errorMessage}`);
      console.error('Error fetching configurations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Give background script time to initialize
    const initTimeout = setTimeout(() => {
      fetchConfigurations();
    }, 500);

    // Listen for configuration changes
    const handleMessage = (message: Message) => {
      if (message.type === 'CONFIG_CHANGED') {
        setCurrentConfigId(message.payload.configId);
        fetchConfigurations(); // Refresh all configurations
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      clearTimeout(initTimeout);
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  return {
    configurations,
    currentConfigId,
    loading,
    error,
    refetch: fetchConfigurations
  };
}