import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Utils from 'resource:///com/github/Aylur/ags/utils.js';
import Variable from 'resource:///com/github/Aylur/ags/variable.js';
import Applications from 'resource:///com/github/Aylur/ags/service/applications.js';
import Audio from 'resource:///com/github/Aylur/ags/service/audio.js';
import Mpris from 'resource:///com/github/Aylur/ags/service/mpris.js';
import Network from 'resource:///com/github/Aylur/ags/service/network.js';
import Bluetooth from 'resource:///com/github/Aylur/ags/service/bluetooth.js';
const THEMES_DIR = "/home/spuntik/.config/ags/themes";

const STATE_FILE = `${App.configDir}/state.json`;

let state = {
    themeName: "catppuccin",
    colors: {
        bg: "#1a1b26",
        fg: "#c0caf5",
        black: "#15161e",
        red: "#f7768e",
        green: "#9ece6a",
        yellow: "#e0af68",
        blue: "#7aa2f7",
        magenta: "#bb9af7",
        cyan: "#7dcfff",
        white: "#a9b1d6",
    },
    gaps: 10,
    borderRadius: 12,
    blur: true,
    animations: true,
    borderWidth: 2,
    wallpaperPath: "",
};

try {
    const content = Utils.readFile(STATE_FILE);
    const parsed = JSON.parse(content);
    state = { ...state, ...parsed };
} catch (e) {
    // defaults
}

if (state.wallpaperPath) {
    Utils.execAsync(['sh', '-c', `pkill swaybg; swaybg -i "${state.wallpaperPath}" -m fill &`]).catch(e => console.error(e));
}

function saveState() {
    Utils.writeFile(JSON.stringify(state, null, 2), STATE_FILE).catch(e => console.error(e));
}

const asciiArt = `
██╗      █████╗ ███████╗██╗   ██╗███████╗██╗    ██╗██╗███╗   ██╗██████╗ ██╗     ███████╗        Z
██║     ██╔══██╗╚══███╔╝╚██╗ ██╔╝██╔════╝██║    ██║██║████╗  ██║██╔══██╗██║     ██╔════╝     Z
██║     ███████║  ███╔╝  ╚████╔╝ ███████╗██║ █╗ ██║██║██╔██╗ ██║██║  ██║██║     █████╗    z
██║     ██╔══██║ ███╔╝    ╚██╔╝  ╚════██║██║███╗██║██║██║╚██╗██║██║  ██║██║     ██╔══╝  z
███████╗██║  ██║███████╗   ██║   ███████║╚███╔███╔╝██║██║ ╚████║██████╔╝███████╗███████╗
╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝ ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝
`;

function hexToRGB(hex) {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return `{${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)}, 1.0}`;
}

const time = Variable('', {
    poll: [1000, 'date "+%H:%M"'],
});

const bigTime = Variable('', {
    poll: [1000, 'date "+%H:%M:%S"'],
});

const Clock = () => Widget.Button({
    on_clicked: () => App.toggleWindow('clock'),
    class_name: "volume-btn",
    child: Widget.Label({
        label: time.bind(),
    })
});

const VolumeIndicator = () => Widget.Button({
    on_clicked: () => App.toggleWindow('volume'),
    class_name: "volume-btn",
    child: Widget.Box({
        spacing: 12,
        children: [
            Widget.Label().hook(Audio, self => {
                const vol = Audio.speaker ? Math.round(Audio.speaker.volume * 100) : 0;
                self.label = Audio.speaker?.is_muted ? "󰖁" : (vol > 50 ? "" : "");
            }, 'speaker-changed'),
            Widget.Label().hook(Audio, self => {
                const vol = Audio.speaker ? Math.round(Audio.speaker.volume * 100) : 0;
                self.label = `${vol}%`;
            }, 'speaker-changed'),
        ]
    })
});

const RealWorkspaces = () => {
    const wsLabel = Widget.Label({
        class_name: "active-workspace",
        label: "1",
    });

    Utils.interval(100, () => {
        Utils.execAsync(['sh', '-c', 'cat /tmp/lazyswindle_workspace 2>/dev/null | tr -d "\\n"'])
            .then(out => {
                if (out && out.trim() !== "") {
                    wsLabel.label = out.trim();
                }
            })
            .catch(() => {});
    });

    return Widget.Box({
        class_name: "workspaces",
        children: [wsLabel]
    });
};

const Bar = (monitor) => Widget.Window({
    monitor,
    name: `bar${monitor}`,
    anchor: ['top', 'left', 'right'],
    exclusivity: 'exclusive',
    child: Widget.CenterBox({
        class_name: "bar-inner",
        start_widget: Widget.Box({
            children: [
                Widget.Button({
                    class_name: "logo-btn",
                    vpack: "center",
                    on_clicked: () => App.toggleWindow('mainmenu'),
                    child: Widget.Label({
                        class_name: "logo",
                        label: "LazySwindle",
                    })
                })
            ]
        }),
        center_widget: Widget.Box({
            hpack: "center",
            children: [
                RealWorkspaces()
            ]
        }),
        end_widget: Widget.Box({
            hpack: "end",
            spacing: 15,
            children: [
                VolumeIndicator(),
                Clock()
            ],
        }),
    }),
});

function loadThemeFile(filename) {
    try {
        const content = Utils.readFile(`${THEMES_DIR}/${filename}`);
        const parsed = JSON.parse(content);
        state = { ...state, ...parsed };
        updateTheme();
    } catch (e) {
        console.error("Failed to load theme:", e);
    }
}

const KEYBINDS_TEXT = `
Logo+T: Terminal (Ghostty)
Logo+Space: Settings
Logo+Q: Close Window
Logo+Shift+T: Toggle Floating
Logo+Shift+F: Toggle Fullscreen
Logo+Shift+E: Quit LazySwindle

Logo+Arrows: Switch Window Focus
Logo+Shift+Arrows: Move Window

Logo+1-9: Switch Workspace
Logo+Shift+1-9: Move Window to Workspace
`;

const SettingsApp = () => {
    const activeTab = Variable("general");

    const Sidebar = Widget.Box({
        vertical: true,
        class_name: "settings-sidebar",
        children: [
            Widget.Button({
                class_name: activeTab.bind().as(v => v === "general" ? "active sidebar-btn" : "sidebar-btn"),
                on_clicked: () => activeTab.value = "general",
                child: Widget.Label("󰒓 General")
            }),
            Widget.Button({
                class_name: activeTab.bind().as(v => v === "wallpaper" ? "active sidebar-btn" : "sidebar-btn"),
                on_clicked: () => activeTab.value = "wallpaper",
                child: Widget.Label("󰸉 Wallpaper")
            }),
            Widget.Button({
                class_name: activeTab.bind().as(v => v === "keybinds" ? "active sidebar-btn" : "sidebar-btn"),
                on_clicked: () => activeTab.value = "keybinds",
                child: Widget.Label("󰌌 Keybinds")
            })
        ]
    });

    const GeneralTab = Widget.Box({
        vertical: true,
        spacing: 15,
        children: [
            Widget.Box({
                class_name: "ascii-art",
                child: Widget.Label({
                    label: asciiArt,
                    justification: "left",
                })
            }),
            Widget.Label({ label: "Appearance", class_name: "section-title" }),
            Widget.Box({
                vertical: true,
                spacing: 10,
                children: [
                    Widget.Button({ on_clicked: () => { state.animations = !state.animations; updateTheme(); }, child: Widget.Label("Toggle UI Animations") }),
                    Widget.Button({ on_clicked: () => { state.gaps = state.gaps === 10 ? 0 : 10; updateTheme(); }, child: Widget.Label("Toggle Gaps") }),
                    Widget.Button({ on_clicked: () => { state.borderRadius = state.borderRadius === 12 ? 0 : 12; updateTheme(); }, child: Widget.Label("Toggle UI Corners") }),
                    Widget.Button({ on_clicked: () => { state.gaps = 10; state.borderRadius = 12; state.animations = true; updateTheme(); }, child: Widget.Label("Reset All Appearance Defaults") })
                ]
            })
        ]
    });

    const WallpaperTab = Widget.Box({
        vertical: true,
        spacing: 15,
        children: [
            Widget.Label({ label: "Wallpaper Management", class_name: "section-title" }),
            Widget.Label({ label: "Enter absolute path to an image:", justification: "left" }),
            Widget.Entry({
                placeholder_text: "/home/spuntik/Pictures/wallpaper.jpg",
                on_accept: ({ text }) => {
                    if (text) {
                        state.wallpaperPath = text;
                        saveState();
                        Utils.execAsync(['sh', '-c', `pkill swaybg; swaybg -i "${text}" -m fill &`]).catch(console.error);
                    }
                }
            })
        ]
    });

    const KeybindsTab = Widget.Box({
        vertical: true,
        spacing: 15,
        children: [
            Widget.Label({ label: "LazySwindle Defaults", class_name: "section-title" }),
            Widget.Label({
                label: KEYBINDS_TEXT,
                justification: "left",
                class_name: "keybinds-text"
            })
        ]
    });

    const ContentStack = Widget.Stack({
        transition: "slide_left_right",
        shown: activeTab.bind(),
        children: {
            "general": GeneralTab,
            "wallpaper": WallpaperTab,
            "keybinds": KeybindsTab,
        }
    });

    return Widget.Window({
        name: 'settings',
        keymode: 'exclusive',
        setup: self => self.keybind("Escape", () => App.closeWindow('settings')),
        visible: false,
        child: Widget.Box({
            class_name: "settings-window",
            children: [
                Sidebar,
                Widget.Box({ class_name: "settings-divider" }),
                Widget.Box({
                    class_name: "settings-content",
                    hexpand: true,
                    child: ContentStack
                })
            ]
        })
    });
};

function updateTheme() {
    const scss = `
$bg: ${state.colors.bg};
$fg: ${state.colors.fg};
$black: ${state.colors.black};
$red: ${state.colors.red};
$green: ${state.colors.green};
$yellow: ${state.colors.yellow};
$blue: ${state.colors.blue};
$magenta: ${state.colors.magenta};
$cyan: ${state.colors.cyan};
$white: ${state.colors.white};

* {
    all: unset;
    font-family: "Inter", "Roboto", sans-serif;
    color: $fg;
}

window { background-color: transparent; }

.logo-btn {
    background: transparent;
    border: none;
    padding: 0;
}
.logo-btn:hover .logo {
    color: $cyan;
}
.logo { color: $blue; font-weight: bold; padding: 0 10px; transition: all 0.3s ease; }

.volume-btn {
    background-color: transparent;
    border: none;
    color: $blue;
    padding: 0 10px;
    font-weight: bold;
}
.volume-btn label, .volume-btn image {
    color: $blue;
}
.volume-btn:hover {
    color: $cyan;
}
.bar-inner {
    padding: 4px 10px;
}

.active-workspace {
    background-color: transparent;
    color: $blue;
    font-weight: bold;
    padding: 0;
}
.workspaces { padding: 2px; }

.settings-window {
    background-color: rgba($bg, 0.98);
    border: 2px solid $blue;
    border-radius: ${state.borderRadius}px;
    padding: 0;
    box-shadow: none;
    transition: ${state.animations ? 'all 0.3s ease' : 'none'};
}

.profile-box {
    padding: 10px;
    background-color: rgba($bg, 0.5);
    border-radius: 12px;
}
.profile-avatar-icon {
    background-color: $blue;
    color: $bg;
    padding: 10px;
    border-radius: 100%;
}
.profile-name {
    font-weight: bold;
    font-size: 16px;
    color: $fg;
}
.profile-uptime {
    font-size: 12px;
    color: rgba($fg, 0.7);
}
.power-btn {
    background-color: transparent;
    color: $red;
    border: none;
    min-width: 40px;
    min-height: 40px;
    padding: 0;
}
.power-btn:hover {
    color: rgba($red, 0.7);
}
.quick-toggles {
    padding: 10px 0;
}
.toggle-btn {
    background-color: rgba($bg, 0.5);
    border: 1px solid rgba($fg, 0.1);
    border-radius: 12px;
    min-width: 60px;
    min-height: 50px;
    color: $fg;
}
.toggle-btn.active {
    background-color: rgba($blue, 0.2);
    border-color: $blue;
    color: $blue;
}
.toggle-btn:hover {
    background-color: rgba($fg, 0.1);
}
.media-player {
    background-color: rgba($bg, 0.5);
    border-radius: 12px;
    padding: 15px;
}
.media-title {
    font-weight: bold;
    font-size: 14px;
}
.media-artist {
    font-size: 12px;
    color: rgba($fg, 0.7);
    margin-bottom: 10px;
}

.logout-overlay {
    background-color: rgba($bg, 0.95);
    border-radius: 24px;
    border: 2px solid rgba($fg, 0.1);
    padding: 40px;
}
.logout-btn {
    background-color: rgba($bg, 0.95);
    border: 2px solid rgba($fg, 0.1);
    border-radius: 24px;
    padding: 40px 30px;
    min-width: 140px;
    transition: all 0.3s ease;
    color: $fg;
}
.logout-btn label {
    font-size: 16px;
    font-weight: bold;
    margin-top: 10px;
}
.logout-btn:hover {
    background-color: rgba($red, 0.1);
    border-color: $red;
    color: $red;
}
.logout-btn.lock:hover {
    background-color: rgba($yellow, 0.1);
    border-color: $yellow;
    color: $yellow;
}
.logout-btn.sleep:hover {
    background-color: rgba($blue, 0.1);
    border-color: $blue;
    color: $blue;
}
.logout-btn.logout:hover {
    background-color: rgba($green, 0.1);
    border-color: $green;
    color: $green;
}

.settings-sidebar {
    padding: 20px;
    background-color: rgba($black, 0.4);
    border-radius: ${state.borderRadius}px 0 0 ${state.borderRadius}px;
    min-width: 150px;
}

.settings-sidebar button {
    background-color: transparent;
    color: $fg;
    padding: 12px;
    margin-bottom: 5px;
    border-radius: 6px;
    border: none;
    transition: ${state.animations ? 'all 0.2s' : 'none'};
}
.settings-sidebar button:hover { background-color: rgba($white, 0.1); }
.settings-sidebar button.active {
    color: $blue;
    font-weight: bold;
    border: 1px solid $blue;
}

.settings-divider { min-width: 1px; background-color: $blue; opacity: 0.3; }

.settings-content { padding: 30px; }

.section-title, .settings-header {
    font-size: 20px;
    font-weight: bold;
    color: $blue;
    margin-bottom: 15px;
}

.ascii-art label {
    font-family: "JetBrainsMono Nerd Font", monospace;
    color: $blue;
    font-size: 10px;
}

button {
    background-color: transparent;
    border: 1px solid $blue;
    color: $fg;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: normal;
    transition: ${state.animations ? 'all 0.2s' : 'none'};
}
button:hover {
    color: $blue;
    background-color: rgba($blue, 0.1);
}

entry {
    background-color: transparent;
    color: $fg;
    border: none;
    border-bottom: 2px solid $blue;
    padding: 10px;
}
entry:focus { border-bottom: 2px solid $magenta; }

.launcher-window {
    min-width: 400px;
}

.app-list {
    min-height: 300px;
}

.app-item {
    background-color: transparent;
    border: none;
    padding: 10px;
}

.app-item:hover {
    background-color: rgba($blue, 0.1);
    color: $blue;
}

scale { padding: 10px 0; }
scale trough {
    background-color: rgba($fg, 0.2);
    border-radius: 10px;
    min-height: 8px;
}
scale highlight {
    background-color: $blue;
    border-radius: 10px;
}
scale slider {
    background-color: $fg;
    min-width: 16px;
    min-height: 16px;
    border-radius: 100%;
    margin: -4px 0;
}

calendar {
    color: $fg;
    padding: 10px;
}
calendar:selected {
    background-color: $blue;
    color: $bg;
    border-radius: 6px;
}

.keybinds-text {
    font-family: monospace;
}
    `;
    Utils.writeFile(scss, `${App.configDir}/style.scss`);
    Utils.exec(`sassc ${App.configDir}/style.scss ${App.configDir}/style.css`);
    App.resetCss();
    App.applyCss(`${App.configDir}/style.css`);
    
    // Generate lazyswindle_theme.lua for Swindle compositor
    const configHome = Utils.exec('sh -c "echo ${XDG_CONFIG_HOME:-$HOME/.config}"');
    const luaTheme = `
return {
    gaps = ${state.gaps},
    border_px = 2,
    focus_color = ${hexToRGB(state.colors.blue)},
    urgent_color = ${hexToRGB(state.colors.red)},
    border_color = ${hexToRGB(state.colors.black)},
    root_color = ${hexToRGB(state.colors.bg)},
}
    `;
    Utils.exec(`mkdir -p ${configHome}/swindle`);
    Utils.writeFile(luaTheme, `${configHome}/swindle/lazyswindle_theme.lua`);
    // Touch config.lua to trigger compositor live reload
    Utils.exec(`touch ${configHome}/swindle/config.lua`);
    
    saveState();
}

updateTheme();

const AppItem = (app) => Widget.Button({
    on_clicked: () => {
        App.closeWindow('launcher');
        app.launch();
    },
    class_name: "app-item",
    child: Widget.Box({
        spacing: 10,
        children: [
            Widget.Icon({
                icon: app.icon_name || "",
                size: 32,
            }),
            Widget.Label({
                class_name: "app-title",
                label: app.name,
                xalign: 0,
                vpack: "center",
                truncate: "end",
            }),
        ],
    }),
});

const AppLauncher = () => {
    const list = Widget.Box({
        vertical: true,
        spacing: 5,
    });

    const repopulate = () => {
        const apps = Applications.query("");
        list.children = apps.map(AppItem);
    };

    const entry = Widget.Entry({
        placeholder_text: "Search apps...",
        on_change: ({ text }) => {
            const apps = Applications.query(text || "");
            list.children = apps.map(AppItem);
        },
        on_accept: () => {
            const results = Applications.query(entry.text || "");
            if (results[0]) {
                App.closeWindow("launcher");
                results[0].launch();
            }
        },
    });

    return Widget.Window({
        name: 'launcher',
        keymode: 'exclusive',
        setup: self => self
            .keybind("Escape", () => App.closeWindow('launcher'))
            .on("notify::visible", () => {
                if (self.visible) {
                    repopulate();
                    entry.text = "";
                    entry.grab_focus();
                }
            }),
        visible: false,
        child: Widget.Box({
            class_name: "settings-window launcher-window",
            vertical: true,
            spacing: 15,
            children: [
                Widget.Label({ label: "Application Launcher", class_name: "section-title" }),
                entry,
                Widget.Scrollable({
                    hscroll: "never",
                    class_name: "app-list",
                    child: list,
                }),
            ]
        })
    });
};

const ClockMenu = () => {
    return Widget.Window({
        name: 'clock',
        keymode: 'exclusive',
        setup: self => self.keybind("Escape", () => App.closeWindow('clock')),
        visible: false,
        anchor: ['top', 'right'],
        margins: [10, 10, 0, 0],
        child: Widget.Box({
            class_name: "settings-window",
            vertical: true,
            spacing: 15,
            css: "padding: 20px;",
            children: [
                Widget.Label({
                    class_name: "settings-header",
                    css: "font-size: 36px; margin-bottom: 5px; margin-top: 10px;",
                    label: bigTime.bind(),
                }),
                Widget.Calendar({
                    showDayNames: true,
                    showHeading: true,
                })
            ]
        })
    });
};

const VolumeMenu = () => Widget.Window({
    name: 'volume',
    keymode: 'exclusive',
    setup: self => self.keybind("Escape", () => App.closeWindow('volume')),
    visible: false,
    anchor: ['top', 'right'],
    margins: [10, 10, 0, 0],
    child: Widget.Box({
        class_name: "settings-window",
        vertical: true,
        spacing: 15,
        css: "padding: 20px; min-width: 250px;",
        children: [
            Widget.Label({ label: "Volume", class_name: "settings-header" }),
            Widget.Slider({
                class_name: "volume-slider",
                draw_value: false,
                on_change: ({ value }) => {
                    if (Audio.speaker) Audio.speaker.volume = value;
                },
                setup: self => self.hook(Audio, () => {
                    self.value = Audio.speaker?.volume || 0;
                }, 'speaker-changed'),
            }),
        ]
    })
});

const UserProfile = () => Widget.Box({
    class_name: "profile-box",
    spacing: 15,
    children: [
        Widget.Icon({
            icon: "system-users-symbolic",
            size: 32,
            class_name: "profile-avatar-icon",
        }),
        Widget.Box({
            vertical: true,
            vpack: "center",
            children: [
                Widget.Label({
                    class_name: "profile-name",
                    label: Utils.exec('whoami'),
                    xalign: 0,
                })
            ]
        })
    ]
});

const QuickToggles = () => Widget.Box({
    class_name: "quick-toggles",
    spacing: 10,
    children: [
        Widget.Button({ 
            class_name: "toggle-btn",
            on_clicked: (self) => {
                const isActive = self.class_name.includes('active');
                if (isActive) {
                    Utils.execAsync(['sh', '-c', 'nmcli networking off']).catch(console.error);
                } else {
                    Utils.execAsync(['sh', '-c', 'nmcli networking on && nmcli device connect enp12s0']).catch(console.error);
                }
                self.toggleClassName('active', !isActive);
            },
            setup: self => {
                const check = () => self.toggleClassName('active', Utils.exec('nmcli networking').trim() === 'enabled');
                check();
                self.poll(5000, check);
            },
            child: Widget.Icon({ icon: "network-wired-symbolic", size: 24 }) 
        }),
        Widget.Button({ 
            class_name: "toggle-btn",
            on_clicked: (self) => {
                Utils.execAsync(['sh', '-c', 'rfkill toggle bluetooth']).catch(console.error);
                self.toggleClassName('active', !self.class_name.includes('active'));
            },
            setup: self => self.hook(Bluetooth, () => {
                self.toggleClassName('active', Bluetooth.enabled);
            }),
            child: Widget.Icon({ icon: "bluetooth-active", size: 24 }) 
        }),
        Widget.Button({ 
            class_name: "toggle-btn",
            on_clicked: () => {
                if (Audio.speaker) Audio.speaker.is_muted = !Audio.speaker.is_muted;
            },
            setup: self => self.hook(Audio, () => {
                self.toggleClassName('active', Audio.speaker && !Audio.speaker.is_muted);
            }, 'speaker-changed'),
            child: Widget.Icon({ icon: "audio-volume-high-symbolic", size: 24 }) 
        }),
        Widget.Button({ 
            class_name: "toggle-btn",
            setup: self => {
                const check = () => self.toggleClassName('active', Utils.exec('pidof wlsunset') !== '');
                check();
                self.poll(5000, check);
            },
            on_clicked: (self) => {
                if (self.class_name.includes('active')) {
                    Utils.execAsync('pkill wlsunset').catch(() => {});
                } else {
                    Utils.execAsync(['sh', '-c', 'wlsunset -T 4000 &']).catch(() => {});
                }
                self.toggleClassName('active', !self.class_name.includes('active'));
            },
            child: Widget.Icon({ icon: "weather-clear-night", size: 24 }) 
        }),
    ]
});

const MediaPlayer = () => Widget.Box({
    class_name: "media-player",
    vertical: true,
    setup: self => self.hook(Mpris, () => {
        const player = Mpris.getPlayer("");
        if (player) {
            self.visible = true;
            self.children = [
                Widget.Label({ label: player.track_title || "Unknown Title", class_name: "media-title" }),
                Widget.Label({ label: (player.track_artists || []).join(", ") || "Unknown Artist", class_name: "media-artist" }),
                Widget.Box({
                    hpack: "center",
                    spacing: 15,
                    children: [
                        Widget.Button({ class_name: "volume-btn", on_clicked: () => player.previous(), child: Widget.Icon({ icon: "media-skip-backward-symbolic", size: 20 }) }),
                        Widget.Button({ class_name: "volume-btn", on_clicked: () => player.playPause(), child: Widget.Icon({ icon: player.play_back_status === 'Playing' ? 'media-playback-pause-symbolic' : 'media-playback-start-symbolic', size: 24 }) }),
                        Widget.Button({ class_name: "volume-btn", on_clicked: () => player.next(), child: Widget.Icon({ icon: "media-skip-forward-symbolic", size: 20 }) }),
                    ]
                })
            ];
        } else {
            self.visible = false;
        }
    }, 'notify::players')
});

const SystemAction = () => Widget.Button({
    class_name: "power-btn",
    hpack: "end",
    child: Widget.Icon({ icon: "system-shutdown-symbolic", size: 20 }),
    on_clicked: () => App.toggleWindow("logout"),
});

const MainMenu = () => Widget.Window({
    name: 'mainmenu',
    keymode: 'exclusive',
    setup: self => self.keybind("Escape", () => App.closeWindow('mainmenu')),
    visible: false,
    anchor: ['top', 'left'],
    margins: [10, 0, 0, 10],
    child: Widget.Box({
        class_name: "settings-window",
        vertical: true,
        spacing: 15,
        css: "padding: 20px; min-width: 320px;",
        children: [
            Widget.Box({
                children: [
                    UserProfile(),
                    Widget.Box({ hexpand: true }),
                    SystemAction()
                ]
            }),
            QuickToggles(),
            MediaPlayer()
        ]
    })
});

const LogoutButton = (icon, label, action, customClass) => Widget.Button({
    class_name: `logout-btn ${customClass}`,
    on_clicked: () => {
        App.closeWindow('logout');
        Utils.execAsync(['sh', '-c', action]).catch(e => console.error(e));
    },
    child: Widget.Box({
        vertical: true,
        vpack: "center",
        hpack: "center",
        spacing: 15,
        children: [
            Widget.Icon({ icon, size: 64 }),
            Widget.Label(label)
        ]
    })
});

const LogoutMenu = () => Widget.Window({
    name: 'logout',
    keymode: 'exclusive',
    setup: self => self.keybind("Escape", () => App.closeWindow('logout')),
    visible: false,
    anchor: [],
    exclusivity: 'ignore',
    layer: 'overlay',
    child: Widget.Box({
        class_name: "logout-overlay",
        hpack: "center",
        vpack: "center",
        spacing: 30,
        children: [
            LogoutButton("system-lock-screen", "Lock", "swaylock", "lock"),
            LogoutButton("weather-clear-night", "Sleep", "systemctl suspend", "sleep"),
            LogoutButton("system-log-out", "Logout", "pkill swindle", "logout"),
            LogoutButton("system-reboot", "Reboot", "systemctl reboot", "reboot"),
            LogoutButton("system-shutdown", "Shutdown", "systemctl poweroff", "shutdown"),
        ]
    })
});

App.config({
    style: `${App.configDir}/style.css`,
    windows: [
        Bar(0),
        SettingsApp(),
        AppLauncher(),
        VolumeMenu(),
        ClockMenu(),
        MainMenu(),
        LogoutMenu(),
    ],
});
