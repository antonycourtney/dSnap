dSnap is a small Chrome extension to assist users who frequently switch between different display
configurations (e.g., docking/undocking a laptop, connecting to different monitors).

The problem with switching display configurations is that the OS will often rearrange windows
after it detects a change in the display configuration. When the display configuration is later
restored, the windows that were moved or resized are not always restored to their positions
before the display configuration change.

dSnap helps with this problem by tracking the position and size of all open Chrome windows and associating
this with the current display configuration, and taking periodic snapshots of the window layout for
the current display configuration. When a change in display configuration is detected, dSnap
allows the user to restore a previously saved window layout.

## Technical Specifications

### Window Scope
dSnap tracks only Chrome browser windows, as Chrome extension APIs can only access and control Chrome windows.

### Display Configuration Identity
Display configurations are uniquely identified by:
- Number of displays
- Dimensions of each display
- Relative position of each display
- Primary display designation

### Window Layout Tracking
- The current window layout is updated in real-time whenever windows are created, removed, moved, or resized
- Periodic snapshots of the current layout are automatically taken every minute
- Snapshots are only created for the current display configuration

### Snapshot Retention
- Maximum of 5 snapshots are kept per display configuration
- Older snapshots are automatically deleted when the limit is reached
- Snapshots include timestamp for identification

### Window Restoration
- When applying a snapshot, only windows that still exist are restored to their saved bounds
- Windows that no longer exist are ignored
- New windows not in the snapshot are left unchanged
- Minimized windows are restored to their state as of the snapshot

# Central UI

The main UI of dSnap is a full web page that is opened in a new tab when clicking on the dSnap icon
in the Chrome toolbar. This page shows the current display configuration, and a list of saved
window layouts for the current display configuration.

Display configurations and window layouts are shown visually so that the user can easily
identify the desired display configuration and window layout.
A display configuration is shown as a set of rectangles representing the monitors,
with the primary monitor indicated by a thicker border.
A window layout is shown as a set of rectangles representing the windows,
overlaid on a representation of the display configuration.
Each display configuration and window layout also has a timestamp indicating when it was
last updated.

## Periodic Snapshots

The use of periodic snapshots alleviate a key potential problem: If the display configuration
starts in some configuration A, with window layout L1, and then the user switches to configuration B,
which automatically rearranges the windows to layout L2, and then the user switches back to configuration A but the OS does not restore the windows to layout L1, if we only ever saved the
"current layout" for each configuration, we would have lost layout L1 for configuration A, and would not be able to restore it.
By taking periodic snapshots, we can save multiple layouts for each display configuration,
so that if the user switches back to configuration A, they can choose layout L1 from the list of
saved layouts for configuration A. By storing and displaying the time of each snapshot, we
can help the user identify the desired layout. The UI should support the ability to browse through
snapshots to see the layout, so they can make the right choice of what layout snapshot to apply.

## Cardinality Estimates

It is only expected that there will be at most 3 or 4 different display configurations for a user,
and we maintain up to 5 window layout snapshots per display configuration.

## Rough UI

The UI should be a vertical list of sections for each display configuration.
Each display configuration section should have a left area with a rendering of the
display configuration, and a right area with a vertical list of window layout snapshots identified
by timestamp.
The area for showing a display configuration (and window layout preview) should be about 400x200 pixels.
There should be three operations available for each window layout snapshot:

1. Preview the layout in the area showing the display configuration.
2. Apply the snapshot to restore the window layout.
3. Delete the snapshot.
