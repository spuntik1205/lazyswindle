{
  description = "LazySwindle - The cohesive Wayland ecosystem";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    ags.url = "github:Aylur/ags/v1";
  };

  outputs = { self, nixpkgs, ags }: let
    system = "x86_64-linux";
    pkgs = import nixpkgs { inherit system; };
  in {
    packages.${system} = {
      compositor = pkgs.stdenv.mkDerivation {
        pname = "swindle";
        version = "1.0.0";
        src = ./compositor;

        nativeBuildInputs = with pkgs; [
          pkg-config
          wayland-scanner
        ];

        buildInputs = with pkgs; [
          wayland
          wlroots
          libinput
          libxkbcommon
          pixman
          wayland-protocols
          lua5_4
          libxcb
          xcbutilwm
        ];

        installPhase = ''
          mkdir -p $out/bin
          cp swindle $out/bin/
          
          mkdir -p $out/share/wayland-sessions
          cat > $out/share/wayland-sessions/lazyswindle.desktop << EOF
[Desktop Entry]
Name=LazySwindle
Comment=A cohesive, stunning Wayland ecosystem
Exec=$out/bin/swindle
Type=Application
DesktopNames=LazySwindle
EOF

          cat > $out/bin/lazyswindle << 'EOF2'
#!/bin/sh
BLUE="\033[38;2;122;162;247m"
MAGENTA="\033[38;2;187;154;247m"
WHITE="\033[38;2;169;177;214m"
NC="\033[0m"

echo -e "
''${BLUE}██╗      █████╗ ███████╗██╗   ██╗███████╗██╗    ██╗██╗███╗   ██╗██████╗ ██╗     ███████╗        Z''${NC}
''${BLUE}██║     ██╔══██╗╚══███╔╝╚██╗ ██╔╝██╔════╝██║    ██║██║████╗  ██║██╔══██╗██║     ██╔════╝     Z''${NC}     ''${MAGENTA}version:''${NC} ''${WHITE}1.0''${NC}
''${BLUE}██║     ███████║  ███╔╝  ╚████╔╝ ███████╗██║ █╗ ██║██║██╔██╗ ██║██║  ██║██║     █████╗    z''${NC}        ''${MAGENTA}server:''${NC}  ''${WHITE}wayland''${NC}
''${BLUE}██║     ██╔══██║ ███╔╝    ╚██╔╝  ╚════██║██║███╗██║██║██║╚██╗██║██║  ██║██║     ██╔══╝  z''${NC}          ''${MAGENTA}made by:''${NC} ''${WHITE}spuntik1205 (lazyswindle) kantiankant(swindle)''${NC}
''${BLUE}███████╗██║  ██║███████╗   ██║   ███████║╚███╔███╔╝██║██║ ╚████║██████╔╝███████╗███████╗''${NC}
''${BLUE}╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝ ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝''${NC}
"
EOF2
          chmod +x $out/bin/lazyswindle
        '';
        
        passthru.providedSessions = [ "lazyswindle" ];
      };

      shell = ags.packages.${system}.default;

      default = pkgs.symlinkJoin {
        name = "lazyswindle-env";
        paths = [ self.packages.${system}.compositor self.packages.${system}.shell pkgs.grim pkgs.slurp pkgs.swaybg pkgs.wlsunset ];
        passthru.providedSessions = [ "lazyswindle" ];
      };
    };

    devShells.${system}.default = pkgs.mkShell {
      nativeBuildInputs = with pkgs; [
        pkg-config
        wayland-scanner
      ];
      buildInputs = with pkgs; [
        wayland
        wlroots
        libinput
        libxkbcommon
        wayland-protocols
        pixman
        xorg.libX11
        libxcb
        xcbutilwm
        sassc
        typescript
        lua5_4
        ags.packages.${system}.default
      ];
    };
  };
}
