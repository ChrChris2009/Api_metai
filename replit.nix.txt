{ pkgs }: {
  deps = [
    pkgs.unzipNLS
    pkgs.bashInteractive
    pkgs.nodePackages.bash-language-server
    pkgs.man
    pkgs.libuuid
  ];
}