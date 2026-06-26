# NixOS Guide

Because LazySwindle is built as a Flake, it integrates seamlessly into modern NixOS configurations. This allows you to install the compositor and shell globally, and automatically add it to your Display Manager (like SDDM, GDM, or Tuigreet) as a Wayland Session!

## 1. Add the Input

Open your system's `flake.nix` (usually located in `/etc/nixos/flake.nix` or your custom dotfiles repository) and add LazySwindle as an input:

```nix
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    
    # Add LazySwindle
    lazyswindle.url = "github:yourusername/lazyswindle";
  };

  outputs = { self, nixpkgs, lazyswindle, ... }@inputs: {
    nixosConfigurations.myhostname = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      specialArgs = { inherit inputs; };
      modules = [
        ./configuration.nix
      ];
    };
  };
}
```

## 2. Add the Package to your Configuration

In your `configuration.nix`, you can now access the package.

To simply install the binaries system-wide:
```nix
environment.systemPackages = [
  inputs.lazyswindle.packages.${pkgs.system}.default
];
```

To make it appear in your Display Manager (so you can select "LazySwindle" from the login screen menu):
```nix
services.displayManager.sessionPackages = [
  inputs.lazyswindle.packages.${pkgs.system}.default
];
```

## 3. Rebuild your System

Run the NixOS rebuild command to pull the flake, compile the compositor, and apply the session:

```bash
sudo nixos-rebuild switch --flake .#myhostname
```

## 4. User Configuration

Even when installed globally via Nix, the settings app still requires the `.config` files in your home directory to function properly. 

Run the LazySwindle installer locally *without* `sudo` just to populate your `~/.config/` directory:
```bash
git clone https://github.com/yourusername/lazyswindle.git
cd lazyswindle
./install.sh
```
*(When prompted to install to `/usr/local/bin`, answer `n` since Nix handles the binary!)*
