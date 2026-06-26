<div align="center">
  <img src="logo-nobg.png" alt="LazySwindle Logo" width="200" />
  <h1>LazySwindle</h1>
  <p><b>The cohesive, stunning, and lazy Wayland ecosystem.</b></p>
</div>

---

LazySwindle is a comprehensive Wayland desktop ecosystem, evolving from a fork of the [Swindle](https://github.com/kantiankant/swindle) compositor (which in turn was a fork of `dwl`). It transforms a barebones wlroots compositor into a visually breathtaking, fully-featured, and highly configurable desktop experience right out of the box.

## Screenshots

*(Replace these placeholders with your actual screenshots)*

| Main Menu & Quick Toggles |
| :---: |
| `![Main Menu](https://github.com/spuntik1205/lazyswindle/main-menu.png)` |

| Settings Panel | Logout UI |
| :---: | :---: |
| `![Settings](https://github.com/spuntik1205/lazyswindle/settings.png)` | `![Logout Overlay](https://github.com/spuntik1205/lazyswindle/blob/main/logout-ui.png)` |

## Features

-  **Dynamic AGS Shell:** A sleek, fully integrated shell written in TypeScript (powered by Aylur's Gtk Shell). Features a stunning top bar, dynamic system info, a highly customizable settings panel, and a built-in Application Launcher.
-  **Unified Main Menu:** A centralized hub combining your user profile, media player, and highly responsive Quick Toggles for Wi-Fi and Bluetooth.
-  **Functional Toggles:** Wi-Fi and Bluetooth toggles are fully wired directly into your system's `nmcli` and `rfkill` for 100% reliable hardware control.
-  **Sleek Logout Overlay:** A massive, beautiful fullscreen logout modal with clean iconography for power management.
-  **Persistent Wallpapers:** Any wallpaper set via the shell is securely saved to your state and fully restored across reboots via `swaybg`.
-  **On-The-Fly Theming:** No more restarting or recompiling your compositor. Toggle gaps, animations, window borders, and blur dynamically through the graphical Settings App.
-  **Live Config Reloads:** The compositor watches for changes to its Lua configuration (`config.lua`) and applies layout and appearance updates instantly.
-  **Nix Flake Support:** Reproducible builds and setups out of the box using `flake.nix`.

## Default Keybindings

LazySwindle comes with a heavily optimized set of default keybindings utilizing the `Logo` (Super) key:

### Applications
- `Logo + T`: Open Ghostty (Terminal)
- `Logo + D`: Open Application Launcher
- `Logo + Space` / `Logo + Comma`: Open Settings App

### Window Management
- `Logo + Q`: Close current window
- `Logo + Shift + T`: Toggle Floating mode
- `Logo + Shift + F`: Toggle Fullscreen
- `Logo + Arrows`: Change Window Focus (Niri-style direction)
- `Logo + Shift + Arrows`: Move Window (Niri-style direction)

### Workspaces
- `Logo + [1-9]`: Switch to Workspace 1-9
- `Logo + Shift + [1-9]`: Move Window to Workspace 1-9

### System
- `Print`: Select an area to Screenshot
- `Shift + Print`: Screenshot entire screen
- `Logo + Shift + E`: Quit / Restart Compositor

## Architecture

The ecosystem is split into two primary components:
1. `compositor/`: The core Wayland compositor (a modified `swindle` fork using `wlroots`).
2. `shell/`: The graphical user interface, widgets, and settings app (built with AGS).

For more detailed technical overviews, see the [`documentation/`](documentation/) directory.

## Installation

We provide an interactive installer that checks dependencies, builds the compositor, and installs the configurations:

```bash
git clone https://github.com/spuntik1205/lazyswindle.git
cd lazyswindle
./install.sh
```

Alternatively, if you use NixOS:
```bash
nix flake update
sudo nixos-rebuild switch --flake .#default
```

## Licensing

LazySwindle is distributed under the GNU General Public License (see [LICENSE](LICENSE)). 
Since LazySwindle is built upon several incredible open-source projects, we also distribute their respective licenses, including `LICENSE.mangowm` (which Swindle utilized for `ext-workspaces`), dwl, wlroots, and tinywl. See the `compositor/licenses/` directory for full details.
