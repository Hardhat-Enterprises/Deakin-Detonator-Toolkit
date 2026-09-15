# Installation Troubleshooting Steps

1. Use this method if you encounter any errors with the above method. Update your Kali:

    ```bash
    sudo apt update
    ```

2. Upgrade your Kali:

    ```bash
    sudo apt full-upgrade -y
    ```

3. Open your APT sources list:

    ```bash
    sudo nano /etc/apt/sources.list
    ```

4. Add the following as new lines to your APT sources list:

    ```bash
    deb http://deb.debian.org/debian-security/ bookworm-security main contrib non-free non-free-firmware
    deb http://deb.debian.org/debian/ bookworm main contrib non-free non-free-firmware
    ```

5. Update Kali again:

    ```bash
    sudo apt update
    ```

6. Run:

    ```bash
    sudo apt install libenchant1c2a -y
    ```

7. Run:

    ```bash
    sudo apt install libwebkit2gtk-4.0-dev -y
    ```

8. Finally, rerun the original command, which will install the remaining dependant packages, patching and then start the application:

    ```bash
    curl -sSL https://raw.githubusercontent.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit/main/install-update-media/setup_ddt.sh -o setup_ddt.sh && chmod +x setup_ddt.sh && ./setup_ddt.sh
    ```

[Back](../README.md)