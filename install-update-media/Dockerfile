# Use Kali Linux as the base image
FROM kalilinux/kali-rolling:latest

### Set Working Directory
WORKDIR /root

### Setup Accessibility Bus
RUN mkdir -p /run/user/1000/at-spi && \
    chmod -R 700 /run/user/1000 && \
    echo "export XDG_RUNTIME_DIR=/run/user/1000" >> /root/.bashrc

ENV XDG_RUNTIME_DIR=/run/user/1000

### Set Frontend to Noninteractive
ARG DEBIAN_FRONTEND=noninteractive

### Update Sources to Use Only Kali Rolling
RUN echo "deb http://http.kali.org/kali kali-rolling main contrib non-free" > /etc/apt/sources.list && \
    apt-get update

### Add Debian Bullseye or Buster Repository
RUN echo "deb http://deb.debian.org/debian bullseye main contrib non-free" >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y libjavascriptcoregtk-4.0-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


### Configure PKG_CONFIG_PATH
ENV PKG_CONFIG_PATH=/usr/lib/x86_64-linux-gnu/pkgconfig:${PKG_CONFIG_PATH}

RUN pkg-config --libs --cflags javascriptcoregtk-4.0 || echo "javascriptcoregtk-4.0 not found"


### Test pkg-config
RUN pkg-config --libs --cflags javascriptcoregtk-4.0 || echo "javascriptcoregtk-4.0 not found"

### Update Sources and Install Dependencies
RUN apt-get update && \
    apt-get install -y \
        git \
        curl \
        pkgconf \
        libgtk-3-dev \
        libsoup2.4-dev \
        webkit2gtk-4.0 \
        nodejs \
        npm \
        xvfb \
        x11-xserver-utils \
        dsniff \
        dnsutils \
        aircrack-ng \
        amap \
        arjun \
        arping \
        arp-scan \
        bed \
        bully \
        cewl \
        cloudbrute \
        crunch \
        dirb \
        dmitry \
        dnsenum \
        dnsmap \
        dnsrecon \
        enum4linux \
        exif \
        eyewitness \
        fcrackzip \
        ffuf \
        foremost \
        ftp \
        gitleaks \
        gobuster \
        hashcat \
        hping3 \
        hydra \
        john \
        masscan \
        medusa \
        metagoofil \
        nbtscan \
        netcat-openbsd \
        nikto \
        nmap \
        parsero \
        photon \
        python3-sherlock \
        rainbowcrack \
        slowhttptest \
        snmpcheck \
        sqlmap \
        sqlninja \
        sublist3r \
        theharvester \
        tiger \
        traceroute \
        unicornscan && \
    apt-get install -y wordlists && \
    gunzip -f /usr/share/wordlists/rockyou.txt.gz && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

### Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable && \
    echo 'export PATH="/root/.cargo/bin:$PATH"' >> ~/.bashrc && \
    . /root/.cargo/env && \
    rustup set profile minimal

### Set Cargo Path
ENV PATH="/root/.cargo/bin:${PATH}"

### Clone the DDR Repository
RUN git clone https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit /root/Deakin-Detonator-Toolkit

### Set Toolkit Directory
WORKDIR /root/Deakin-Detonator-Toolkit

### Install Yarn and Dependencies
RUN npm install -g yarn && \
    rm -f package-lock.json && \
    yarn add @mantine/core@5.3.0 @mantine/hooks@5.3.0 @mantine/notifications@5.3.0 @mantine/prism@5.3.0 @mantine/spotlight@5.3.0 && \
    yarn install && \
    yarn cache clean && \
    rm -rf /usr/local/share/.cache/yarn

### Copy Exploits
RUN mkdir -p /usr/share/ddt/ && \
    cp -r src-tauri/exploits/* /usr/share/ddt/

### Expose Port
EXPOSE 5173

### Setup Environment for GUI Applications
ENV XDG_RUNTIME_DIR=/tmp/runtime-root
RUN mkdir -p /tmp/runtime-root

### Start Tauri Development
CMD ["yarn", "run", "tauri", "dev"]
