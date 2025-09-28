# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

dSnap is a Chrome extension that helps users restore window layouts when switching between different display configurations (e.g., docking/undocking a laptop). It automatically takes periodic snapshots of window positions and sizes, associating them with the current display configuration.

## Development Setup

### Chrome Extension Development
```bash
# Load unpacked extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked" and select the project directory
```

### Build and Development Commands
```bash
# Install dependencies (once package.json exists)
npm install

# Build the extension
npm run build

# Watch for changes during development
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Architecture

### Chrome Extension Structure
- `manifest.json` - Extension configuration, permissions, and entry points
- `background.js` - Background service worker for monitoring display changes and managing snapshots
- `popup/` - Extension popup UI (minimal, mainly opens main UI)
- `ui/` - Main UI page for managing display configurations and window layouts
- `content/` - Content scripts if needed for window manipulation

### Key Components

1. **Display Configuration Detector** - Monitors `chrome.system.display` API for configuration changes
2. **Window Snapshot Manager** - Periodically captures window positions using `chrome.windows` API
3. **Storage Manager** - Manages saved configurations and snapshots using `chrome.storage.local`
4. **UI Renderer** - Visualizes display configurations and window layouts

### Chrome APIs Required
- `chrome.system.display` - Detect display configuration changes
- `chrome.windows` - Get and set window positions
- `chrome.storage.local` - Store configurations and snapshots
- `chrome.tabs` - Create UI tab when extension icon is clicked

### Data Model
- Display configurations: Identified by monitor arrangement (count, resolution, position)
- Window snapshots: Window positions/sizes with timestamps, linked to display configurations
- Storage limit: ~3-4 display configurations, ~3 snapshots per configuration

## UI Implementation Notes

- Main UI opens in a new tab (not a popup)
- Visual representation of display configurations (~400x200px)
- Vertical list layout with display configs on left, snapshots on right
- Snapshot operations: Preview, Apply, Delete
- Use timestamps to identify snapshots