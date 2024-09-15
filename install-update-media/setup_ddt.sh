#!/bin/bash

set -e

# Add Debian security updates and main repository to sources.list
sudo sh -c 'echo "deb http://security.debian.org/debian-security buster/updates main" >> /etc/apt/sources.list && echo "deb http://ftp.au.debian.org/debian buster main" >> /etc/apt/sources.list'

# Preconfigure debconf to restart services during upgrades without asking
echo libc6 libraries/restart-without-asking boolean true | sudo debconf-set-selections

# Update package list
sudo apt-get update -y

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

# Move exploits to DDT directory
chmod +x install-update-media/install_exploits.sh && ./install-update-media/install_exploits.sh

# Modify start script permissions and start application
chmod +x install-update-media/start-ddt.sh && ./install-update-media/start-ddt.sh
