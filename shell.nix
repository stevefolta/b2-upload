{ pkgs ? import <nixpkgs> {}, nodejs ? pkgs."nodejs-12_x" }:

pkgs.mkShell {
	buildInputs = [ nodejs ];
	}
