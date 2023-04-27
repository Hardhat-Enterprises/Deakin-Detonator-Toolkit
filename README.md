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

1. Clone the repo.

    ```bash
    $ git clone https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit
    ```


2. Change current directory to the toolkit.

    ```bash
    $ cd Deakin-Detonator-Toolkit
    ```

3. Run the install script.

    ```bash
    $ ./install_dependencies.sh
    ```

4. Run the application (dev mode).

    ```bash
    $ yarn run tauri dev
    ```

# 📷 Screenshot

![screenshot](https://i.imgur.com/Nu67H6n.png)
