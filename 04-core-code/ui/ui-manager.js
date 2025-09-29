git add 04-core-code/services/ui-service.js 04-core-code/dialog-component.js 04-core-code/main.js 04-core-code/ui/ui-manager.js
git commit -m "fix(ui): Implement welcome dialog for robust panel layout initialization

- Fixed a critical race condition causing the left panel to be misplaced on startup by implementing a welcome dialog.
- The layout calculation for the left panel is now only triggered after the user dismisses the welcome dialog, guaranteeing that the DOM is stable and all element positions are correct.
- Reworked the layout logic in UIManager to use the main table header and keypad keys as reliable measurement anchors.
- Removed all previous, unreliable layout caching and timeout mechanisms."