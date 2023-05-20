#!/usr/bin/env bash

echo "----------------------------------------"
echo "Starting installation of dependencies..."
echo "Installing NodeSource NodeJS..."
echo "----------------------------------------"
#Install NodeSource NodeJS
sudo su <<E0F 
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
exit
E0F

echo "---------------------------------------"
echo "NodeSource NodeJS installation complete"
echo "Installing APT packages"
echo "---------------------------------------"
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
    	librsvg2-dev \
    	python3-impacket

# Installing missing deps from kali...
sudo apt install -y mitmproxy \
        libglib2.0-dev \
        libsoup2.4-dev \
        libjavascriptcoregtk-4.0-18 \
        libjavascriptcoregtk-4.0-dev \
        libwebkit2gtk-4.1-0 \
        libwebkit2gtk-4.1-dev \
		openjdk-11-jdk \
		cargo \
		nodejs \
		dsniff \
		enum4linux \
		dnsmap \
		goldeneye \
		wpscan 

echo "-----------------------------"
echo "Installing yarn..."
echo "-----------------------------"
# Install yarn.
npm install -g yarn

echo "----------------------------------"
echo "Yarn install complete"
echo "Installing project dependencies..."
echo "----------------------------------"

# Install all yarn deps.
yarn install

# Install exploits to their expected location.
./install_exploits.sh

echo "----------------------"
echo "Installation complete!"
echo "----------------------"
