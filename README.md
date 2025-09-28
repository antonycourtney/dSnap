# dSnap - Window Layout Manager

A Chrome extension that helps you restore window layouts when switching between different display configurations (e.g., docking/undocking a laptop, connecting to different monitors).

## Features

- **Automatic Display Detection**: Monitors changes in display configuration
- **Periodic Snapshots**: Takes snapshots of window layouts every minute
- **Visual Interface**: Shows display configurations and window layouts visually
- **Smart Storage**: Maintains up to 5 snapshots per display configuration
- **One-Click Restore**: Easily restore previous window layouts

## Installation

### Development/Testing

1. **Build the extension**:
   ```bash
   npm install
   npm run build
   ```

2. **Load in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dist` folder from this project

3. **Test the extension**:
   - Click the dSnap icon in the Chrome toolbar to open the UI
   - Try changing your display configuration (connect/disconnect monitors)
   - See snapshots being created and restore them

### Production Use

For production use, replace the placeholder icon files in the `public` directory with actual PNG icons before building.

## How It Works

### Background Service
- **Display Monitor**: Detects when display configuration changes
- **Window Tracker**: Monitors window creation, movement, and resizing
- **Snapshot Manager**: Creates periodic snapshots every minute
- **Storage Manager**: Manages saved configurations and snapshots

### User Interface
- **Display Visualization**: Shows monitor arrangements visually
- **Snapshot List**: Lists saved snapshots with timestamps
- **Preview Mode**: Preview window layouts before applying
- **One-Click Actions**: Apply or delete snapshots easily

## Technical Details

### Architecture
- **Technology**: TypeScript, React 18, Tailwind CSS, shadcn/ui
- **Build Tool**: Vite
- **Chrome API**: Manifest V3 with system.display, windows, storage, and alarms permissions

### Data Model
- **Display Configurations**: Identified by monitor count, resolution, and positions
- **Window Snapshots**: Store window positions, sizes, and states
- **Storage Limits**: 5 snapshots per configuration, automatic cleanup

### File Structure
```
dist/
├── manifest.json          # Extension configuration
├── background/
│   └── index.js          # Background service worker
├── ui/
│   ├── index.html        # Main UI page
│   └── ui.js            # UI application
├── popup/
│   ├── index.html        # Extension popup
│   └── popup.js         # Popup script
└── icon*.png            # Extension icons
```

## Development

### Prerequisites
- Node.js (compatible with v21.6.1+)
- npm or yarn

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Project Structure
```
src/
├── background/           # Background service worker
├── ui/                  # Main UI application
├── popup/               # Extension popup
├── lib/                 # Shared utilities and types
└── components/          # Reusable UI components
```

## Permissions

The extension requires these Chrome permissions:
- `system.display` - Monitor display configuration changes
- `windows` - Access and control Chrome windows
- `storage` - Store configurations and snapshots locally
- `alarms` - Schedule periodic snapshots

## Privacy

- All data is stored locally in Chrome's storage
- No external network requests are made
- Only Chrome browser windows are tracked (not other applications)
- No sensitive information is collected or transmitted

## Limitations

- Only works with Chrome browser windows (due to Chrome extension API limitations)
- Cannot track windows from other applications
- Requires Chrome extension permissions
- Maximum 5 snapshots per display configuration

## Future Enhancements

- Manual snapshot naming
- Keyboard shortcuts
- Export/import configurations
- Custom snapshot frequencies
- Dark mode support
- Window grouping preservation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.