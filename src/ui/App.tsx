import { useDisplayConfigs } from './hooks/useDisplayConfigs';
import { useSnapshots } from './hooks/useSnapshots';
import { DisplayConfig } from './components/DisplayConfig';
import { SnapshotList } from './components/SnapshotList';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Bug } from 'lucide-react';
import { DisplayConfiguration } from '@/lib/types';
import { useState } from 'react';
import './index.css';

function App() {
  const { configurations, currentConfigId, loading, error, refetch } = useDisplayConfigs();
  const [showDebug, setShowDebug] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-lg text-gray-500">Loading display configurations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-lg text-red-500 mb-4">{error}</div>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (configurations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-lg text-gray-500 mb-4">No display configurations detected yet</div>
          <div className="text-sm text-gray-400">
            Display configurations will appear here when you connect or disconnect monitors
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">dSnap</h1>
              <p className="text-gray-600">
                Manage your window layouts across different display configurations
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
            >
              <Bug className="w-4 h-4 mr-2" />
              Debug
            </Button>
          </div>

          {showDebug && (
            <Card className="mt-4 bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm font-mono">
                  <div>Chrome Runtime: {chrome?.runtime ? '✅ Available' : '❌ Not Available'}</div>
                  <div>Extension ID: {chrome?.runtime?.id || 'Unknown'}</div>
                  <div>Configurations Count: {configurations.length}</div>
                  <div>Current Config ID: {currentConfigId || 'None'}</div>
                  <div>Loading: {loading ? 'Yes' : 'No'}</div>
                  <div>Error: {error || 'None'}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refetch}
                    className="mt-2"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-8">
          {configurations.map((config) => (
            <ConfigurationSection
              key={config.id}
              configuration={config}
              isCurrent={config.id === currentConfigId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ConfigurationSectionProps {
  configuration: DisplayConfiguration;
  isCurrent: boolean;
}

function ConfigurationSection({ configuration, isCurrent }: ConfigurationSectionProps) {
  const { snapshots, loading, applySnapshot, deleteSnapshot } = useSnapshots(configuration.id);

  const handleApply = async (snapshotId: string) => {
    try {
      await applySnapshot(snapshotId);
      // Show success feedback (could add a toast notification here)
    } catch (error) {
      console.error('Failed to apply snapshot:', error);
      // Show error feedback
    }
  };

  const handleDelete = async (snapshotId: string) => {
    if (window.confirm('Are you sure you want to delete this snapshot?')) {
      try {
        await deleteSnapshot(snapshotId);
      } catch (error) {
        console.error('Failed to delete snapshot:', error);
      }
    }
  };

  return (
    <Card className={isCurrent ? 'ring-2 ring-blue-500' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">
              {configuration.displays.length} Display{configuration.displays.length !== 1 ? 's' : ''}
              {isCurrent && (
                <span className="ml-3 text-sm font-normal text-blue-500">
                  (Current Configuration)
                </span>
              )}
            </CardTitle>
            <div className="text-sm text-gray-500 mt-1">
              Last seen: {new Date(configuration.lastSeen).toLocaleString()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-8">
          <div className="flex-shrink-0">
            <DisplayConfig
              configuration={configuration}
              isCurrent={isCurrent}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-4">
              Saved Snapshots ({snapshots.length}/5)
            </h3>
            {loading ? (
              <div className="text-sm text-gray-500">Loading snapshots...</div>
            ) : (
              <SnapshotList
                snapshots={snapshots}
                configuration={configuration}
                onApply={handleApply}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default App;