# dSnap Implementation Plan

## Technology Stack

- **Language**: TypeScript
- **UI Framework**: React 18
- **Component Library**: shadcn/ui
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Zustand (lightweight for Chrome extensions)
- **Chrome Extension**: Manifest V3

## Project Structure

```
dSnap/
├── src/
│   ├── background/
│   │   ├── index.ts                 # Service worker entry
│   │   ├── displayMonitor.ts        # Display configuration detection
│   │   ├── windowTracker.ts         # Real-time window tracking
│   │   ├── snapshotManager.ts       # Periodic snapshot logic
│   │   └── messageHandler.ts        # Chrome runtime message handling
│   │
│   ├── ui/
│   │   ├── App.tsx                  # Main UI application
│   │   ├── main.tsx                 # React entry point
│   │   ├── index.html               # UI page HTML
│   │   ├── components/
│   │   │   ├── DisplayConfig.tsx    # Display configuration visualization
│   │   │   ├── SnapshotList.tsx    # List of snapshots for a config
│   │   │   ├── SnapshotPreview.tsx # Window layout preview
│   │   │   └── WindowVisualizer.tsx # Renders windows on display
│   │   ├── hooks/
│   │   │   ├── useSnapshots.ts     # Hook for snapshot management
│   │   │   └── useDisplayConfigs.ts # Hook for display configs
│   │   └── lib/
│   │       └── utils.ts            # Utility functions
│   │
│   ├── popup/
│   │   ├── Popup.tsx               # Minimal popup component
│   │   ├── main.tsx                # Popup entry point
│   │   └── index.html              # Popup HTML
│   │
│   ├── lib/
│   │   ├── storage.ts              # Chrome storage abstraction
│   │   ├── types.ts                # TypeScript type definitions
│   │   ├── displayUtils.ts         # Display configuration utilities
│   │   └── windowUtils.ts          # Window manipulation utilities
│   │
│   └── assets/
│       └── icon/                   # Extension icons
│
├── public/
│   └── manifest.json               # Chrome extension manifest
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── components.json                 # shadcn configuration
└── postcss.config.js
```

## Data Models

### TypeScript Interfaces

```typescript
// Display configuration
interface Display {
  id: string;
  bounds: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  isPrimary: boolean;
}

interface DisplayConfiguration {
  id: string;  // Hash of display properties
  displays: Display[];
  lastSeen: number;  // Timestamp
}

// Window tracking
interface TrackedWindow {
  id: number;
  bounds: chrome.windows.Window['bounds'];
  state: chrome.windows.Window['state'];
  type: chrome.windows.Window['type'];
}

interface WindowLayout {
  windows: TrackedWindow[];
  timestamp: number;
}

// Snapshot
interface Snapshot {
  id: string;
  configId: string;
  layout: WindowLayout;
  timestamp: number;
}

// Storage structure
interface StorageData {
  configurations: DisplayConfiguration[];
  snapshots: Snapshot[];
  currentLayout: WindowLayout | null;
  currentConfigId: string | null;
}
```

## Implementation Phases

### Phase 1: Project Setup & Infrastructure
1. **Initialize project structure**
   - Set up Vite with React and TypeScript
   - Configure Tailwind CSS and shadcn/ui
   - Create Chrome extension manifest V3

2. **Build configuration**
   - Configure Vite for multi-entry points (background, UI, popup)
   - Set up TypeScript paths and aliases
   - Configure development workflow

### Phase 2: Core Background Functionality
1. **Display Monitor (`displayMonitor.ts`)**
   - Implement display configuration detection using `chrome.system.display.getInfo()`
   - Create unique hash for display configurations
   - Detect configuration changes via `chrome.system.display.onDisplayChanged`

2. **Window Tracker (`windowTracker.ts`)**
   - Listen to window events: `chrome.windows.onCreated`, `onRemoved`, `onBoundsChanged`
   - Maintain real-time window layout state
   - Filter for normal browser windows only

3. **Snapshot Manager (`snapshotManager.ts`)**
   - Set up 1-minute interval timer using Chrome alarms API
   - Implement snapshot creation logic
   - Enforce 5-snapshot limit per configuration
   - Handle storage cleanup

4. **Storage Layer (`storage.ts`)**
   - Abstract Chrome storage.local API with TypeScript
   - Implement CRUD operations for configurations and snapshots
   - Handle storage migration if needed

### Phase 3: UI Implementation
1. **shadcn/ui Setup**
   - Install and configure shadcn components
   - Set up needed components: Card, Button, ScrollArea, Tooltip, Alert

2. **Main UI Components**
   - **DisplayConfig Component**: Visual representation of monitor arrangement
   - **SnapshotList Component**: Vertical list with timestamps
   - **SnapshotPreview Component**: Interactive preview on hover
   - **WindowVisualizer Component**: Overlay windows on display config

3. **UI Features**
   - Real-time highlighting of current configuration
   - Snapshot preview on hover
   - Apply/Delete operations with confirmation
   - Responsive 400x200px display visualizations

### Phase 4: Integration & Polish
1. **Message Passing**
   - Implement communication between background and UI
   - Real-time updates when configurations change
   - Snapshot application from UI to background

2. **Error Handling**
   - Graceful handling of permission issues
   - Window restoration failures
   - Storage quota management

3. **Performance Optimization**
   - Debounce window tracking events
   - Optimize display configuration comparison
   - Efficient storage queries

## Key Implementation Details

### Display Configuration Hashing
```typescript
function hashDisplayConfig(displays: chrome.system.display.DisplayInfo[]): string {
  const normalized = displays
    .sort((a, b) => a.bounds.left - b.bounds.left || a.bounds.top - b.bounds.top)
    .map(d => ({
      w: d.bounds.width,
      h: d.bounds.height,
      x: d.bounds.left,
      y: d.bounds.top,
      p: d.isPrimary
    }));
  return JSON.stringify(normalized);
}
```

### Window Restoration Logic
```typescript
async function restoreSnapshot(snapshot: Snapshot) {
  const currentWindows = await chrome.windows.getAll();

  for (const savedWindow of snapshot.layout.windows) {
    const existingWindow = currentWindows.find(w => w.id === savedWindow.id);

    if (existingWindow) {
      await chrome.windows.update(savedWindow.id, {
        left: savedWindow.bounds.left,
        top: savedWindow.bounds.top,
        width: savedWindow.bounds.width,
        height: savedWindow.bounds.height,
        state: savedWindow.state
      });
    }
  }
}
```

### Visualization Scaling
- Calculate scale factor to fit displays within 400x200px
- Maintain aspect ratios
- Show relative positions accurately
- Use color/border to indicate primary display

## Development Workflow

1. **Initial Setup**
   ```bash
   npm create vite@latest . -- --template react-ts
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   npx shadcn-ui@latest init
   npm install zustand chrome-types
   ```

2. **Development Mode**
   - Use Vite dev server for UI development
   - Load unpacked extension in Chrome
   - Use Chrome DevTools for debugging

3. **Build Process**
   ```bash
   npm run build  # Builds all entry points
   ```

## Testing Strategy

1. **Unit Tests**
   - Test display configuration hashing
   - Test snapshot retention logic
   - Test storage operations

2. **Integration Tests**
   - Test message passing between components
   - Test window restoration scenarios
   - Test display change detection

3. **Manual Testing Scenarios**
   - Dock/undock laptop
   - Connect/disconnect external monitors
   - Move windows across displays
   - Test with multiple Chrome profiles

## Security & Permissions

### Required Permissions (manifest.json)
- `system.display` - Monitor display configurations
- `windows` - Access and control Chrome windows
- `storage` - Store configurations and snapshots
- `alarms` - Schedule periodic snapshots

### Security Considerations
- No external network requests
- All data stored locally
- No sensitive information collected
- Minimal permissions requested

## Performance Targets

- Display change detection: < 100ms
- Snapshot creation: < 50ms
- Window restoration: < 500ms for 10 windows
- UI render: < 16ms for smooth interactions
- Storage operations: < 10ms

## Future Enhancements (Post-MVP)

1. **User Preferences**
   - Configurable snapshot frequency
   - Custom snapshot limits
   - Blacklist certain windows

2. **Advanced Features**
   - Manual snapshot naming
   - Keyboard shortcuts
   - Export/import configurations
   - Window grouping preservation

3. **UI Improvements**
   - Dark mode support
   - Animated transitions
   - Drag-and-drop window arrangement
   - Multi-select for bulk operations

## Success Criteria

- ✅ Automatically detects display configuration changes
- ✅ Takes snapshots every minute for current configuration
- ✅ Maintains 5 snapshots per configuration
- ✅ Restores window positions accurately
- ✅ Visual UI for easy configuration identification
- ✅ Preview before applying snapshots
- ✅ Handles edge cases gracefully