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

### Update Sources and Configure Pinning
RUN echo "deb http://security.debian.org/debian-security buster/updates main" >> /etc/apt/sources.list && \
    echo "deb http://ftp.au.debian.org/debian buster main" >> /etc/apt/sources.list && \
    echo "Package: *" > /etc/apt/preferences.d/kali-debian && \
    echo "Pin: release a=kali-rolling" >> /etc/apt/preferences.d/kali-debian && \
    echo "Pin-Priority: 900" >> /etc/apt/preferences.d/kali-debian && \
    echo "Package: *" >> /etc/apt/preferences.d/kali-debian && \
    echo "Pin: release a=buster" >> /etc/apt/preferences.d/kali-debian && \
    echo "Pin-Priority: 800" >> /etc/apt/preferences.d/kali-debian && \
    apt-get update

### Update Sources and Install Dependencies
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
        libgdk-pixbuf-2.0-0=2.42.12+dfsg-1+b1 \
        libgdk-pixbuf2.0-common=2.42.12+dfsg-1 && \
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
