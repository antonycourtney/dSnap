// Display configuration types
export interface Display {
  id: string;
  bounds: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  isPrimary: boolean;
}

export interface DisplayConfiguration {
  id: string;  // Hash of display properties
  displays: Display[];
  lastSeen: number;  // Timestamp
}

// Window tracking types
export interface TrackedWindow {
  id: number;
  bounds: {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
  };
  state: 'normal' | 'minimized' | 'maximized' | 'fullscreen' | 'locked-fullscreen';
  type: 'normal' | 'popup' | 'panel' | 'app' | 'devtools';
}

export interface WindowLayout {
  windows: TrackedWindow[];
  timestamp: number;
}

// Snapshot types
export interface Snapshot {
  id: string;
  configId: string;
  layout: WindowLayout;
  timestamp: number;
}

// Storage structure
export interface StorageData {
  configurations: DisplayConfiguration[];
  snapshots: Snapshot[];
  currentLayout: WindowLayout | null;
  currentConfigId: string | null;
}

// Message types for communication between background and UI
export type MessageType =
  | 'GET_CONFIGURATIONS'
  | 'GET_SNAPSHOTS'
  | 'APPLY_SNAPSHOT'
  | 'DELETE_SNAPSHOT'
  | 'GET_CURRENT_CONFIG'
  | 'CONFIG_CHANGED'
  | 'SNAPSHOT_CREATED';

export interface Message {
  type: MessageType;
  payload?: any;
}

export interface MessageResponse {
  success: boolean;
  data?: any;
  error?: string;
}