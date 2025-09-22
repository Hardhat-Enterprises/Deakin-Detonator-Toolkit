#!/bin/bash

set -e

# Add Debian security updates and main repository to sources.list if not already added
sources_file="/etc/apt/sources.list"

# Please regularly check that the debian repostiories in use are still supported otherwise installation will fail and Kali will fail to update.
# Caution must be taken when adjusting the following repositories as the will be added to the critical system file "etc/apt/sources.list" 
security_line="deb http://deb.debian.org/debian-security/ bookworm-security main contrib non-free non-free-firmware"
main_line="deb http://deb.debian.org/debian/ bookworm main contrib non-free non-free-firmware"


# Function to add a line (skipping commented-out lines during the existence check)
add_line_if_not_exists() {
  local line="$1"
  # Check if the exact uncommented line exists in non-commented lines
  if grep -v '^#' "$sources_file" | grep -qF "$line"; then
    echo "Line already exists (uncommented): $line"
  else
    echo "Adding line: $line"
    sudo sh -c "echo '$line' >> $sources_file"
  fi
}

# Add the security update line
add_line_if_not_exists "$security_line"

# Add the main repository line
add_line_if_not_exists "$main_line"
# Preconfigure debconf to restart services during upgrades without asking
echo libc6 libraries/restart-without-asking boolean true | sudo debconf-set-selections

# Update package list
sudo apt-get update -y

# Upgrade packages in list
sudo apt-get upgrade -y

# Autoremove automatically installed and no longer required packages
sudo apt autoremove -y

# Clone the Deakin Detonator Toolkit repository and change directory to the directory
git clone https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit && cd Deakin-Detonator-Toolkit

# Install Rust
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y

# Load Cargo environment variables
source "$HOME/.cargo/env"

# Verify Rust installation
if ! command -v rustc &>/dev/null; then
	echo "Rust installation failed. Exiting..."
	exit 1
fi

# Install development packages including the necessary
sudo apt-get install -y \
	pkgconf \
	libgtk-3-dev \
	libsoup2.4-dev \
	webkit2gtk-4.0 \
	nodejs \
	npm

# Verify Node.js and npm installation
if ! command -v node &>/dev/null || ! command -v npm &>/dev/null; then
	echo "Node.js or npm installation failed. Exiting..."
	exit 1
fi

# Check for installation errors
if [ $? -ne 0 ]; then
	echo "Error installing packages"
	exit 1
fi

# Install Yarn globally
sudo npm install -g yarn

# Verify Yarn installation
if ! command -v yarn &>/dev/null; then
	echo "Yarn installation failed. Exiting..."
	exit 1
fi

# Install Yarn dependencies
yarn install

# Update tauri-build 
cd src-tauri && cargo update && cd -

# Move exploits to DDT directory
chmod +x install-update-media/install_exploits.sh && ./install-update-media/install_exploits.sh

# Modify start script permissions and start application
chmod +x install-update-media/start-ddt.sh && ./install-update-media/start-ddt.sh
