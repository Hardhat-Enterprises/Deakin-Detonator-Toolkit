#!/usr/bin/env bash

echo "Starting installation of dependencies..."

# Update all packages.
sudo apt update
sudo apt upgrade -y

# Install tauri deps.
sudo apt install -y libwebkit2gtk-4.0-dev \
    	build-essential \
    	curl \
    	wget \
    	libssl-dev \
    	libgtk-3-dev \
    	libayatana-appindicator3-dev \
    	librsvg2-dev

# Installing missing deps from kali...
sudo apt install -y glib2.0 \ 
        mitmproxy \
        libglib2.0-dev \
        libsoup2.4-dev \
        libjavascriptcoregtk-4.0-18 \
        libjavascriptcoregtk-4.0-dev \

echo "System deps installed."
echo "Installing rust..."

# Install rust.
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh

echo "Rust installation complete..."
echo "Installing volta..."

# Install volta.
curl https://get.volta.sh | bash

# Install node and yarn.
volta install node
volta install yarn

echo "Volta install complete"
echo "Installing project dependencies..."

# Install all yarn deps.
yarn install

# Install exploits to their expected location.
./install_exploits.sh

echo "Installation complete!"