# Getting Started

Welcome to LazySwindle! This guide will walk you through the installation process to get your new Wayland desktop up and running.

## Prerequisites

Before installing, ensure you have the following **build dependencies** installed on your system (the installer will check for these):
- `pkg-config`
- `wayland-scanner`
- `sassc`
- `make`
- `gcc`
- `lua` (Lua 5.4)

You also need the following **runtime dependencies** for the desktop to function:
- `ags` (Aylur's Gtk Shell) - For the UI, top bar, and settings app.
- `swaybg` - For wallpaper management.
- `ghostty` - For the default terminal (or you can change this in `config.lua`).

## Installation Guide

The provided `install.sh` script automates the entire setup process. It will:
1. Check for required build dependencies.
2. Compile the core Swindle compositor.
3. Optionally install the `swindle` binary to your system and create a `.desktop` file for your Display Manager.
4. Safely deploy the AGS shell configurations and default themes.

To run it:

```bash
git clone https://github.com/yourusername/lazyswindle.git
cd lazyswindle
chmod +x install.sh
./install.sh
```

During the installation, you will be prompted:
`Do you want to install swindle to /usr/local/bin? (y/N)`
- **Press Y** if you want to be able to select LazySwindle from your login screen (SDDM, GDM, etc.). This requires `sudo` privileges.
- **Press N** if you just want to test it locally. You can start it manually later.

## First Launch

To start the desktop environment, switch to a TTY and run:
```bash
swindle
```

You will be greeted by the AGS top bar. Press the predefined shortcut (e.g., `Super + Return`) to open a terminal, or access the Settings App via the top panel to begin customizing your desktop!
