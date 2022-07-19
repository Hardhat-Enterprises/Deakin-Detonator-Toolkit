# DDT PoC

This repo houses a proof of concept UI for the DDT application built with Modern Web technologies, shipping as a native desktop application.

-   UI built with [Mantine](https://mantine.dev), [ReactJS](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/).
-   Shipped as desktop client via [Tauri](https://tauri.app/).

# Setup

## Pre-requisites

1. Follow the guide [here](https://tauri.app/v1/guides/getting-started/prerequisites) for installing the pre-requisites for Tauri.

2. Install nodejs and yarn.

    ```bash
    $ curl https://get.volta.sh | bash
    $ volta install node
    $ volta install yarn
    ```

3. Clone the repo

    ```bash
    $ git clone https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit
    ```

4. Install the dependencies

    ```bash
    $ cd Deakin-Detonator-Toolkit
    $ yarn install
    ```

5. Run the application in dev mode, this will hot-reload upon changes made to the code.

    ```bash
    $ yarn run tauri dev
    ```

# Screenshot

![screenshot](https://i.imgur.com/Nu67H6n.png)
