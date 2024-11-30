# 🧑‍💼Contributing to Deakin Detonator Toolkit

Thank you for your interest in contributing to the Deakin Detonator Toolkit aka PT-GUI project! This project is student run and we welcome contributions from the students of Deakin to enhance this penetration testing toolkit. Please follow the guidelines below to ensure a smooth contribution process.

## Table of Contents

-   [Getting Started](#getting-started)
-   [How to Contribute](#how-to-contribute)
-   [Coding Standards](#coding-standards)
-   [Submitting Contributions](#submitting-contributions)
-   [Reporting Issues](#reporting-issues)

## 👶Getting Started

To get started with contributing, follow these steps; If you're not familiar with using Git, we recommend you to first understand how the **[Git](https://deakin365.sharepoint.com/:w:/s/HardhatEnterprises2/Ee1Nlb_OZDVIlElD5RBO5o0BzG0OTRTFHIhWpTNwaxthmQ?e=Bg0rTb)** works with **[GitHub](https://deakin365.sharepoint.com/:b:/s/HardhatEnterprises2/ETU_JVpc67BCqgp6W7vm9ewBzbWCnlneQc-mzhiOIwGd8g?e=2pW0ld)**.

1. **Clone the Repository**:

    ```bash
    git clone https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit.git
    cd ~/path/to/Deakin-Detonator-Toolkit

    ```

2. **Set Up the Development Environment**:
   Follow the instructions in the **[README](https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit/blob/main/README.md#-setup)** to set up your environment and run the application locally.

## ✍️How to Contribute

We welcome various types of contributions, including:

-   **Bug Fixes**: Identify and fix bugs in the codebase.
-   **New Features**: Propose and implement new features or enhancements.
-   **Documentation Improvements**: Help improve project documentation and architectural decision record.
-   **Testing**: Perform testing on the appilcation to ensure code reliability and stability.

## ⚠️Coding Standards

To maintain code quality, please adhere to the following coding standards:

-   Use consistent indentation (**2 spaces** for JavaScript/TypeScript).
-   Follow naming conventions (**camelCase** for variables and functions).
-   Write clear and concise comments where necessary.
-   Ensure that your code passes linting checks.
    -   Perform the following commands while committing the code:
    -   ```bash
           yarn run style
           npx prettier -w file-name
        ```
    -   Note: `npx prettier -w file-name` will overwrite its changes to the original file, we recommend you to maintain a copy of the original changes you made to the file before you run this command. If `yarn run style` does not detect any issues in the command line, there's no need to run `npx prettier -w file-name`
-   If you're still unsure what more is needed of coding standards, the team recommends you to refer the **[Coding Standards](https://deakin365.sharepoint.com/:b:/s/HardhatEnterprises2/ESf1jjS7KOJCt1QnALLgmY8BAxWJouKQGX3itT94KG_Iog?e=5MHBFa)**

## 🧑‍🍳Submitting Contributions

1. **Create a New Branch**:

    - ```bash
      git checkout -b feature/my-feature
      ```

2. **Make Your Changes**:

-   Before you begin to make the changes:
    -   ```bash
        git pull branch-name
        ```
-   Implement your changes and test them thoroughly.

3. **Commit Your Changes**:

    - ```bash
      git add file-name
      git commit -m "Add my feature"
      ```

4. **Push Your Changes**:

    - ```bash
      git push origin feature/my-feature
      ```

5. **Create a Pull Request**:

-   Go to the repository on GitHub and create a new **[Pull request](https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit/pulls)** from your branch to main. Provide a clear description of your changes and why they are needed.

## 👮Reporting Issues

-   If you encounter any bugs or have suggestions for improvements, please report them by creating an issue in the **[Repository](https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit/issues)**. Be sure to include as much detail as possible, including steps to reproduce any bugs.
