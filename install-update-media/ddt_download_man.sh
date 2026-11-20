#!/bin/bash
set -Eeuo pipefail

PKGVERSIONS=(
	"libgtk-3-dev"
	"libsoup-3.0-dev"
	"libwebkit2gtk-4.1-dev"
	"nodejs"	
)
#"pkgconf"
#"npm"
#YARNVERS="yarn@3.8.7"

exec 3>&1
msg() {
	printf '%s\n' "$*" >&3
}

fail() {
	msg "ERROR: $*" >&2
	exit 1
}

(( EUID !=0 )) || fail 'You did not run the script as a normal kali user'
source /etc/os-release
[[ ${ID:-""} == kali ]] || fail 'This program currently only supports Kali Linux'

[[ ! -e "$HOME/ddt-logs" ]] || msg 'NOTICE: The log folder already exists at "$HOME/ddt-logs"'
mkdir -p "$HOME/ddt-logs" || fail 'An error occured within this step'
log="$HOME/ddt-logs/setup-$(date +%H:%M:%S-%d/%m/%Y).log"

exec 1> >(tee -a "$log") 2>&1
trap 'printf "Setup stopped at line %s. See %s\n" "$LINENO" "$log"' ERR

install(){
	sudo -v
	sudo apt-get update -y
	sudo apt-get install git -y

	# Clone the Deakin Detonator Toolkit repository and change directory to the directory
	DIR=$(pwd)
	REPDIR="$DIR/Deakin-Detonator-Toolkit"

	if [[ -d "$REPDIR" ]]; then
		while true; do
			msg "You alrady have an installation folder in this directory"
			read -r -p "Do you want to reinstall (y/n) " REIN

			if [[ $REIN == 'y' ]]; then
				rm -r "$REPDIR"
				git clone https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit
				cd "$REPDIR"
				break
		
			elif [[ $REIN == 'n' ]]; then
				msg 'Exiting installation process'
				exit 0
			else
				msg 'invalid entry, must be (y/n)'
			fi
		done

	else
		git clone https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit
		cd "$REPDIR"
	fi

	# Install Rust
	curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y --profile minimal

	# Load Cargo environment variables
	#shellcheck source=/dev/null
	source "$HOME/.cargo/env"

	# Verify Rust installation
	if ! command -v rustc &>/dev/null; then
		fail 'Rust installation failed. Exiting...'
	fi

	for item in "${PKGVERSIONS[@]}"; do
		if ! sudo apt-get install -y "$item";
		then
			fail "Error installing $item package! Exiting..."
		fi
	done

	#Verify Node.js and npm installation
	#if ! command -v node &>/dev/null || ! command -v npm &>/dev/null; then
		#echo "Node.js or npm installation failed. Exiting..."
		#exit 1
	#fi

	if ! command -v node &>/dev/null; then
		fail 'Node.js installation failed. Exiting...'
	fi

	sudo corepack enable
	#corepack prepare "$YARNVERS" --activate

	# Verify Yarn installation
	#if ! command -v yarn &>/dev/null; then
		#fail 'Yarn installation failed. Exiting...'
	#fi

	# Install Yarn dependencies
	cd "$REPDIR/src-tauri"
	
	yarn install --immutable
	#cargo fetch

	
	# Move exploits to DDT directory
	# chmod +x install-update-media/install_exploits.sh && ./install-update-media/install_exploits.sh
	#getting rid of the idiotic thing of splitting the install script up into several seperate things and dumping it here
	cd "$REPDIR"
	msg 'Copying exploit files to /usr/share/ddt/'
	sudo mkdir -p /usr/share/ddt/ || fail 'An error occured during the install process'
	sudo cp -r "$REPDIR/src-tauri/exploits/*" /usr/share/ddt/

	# Modify start script permissions and start application

	#start on launch
	#yarn install
	yarn run tauri dev
	#chmod +x install-update-media/start-ddt.sh && ./install-update-media/start-ddt.sh

	#Add desktop shortcut later
}

uninstall(){
	sudo -v
	DIR=$(pwd)
	REPDIR="$DIR/Deakin-Detonator-Toolkit"

	if command -v rustc &>/dev/null; then
		msg 'Rust installation detected. Deleting...'
		rustup self uninstall -y
	fi

	sudo corepack disable yarn

	for item in "${PKGVERSIONS[@]}"; do	
		if ! sudo apt-get remove -y "$item";
		then
			fail "Error removing $item package!"
		fi
	done
	sudo rm -r $REPDIR
	sudo rm -r /usr/share/ddt
}

[[ $# -ne 1 ]] && fail 'Incorrect syntax, enter ./ddt_download_man -help for options'

while [[ $# -gt 0 ]]; do 
	case "$1" in
		-uninstall|-u)
			uninstall
			;;

		-install|-i)
			install
			;;

		-help|-h)
			msg 'Type -uninstall/-u to uninstall the program, -install/-i to install the program and -help/-h for help'
			;;

		*)
			msg 'That was not a valid entry, enter -h for help'
			;;		
	esac
done


