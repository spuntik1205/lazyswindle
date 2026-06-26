# Keybindings

LazySwindle's keybindings are fully defined within your `config.lua` file. The compositor parses these strings directly into XKB keysyms, which means it supports standard Linux keyboard bindings dynamically.

## The `keybinds` Array

Keybindings are configured as a list of Lua tables inside the `keybinds` variable.

Each keybind table requires the following properties:
* `mods` (table of strings): A list of modifier keys to hold down.
* `key` (string): The primary key to press.
* `action` (string): The internal compositor action to trigger.
* `args` (table of strings, optional): Used exclusively by the `spawn` action to pass arguments to the command being run.

## Modifiers

The following standard modifiers are available:
* `"logo"` - The Super / Windows key (Highly recommended as your primary modifier).
* `"alt"` - The Alt key.
* `"shift"` - The Shift key.
* `"ctrl"` - The Control (Ctrl) key.

You can combine multiple modifiers simply by adding them to the `mods` array. For example: `mods = {"logo", "shift"}`.

## Keys

Keys are parsed directly using standard XKB strings.

### Letters and Numbers
Simply use the lowercase letter or number:
* `"a"`, `"b"`, `"c"`
* `"1"`, `"2"`, `"3"`

### Special Keys
Special keys should be capitalized appropriately:
* `"Return"` - The Enter key.
* `"Escape"` - The Escape key.
* `"Space"` - The Spacebar.
* `"Tab"` - The Tab key.
* `"BackSpace"` - The Backspace key.

### Function and Media Keys
* `"F1"`, `"F2"`, etc.
* `"XF86AudioRaiseVolume"` - Volume Up
* `"XF86AudioLowerVolume"` - Volume Down
* `"XF86AudioMute"` - Mute Audio
* `"XF86MonBrightnessUp"` - Brightness Up
* `"XF86MonBrightnessDown"` - Brightness Down

## Examples

**Launching an application:**
```lua
{ mods = {"logo"}, key = "Return", action = "spawn", args = {"foot"} }
```

**Executing a shell command (e.g. taking a screenshot):**
```lua
{ mods = {"logo", "shift"}, key = "s", action = "spawn", args = {"grim", "-g", "$(slurp)"} }
```

**Closing the active window:**
```lua
{ mods = {"logo", "shift"}, key = "q", action = "killclient" }
```

**Exiting the compositor entirely:**
```lua
{ mods = {"logo", "shift"}, key = "Escape", action = "quit" }
```
