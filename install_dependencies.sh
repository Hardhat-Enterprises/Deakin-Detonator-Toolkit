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
sudo apt install -y mitmproxy \
        libglib2.0-dev \
        libsoup2.4-dev \
        libjavascriptcoregtk-4.0-18 \
        libjavascriptcoregtk-4.0-dev 

echo "System deps installed."
echo "Installing rust..."

# Install rust.
curl https://sh.rustup.rs -sSf | sh -s -- -y
source "$HOME/.cargo/env"

echo "Rust installation complete..."

# Install openssl.
echo "Installing openssl..."
pushd /tmp
wget http://nz2.archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2.16_amd64.deb
sudo dpkg -i *.deb

echo "Installing volta..."
wget https://github.com/volta-cli/volta/releases/download/v1.0.8/volta-1.0.8-linux-openssl-1.1.tar.gz -O volta.tar.gz
tar xfz volta.tar.gz
sudo mv * /usr/local/bin/
popd

volta setup
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"

echo "Installing node and yarn..."
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
