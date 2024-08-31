## Dependencies not installed in Kali by default

-   pkgconf (install via apt)
-   libgtk-3-dev (install via apt)
-   libsoup2.4-dev (install via apt)
-   webkit2gtk-4.0 (install via apt)
-   nodejs (install via apt)
-   npm (install via apt)
-   yarn (install via npm)

### Additional apt repos required

-   http://security.debian.org/debian-security
-   http://ftp.au.debian.org/debian

Add them using: `echo "deb http://security.debian.org/debian-security buster/updates main" >> /etc/apt/sources.list && echo "deb http://ftp.au.debian.org/debian buster main" >> /etc/apt/sources.list` then run `sudo apt-get update` to update the list of available packages and their versions

## Core Files

| File Name                                                          | Description                                      | Path                                                                 |
| ------------------------------------------------------------------ | ------------------------------------------------ | -------------------------------------------------------------------- |
| README.md                                                          | Project overview and basic instructions          | ./README.md                                                          |
| DDT-User-Guide.docx                                                | User guide for the project                       | ./DDT-User-Guide.docx                                                |
| DDT-User-Guide.pdf                                                 | PDF version of the user guide                    | ./DDT-User-Guide.pdf                                                 |
| index.html                                                         | Main HTML file for the application               | ./index.html                                                         |
| package.json                                                       | Defines project dependencies and scripts         | ./package.json                                                       |
| tsconfig.json                                                      | TypeScript configuration file                    | ./tsconfig.json                                                      |
| tsconfig.node.json                                                 | TypeScript configuration for Node.js             | ./tsconfig.node.json                                                 |
| vite.config.ts                                                     | Vite configuration file for building the project | ./vite.config.ts                                                     |
| yarn.lock                                                          | Yarn dependency lock file                        | ./yarn.lock                                                          |
| cd_scripts/update.mjs                                              | Script for updating project components           | ./cd_scripts/update.mjs                                              |
| documentation/adr/README.md                                        | ADR directory overview                           | ./documentation/adr/README.md                                        |
| documentation/adr/adr_template.md                                  | Template for ADR documents                       | ./documentation/adr/adr_template.md                                  |
| documentation/developer_information/introduction_for_developers.md | Introduction for new developers                  | ./documentation/developer_information/introduction_for_developers.md |
| install-update-media/create-directories.sh                         | Script to create necessary directories           | ./install-update-media/create-directories.sh                         |
| install-update-media/dependencies.json                             | JSON file for dependencies                       | ./install-update-media/dependencies.json                             |
| install-update-media/install_exploits.sh                           | Script for installing exploits                   | ./install-update-media/install_exploits.sh                           |
| install-update-media/setup_ddt.sh                                  | Setup script for DDT                             | ./install-update-media/setup_ddt.sh                                  |
| install-update-media/start-ddt.sh                                  | Script to start DDT                              | ./install-update-media/start-ddt.sh                                  |
| src/index.css                                                      | CSS file for main styling                        | ./src/index.css                                                      |
| src/main.tsx                                                       | Main TypeScript file for the application         | ./src/main.tsx                                                       |
| src/utils/CommandAvailability.ts                                   | Utility for checking command availability        | ./src/utils/CommandAvailability.ts                                   |
| src/utils/CommandHelper.ts                                         | Utility for command helpers                      | ./src/utils/CommandHelper.ts                                         |
| src/utils/InstallHelper.ts                                         | Utility for installation helpers                 | ./src/utils/InstallHelper.ts                                         |
| src/pages/About.tsx                                                | About page component                             | ./src/pages/About.tsx                                                |
| src/pages/AttackVectors.tsx                                        | Attack vectors page component                    | ./src/pages/AttackVectors.tsx                                        |
| src/pages/References.tsx                                           | References page component                        | ./src/pages/References.tsx                                           |
| src/pages/Tools.tsx                                                | Tools page component                             | ./src/pages/Tools.tsx                                                |
| src/pages/Walkthroughs.tsx                                         | Walkthroughs page component                      | ./src/pages/Walkthroughs.tsx                                         |
| src/test/setup.ts                                                  | Test setup file for TypeScript                   | ./src/test/setup.ts                                                  |
| src-tauri/Cargo.lock                                               | Cargo lock file for Rust project                 | ./src-tauri/Cargo.lock                                               |
| src-tauri/Cargo.toml                                               | Cargo configuration file for Rust                | ./src-tauri/Cargo.toml                                               |
| src-tauri/build.rs                                                 | Build script for Rust project                    | ./src-tauri/build.rs                                                 |
| src-tauri/exploits/AddVideo.py                                     | Python exploit script for adding videos          | ./src-tauri/exploits/AddVideo.py                                     |
| src-tauri/exploits/Goldeneye/goldeneye.py                          | Python script for Goldeneye exploit              | ./src-tauri/exploits/Goldeneye/goldeneye.py                          |
| src-tauri/icons/icon.png                                           | Icon file for the application                    | ./src-tauri/icons/icon.png                                           |
| src-tauri/src/main.rs                                              | Main Rust file for Tauri application             | ./src-tauri/src/main.rs                                              |
| src-tauri/tauri.conf.json                                          | Tauri configuration file                         | ./src-tauri/tauri.conf.json                                          |
