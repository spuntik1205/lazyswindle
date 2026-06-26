#!/usr/bin/env bash
set -e

# ==========================================
# LazySwindle Interactive Install Script
# ==========================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
cd "$SCRIPT_DIR"

echo " Welcome to the LazySwindle Installer!"
if [ -f "ascii.txt" ]; then
    cat ascii.txt
fi
echo "This script will build and install the Swindle compositor and AGS shell ecosystem."
echo "--------------------------------------------------------"

# 1. Dependency Checks
echo "[1/4] Checking dependencies..."
DEPS=("pkg-config" "wayland-scanner" "sassc" "make" "gcc" "lua")
MISSING_DEPS=()

for dep in "${DEPS[@]}"; do
    if ! command -v "$dep" >/dev/null 2>&1; then
        MISSING_DEPS+=("$dep")
    fi
done

if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    echo "Error: Missing dependencies: ${MISSING_DEPS[*]}"
    echo "Please install them using your package manager."
    exit 1
fi
echo "All build dependencies found."

# 2. Init System Detection
echo "[2/4] Detecting init system..."
if [ -d "/etc/runit" ]; then
    echo "-> Detected runit. Ensure dbus and seatd/elogind services are enabled."
elif [ -d "/etc/openrc" ] || command -v rc-update >/dev/null 2>&1; then
    echo "-> Detected OpenRC. Ensure dbus and seatd/elogind services are added to default runlevel."
elif [ -d "/usr/lib/systemd" ]; then
    echo "-> Detected systemd."
else
    echo "-> Unknown init system. Make sure necessary services (dbus, seatd) are running."
fi

# 3. Compiling Compositor
echo "[3/4] Compiling Swindle compositor..."
cd compositor
make clean || true

if command -v nix >/dev/null 2>&1 && [ -f "../flake.nix" ]; then
    echo "Nix detected! Building within nix develop environment..."
    cd ..
    # Use nix develop to run make. Requires experimental features in modern Nix.
    nix develop --extra-experimental-features "nix-command flakes" --command bash -c "cd compositor && make -j$(nproc)"
    cd compositor
else
    make -j$(nproc)
fi

echo "Swindle compiled successfully."

read -p "Do you want to install swindle to /usr/local/bin? (y/N) " install_swindle
    if [[ "$install_swindle" =~ ^[Yy]$ ]]; then
        echo "Installing swindle and Wayland session (requires sudo/doas)..."
        
        # Create a basic desktop file locally
        cat > lazyswindle.desktop << 'EOF'
[Desktop Entry]
Name=LazySwindle
Comment=A cohesive, stunning Wayland ecosystem
Exec=swindle
Type=Application
DesktopNames=LazySwindle
EOF

        if command -v doas >/dev/null 2>&1; then
            doas make install
            doas mkdir -p /usr/share/wayland-sessions
            doas cp lazyswindle.desktop /usr/share/wayland-sessions/
        else
            sudo make install
            sudo mkdir -p /usr/share/wayland-sessions
            sudo cp lazyswindle.desktop /usr/share/wayland-sessions/
        fi
    else
        echo "Skipping system install."
    fi
    cd ..
    
    # 4. Installing Shell and Swindle Configurations
    echo "[4/4] Installing LazySwindle configurations..."
    AGS_CONFIG_DIR="$HOME/.config/ags"
    SWINDLE_CONFIG_DIR="$HOME/.config/swindle"
    
    # Setup AGS Shell and Themes
    mkdir -p "$AGS_CONFIG_DIR"
    cp -r shell/* "$AGS_CONFIG_DIR/"
    mkdir -p "$AGS_CONFIG_DIR/themes"
    [ -d "shell/themes" ] && cp -r shell/themes/* "$AGS_CONFIG_DIR/themes/" 2>/dev/null || true
    
    # Setup Swindle config (copying the default config.lua if not present, otherwise overwriting)
    mkdir -p "$SWINDLE_CONFIG_DIR"
    cp shell/config.lua "$SWINDLE_CONFIG_DIR/config.lua"
    
    # Provide a default theme file so Swindle doesn't complain on first boot before AGS starts
    cat > "$SWINDLE_CONFIG_DIR/lazyswindle_theme.lua" << 'EOF'
return {
    gaps = 10,
    border_px = 2,
    focus_color = {0.47, 0.63, 0.96, 1.0},
    urgent_color = {0.96, 0.46, 0.55, 1.0},
    border_color = {0.08, 0.08, 0.11, 1.0},
    root_color = {0.10, 0.10, 0.14, 1.0},
}
EOF
    
    echo "Configurations installed to $AGS_CONFIG_DIR and $SWINDLE_CONFIG_DIR"
    
    echo "--------------------------------------------------------"
    echo "✅ LazySwindle setup complete!"
    
    if grep -q "NixOS" /etc/os-release 2>/dev/null || [ -f "/etc/nixos/configuration.nix" ]; then
        echo "⚠️  Note for NixOS Users:"
        echo "Due to NixOS's read-only root filesystem, standard global installation to /usr/local/bin or /usr/share/wayland-sessions/ is blocked."
        echo "To test your desktop right now, run the compiled binary directly:"
        echo "   ./compositor/swindle"
        echo ""
        echo "To seamlessly integrate this flake into your NixOS system and add it to your display manager,"
        echo "please read the step-by-step guide at: documentation/nixos-guide.md"
    else
        echo "To start your new desktop, run: swindle"
        echo "It has also been added to your login manager (e.g. SDDM, GDM) under 'LazySwindle'."
    fi
    
    echo "Once logged in, open the settings panel (via your preferred AGS binding) to tweak your desktop!"
