# Theming

LazySwindle features a robust, dynamic theming engine powered by the AGS shell.

## Custom Themes

You can define custom themes by placing JSON files into `~/.config/ags/themes/`. 

### Creating a Theme File

Create a file such as `catppuccin.json`:

```json
{
    "name": "Catppuccin Mocha",
    "animations": true,
    "gaps": 10,
    "blur": true,
    "borderRadius": 12,
    "colors": {
        "bg": "#1e1e2e",
        "fg": "#cdd6f4",
        "black": "#11111b",
        "red": "#f38ba8",
        "green": "#a6e3a1",
        "yellow": "#f9e2af",
        "blue": "#89b4fa",
        "magenta": "#cba6f7",
        "cyan": "#89dceb",
        "white": "#bac2de"
    }
}
```

### Applying Themes

The LazySwindle Settings App (accessible via the desktop) automatically detects these JSON files. You can cycle through your custom themes or toggle individual features (like blur and animations) directly from the graphical interface. 

When a theme is selected, the Settings App will:
1. Re-compile the SCSS for the shell layer dynamically.
2. Generate a `lazyswindle_theme.lua` file.
3. Trigger a hot-reload in the C compositor to update window gaps and border colors globally.

## Persistent State & Wallpapers

Your active theme, UI toggles (animations, gaps, borders), and your custom **Wallpaper** are all saved persistently to `~/.config/ags/state.json`. When you log in, your desktop background is automatically restored via `swaybg`, and your shell remembers exactly how you configured it!
