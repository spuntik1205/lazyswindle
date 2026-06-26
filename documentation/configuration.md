# Configuration

LazySwindle utilizes a hybrid configuration approach, blending the power of a Lua-based compositor with a dynamically-styled AGS shell.

## Compositor Configuration (`config.lua`)

The Swindle compositor reads its configuration from `~/.config/swindle/config.lua`. This file is watched continuously, meaning changes to it will reload the compositor instantly.

### Input Configuration

You can configure global rules for your touchpad, mouse, and keyboard in the `input` table:

```lua
input = {
    natural_scrolling = false, -- If true, inverts the scrolling direction (Mac-style "natural" scrolling). Default is false.
    tap_to_click = true,       -- If true, allows you to tap the touchpad to register a left click.
}
```

### Autostart Programs

You can run commands or scripts automatically when the compositor boots. This is done via the `autostart` table. For LazySwindle, you must ensure the shell launches here:

```lua
autostart = {
    "ags run",
    "nm-applet",
    "udiskie -t"
}
```

### Window Rules & Floating Mode

LazySwindle supports configuring specific apps to open as floating windows or on specific workspaces. You can define this in the `rules` table:

```lua
rules = {
    -- Force the calculator to always open floating
    { app_id = "org.gnome.Calculator", title = "", floating = true, tags = 0 },
    -- Force pavucontrol to float
    { app_id = "pavucontrol", title = "", floating = true, tags = 0 },
}
```
*Note: You can also toggle floating mode dynamically on any focused window using `logo + Shift + T`!*

### Animations

**UI Animations**: Toggles for the shell UI (the settings app, the bar, hover states, and menus) can be controlled dynamically via the AGS Settings App.

**Window Spawning Animations**: LazySwindle is built on top of `dwl` (a hyper-minimal wlroots library). Because of this architectural choice focusing purely on extreme efficiency and pure tiling, Swindle **does not support native OpenGL window spawning or mapping animations** (like the spring animations seen in Niri or Hyprland). Windows will spawn instantly without delay or fading.

### Keybindings

Please see the [Keybindings Guide](keybindings.md) for full documentation on setting up shortcuts.

## Shell Configuration (AGS)

The shell resides in `~/.config/ags/` (or `~/.config/lazyswindle-shell/`). It handles the visual rendering of the top bar, settings panels, and overall desktop theme. Because it is written in TypeScript, you can modify `main.ts` to add custom widgets, battery modules, or workspaces.
