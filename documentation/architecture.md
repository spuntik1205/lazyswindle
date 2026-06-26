# Architecture

Welcome to the LazySwindle documentation.

## Core Concepts

LazySwindle splits the Wayland desktop into two halves:
1. **The Compositor**: Handles rendering, input, and Wayland protocol implementation. Built in C using wlroots.
2. **The Shell**: Handles the top panel, launcher, OSDs, and the Settings Application. Built in TypeScript using AGS.

## How Dynamic Toggles Work

The shell uses AGS to display interactive toggles (such as "Toggle Animations" and "Toggle Gaps & Corners").
When clicked, the shell does two things:
- It regenerates its own `style.scss` file and hot-reloads its CSS to apply blur or transition changes to UI widgets.
- It writes out a new `lazyswindle_theme.lua` file, then touches the compositor's main `config.lua`. The compositor uses a file watcher (`wl_event_source`) to detect this update, immediately parsing the new Lua values and updating window gaps/borders without restarting!

## Deeper Custom IPC (Window Animations)

To handle complex, real-time effects like sliding window animations, LazySwindle uses an advanced custom IPC mechanism. While the Lua file watcher (`config_watch_start`) handles static variables (like border colors and gap sizes), real-time compositor events and geometry changes are transmitted instantly via Unix Domain Sockets or Wayland protocols.

## 3. The `wlr_scene` Graph API

Wayland compositors handle a lot of heavy lifting regarding surface rendering. Swindle offloads this to `wlr_scene`, a powerful API within `wlroots` that allows compositors to construct a tree of surfaces (a scene graph). `wlr_scene` automatically tracks damage (which parts of the screen need to be redrawn) and handles the actual rendering loop to the DRM backend.

### Architectural Limitations & Animations

Because Swindle is a pure tiling compositor derived from `dwl` and relies natively on `wlr_scene` for maximum performance and minimalism, it **does not include a complex OpenGL animation engine for window mapping**. 

Unlike compositors such as Hyprland or Niri, which intercept rendering to apply shader-based spring animations when windows spawn or close, Swindle maps windows instantaneously. Animations are exclusively restricted to the AGS UI shell (which handles its own GTK CSS transitions). This trade-off ensures Swindle remains under 4000 lines of C code, offering unparalleled speed and stability.

## 4. Customizing Swindle

The core of Swindle's customization lies entirely in its Lua interface. Because the Lua state is re-evaluated and structurally separated from the Wayland event loop, users can rewrite layouts, modify inputs, or drastically alter the appearance without a single frame drop or crash.

## Theme Engine

LazySwindle includes a powerful JSON-based theme engine. Instead of hardcoding colors, the AGS shell dynamically reads `.json` themes from `~/.config/lazyswindle/themes/`. 

- **Pre-built Themes:** It comes with A very sexy blue theme out of box.
- **Dynamic Hex Parsing:** The engine automatically converts standard web hex colors (`#1a1b26`) to the RGB floating-point arrays (`{0.1, 0.1, 0.14, 1.0}`) required by the wlroots C compositor.
