# 🧰 Deakin Detonator Toolkit

This repo houses the new version of the Deakin Detonator Toolkit application built with Modern Web technologies, shipping as a native desktop application.

-   UI built with [Mantine](https://mantine.dev), [ReactJS](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/).
-   Shipped as desktop client via [Tauri](https://tauri.app/).
-   GUI exhibition will be available here: http://34.129.77.178:8080 (Deakin Intranet Only)

`src/` contains the source code for the UI.
`src-tauri` contains the source code and configuration for the Tauri application.

## What is the Deakin Detonator Toolkit?

In its simplest definition, the Deakin Detonator Toolkit is a penetration testing toolkit. The toolkit allows you to use a variety of tools, without needing the "know-how" of each command.

# 🛠️ Exploit Development

All exploit scripts are expected to live in `/usr/share/ddt/`, and they will be executed by the Tauri application. It is recommended that you use Python for exploit development.

For the exploit scripts, it is important to ensure they are executable entirely with command line arguments, eg. `python3 my_exploit.py <ip> <port>`. This will simplify the integration of the exploit into the Tauri application.

`install_exploits.sh` is a helper script that will install all the exploit scripts in the `/usr/share/ddt/` directory. If you add new exploits, be sure to run this command again.

1. Change current directory to the toolkit:

    ```bash
    cd Deakin-Detonator-Toolkit
    ```

2. Change permissions to execute the script:

    ```bash
    chmod +x install-update-media/install_exploits.sh
    ```

3. Run the script:

    ```bash
    ./install-update-media/install_exploits.sh
    ```

The `.deb` that Tauri builds will automatically do this for us for actual toolkit installation.

# 🖥️ System requirements

-   4GB RAM
-   2 CPU cores
-   Recommended Kali 2024.1 or later

# 🔧 Setup

To install the Deakin Detonator Toolkit on Kali, you can follow method below. The method is a one&#8209;step process that utilises a bash script. If it doesn't work, follow the additional steps below.

## Run the application (dependency install and run)

1. Run the following command, this will install dependent packages, patching and start the application:

    ```
    curl -sSL https://raw.githubusercontent.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit/main/install-update-media/setup_ddt.sh -o setup_ddt.sh && chmod +x setup_ddt.sh && ./setup_ddt.sh
    ```

## Troubleshooting Steps

1. Use this method if you encounter any errors with the above method. Update your Kali:

    ```bash
    sudo apt update
    ```

2. Upgrade your Kali:

    ```bash
    sudo apt full-upgrade -y
    ```

3. Open Network Repository:

    ```bash
    sudo nano /etc/apt/sources.list
    ```

4. Add the following lines to the Network Repository:

    ```bash
    deb http://security.debian.org/debian-security buster/updates main
    deb http://ftp.au.debian.org/debian buster main
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

# 📷 Screenshot

Once you have successfully implemented either method one or two, the application should open and look like the following screenshot:

<img src="https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit/blob/main/static/ddt_homepage.png" width="1000px">

# 📷 Release

1. Change the version number in scr-tauri/tauri.conf.json larger than current version

2. Merge the main branch into release branch, it will trigger the CD pipeline to update the repo release info

3. The update information will appear when user open the app

<img src="https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit/blob/main/static/Updater.png" width="1000px">
