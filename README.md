# 🧰 Deakin Detonator Toolkit

This repo houses the new version of the Deakin Detonator Toolkit application built with Modern Web technologies, shipping as a native desktop application.

-   UI built with [Mantine](https://mantine.dev), [ReactJS](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/).
-   Shipped as desktop client via [Tauri](https://tauri.app/).

`src/` contains the source code for the UI.
`src-tauri` contains the source code and configuration for the Tauri application.

# 🛠️ Exploit Development

All exploit scripts are expected to live in `/usr/share/ddt/`, and they will be executed by the Tauri application. It is recommended that you use Python for exploit development.

For the exploit scripts, it is important to ensure they are executable entirely with command line arguments, eg. `python3 my_exploit.py <ip> <port>`. This will simplify the integration of the exploit into the Tauri application.

`install_exploits.sh` is a helper script that will install all the exploit scripts in the `/usr/share/ddt/` directory. If you add new exploits, be sure to run this command again.

```bash
./install_exploits.sh
```

The `.deb` that Tauri builds will automatically do this for us for actual toolkit installation.

# 🔧 Setup

Steps 1-4 install the pre-requisites for Tauri. If more information is needed for steps 1-4, follow the Tauri pre-requisites installation guide [here](https://tauri.app/v1/guides/getting-started/prerequisites).

1. Update package list.

    ```bash
    $ sudo apt update
    ```

2. Upgrade all packages.

    ```bash
    $ sudo apt upgrade --fix-missing -y
    ```

3. Install tauri pre-requisites.

    ```bash
    $ sudo apt install libwebkit2gtk-4.0-dev \
    	build-essential \
    	curl \
    	wget \
    	libssl-dev \
    	libgtk-3-dev \
    	libayatana-appindicator3-dev \
    	librsvg2-dev
    ```

4. Install rust.

    ```bash
    $ curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
    ```

5. Install volta (to manage node installations).

    ```bash
    $ curl https://get.volta.sh | bash
    ```

6. Close your current terminal and open a new one.
7. Install node.

    ```bash
    $ volta install node
    ```

8. Install yarn.

    ```bash
    $ volta install yarn
    ```

9. Clone the repo.

    ```bash
    $ git clone https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit
    ```

10. Change current directory to the toolkit.

    ```bash
    $ cd Deakin-Detonator-Toolkit
    ```

11. Install all project dependencies.

    ```bash
    $ yarn install
    ```

12. Install the exploits to the correct location.

    ```bash
    $ ./install_exploits.sh
    ```

13. Run the application in dev mode, this will hot-reload upon changes made to the code:

    ```bash
    $ yarn run tauri dev
    ```

# 📷 Screenshot

![screenshot](https://i.imgur.com/Nu67H6n.png)
