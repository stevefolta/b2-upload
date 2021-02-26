{ pkgs ? import <nixpkgs> {}, nodejs ? pkgs."nodejs" }:

pkgs.mkShell {
	buildInputs = [ nodejs ];
	}
