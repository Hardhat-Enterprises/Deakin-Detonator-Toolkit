# DDT PoC

This repo houses a proof of concept UI for the DDT application built with Modern Web technologies, shipping as a native desktop application.

-   UI built with [Mantine](https://mantine.dev), [ReactJS](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/).
-   Shipped as desktop client via [Tauri](https://tauri.app/).

# Setup

Steps 1-4 install the pre-requisites for Tauri. If more information is needed for steps 1-4, follow the Tauri pre-requisites installation guide [here](https://tauri.app/v1/guides/getting-started/prerequisites).

Step 1: 

    ```bash
    $ sudo apt update
    ```

Step 2:

    ```bash
    $ sudo apt upgrade --fix-missing -y
    ```

Step 3:

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

Step 4:

    ```bash
    $ curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
    ```

Steps 5-8 installs nodejs and yarn.

Step 5: 

    ```bash
    $ curl https://get.volta.sh | bash
    ```

Step 6: Close your current terminal and open a new one
    
Step 7: 

    ```bash
    $ volta install node
    ```
    
Step 8: 

    ```bash
    $ volta install yarn
    ```

Step 9 - Clone the repo: 

    ```bash
    $ git clone https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit
    ```

Steps 10-11 installs the dependencies.

Step 10: 

    ```bash
    $ cd Deakin-Detonator-Toolkit
    ```
    
Step 11: 

    ```bash
    $ yarn install
    ```

Step 12 - Run the application in dev mode, this will hot-reload upon changes made to the code: 

    ```bash
    $ yarn run tauri dev
    ```

# Screenshot

![screenshot](https://i.imgur.com/Nu67H6n.png)
