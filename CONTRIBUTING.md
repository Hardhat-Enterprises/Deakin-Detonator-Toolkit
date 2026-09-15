# 🧑‍💼Contributing to Deakin Detonator Toolkit

Thank you for your interest in contributing to the Deakin Detonator Toolkit (DDT)! This project is student-run and we welcome contributions from the students of Deakin to enhance this penetration testing toolkit.

This guide describes the expected Git workflow, development environment, validation checks and pull request process for this project.

## Table of Contents

- [Getting Started](#-getting-started)
- [How to Contribute](#️-how-to-contribute)
- [Required Checks](#-required-checks-before-submitting-a-pull-request)
- [Coding Standards](#️-coding-standards)
- [Submitting Contributions](#-submitting-contributions)
- [GitHub Actions](#github-actions)
- [Reporting Issues](#-reporting-issues)

## 👶 Getting Started

To get started with contributing, follow these steps; If you're not familiar with using Git, we recommend you to first understand how the **[Git](https://deakin365.sharepoint.com/:w:/s/HardhatEnterprises2/Ee1Nlb_OZDVIlElD5RBO5o0BzG0OTRTFHIhWpTNwaxthmQ?e=Bg0rTb)** works with **[GitHub](https://deakin365.sharepoint.com/:b:/s/HardhatEnterprises2/ETU_JVpc67BCqgp6W7vm9ewBzbWCnlneQc-mzhiOIwGd8g?e=2pW0ld)**.

### 1. Before you begin

- a GitHub fork of the DDT repository
- a local development clone
- `origin` configured to point to your fork
- `upstream` configured to point to the DDT repository

Check this is configured correctly by executing the following command with your development clone:

```bash
git remote -v
```

You should see something similar to:

```
origin    https://github.com/YOUR-USERNAME/Deakin-Detonator-Toolkit.git
upstream  https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit.git
```

If the remotes are not correct use the following to set origin:

```bash
git remote set-url origin https://github.com/YOUR-USERNAME/Deakin-Detonator-Toolkit.git
```

If upstream does not exist:

```bash
git remote add upstream https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit.git
```

If upstream exists but points to the wrong repository:

```bash
git remote set-url upstream https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit.git
```

Confirm configuration is now correct:

```bash
git remote -v
```

### 2. Branch Workflow

#### New Branch

Return to your local main branch:

```bash
git switch main
```

Check you have no uncommitted work:

```bash
git status
```

Fetch the latest changes from upstream:

```bash
git fetch upstream
```

Update your local main branch:

```bash
git merge --ff-only upstream/main
```

Create a new feature branch to work from. Use a short descriptive branch name e.g. `fix/toolname` or `feature/toolname-description`:

```bash
git switch -c <feature/my-change>
```

#### Edit an Existing PR Branch

Switch to the branch associated with the pull request:

```bash
git switch <branch/name>
```

Check your current work has been submitted:

```bash
git status
```

Fetch the latest changes from upstream:

```bash
git fetch upstream
```

Merge the latest changes from upstream onto your feature branch:

```bash
git merge upstream/main
```

**Resolve any merge conflicts before continuing.**

## ✍️ How to Contribute

[Top](#table-of-contents)

We welcome various types of contributions, including:

- **Bug Fixes**: Identify and correct defects in existing functionality.
- **New Features**: Propose and implement new features or enhancements.
- **Documentation Improvements**: Help improve project documentation, guides and supporting material.
- **Testing**: Improve or perform testing to help maintain application reliability and stability.

## ✅ Required Checks Before Submitting a Pull Request

[Top](#table-of-contents)

Install repository dependencies:

```
corepack yarn install --immutable
```

### Validation Checks

Style check:

```bash
corepack yarn style
```

Test check:

```bash
corepack yarn test --run
```

Build check:

```bash
corepack yarn build
```

Whitespace error check:

```bash
git diff --check
```

**All checks must pass before submitting or updating a pull request.**

#### If style check fails

If the style check fails:

```bash
corepack yarn style:fix
```

Confirm with:

```bash
corepack yarn style
```

### Runtime Testing

Changes affecting application behaviour should also be tested by launching DDT:

```bash
WEBKIT_DISABLE_DMABUF_RENDERER=1 WEBKIT_DISABLE_COMPOSITING_MODE=1 corepack yarn tauri dev
```

Confirm that:

- DDT launches successfully
- Changed functionality behaves as expected
- Affected component or tool can still be used normally
- No obvious regressions have been introduced

## ⚠️ Coding Standards

[Top](#table-of-contents)

To maintain code quality, please adhere to the following coding standards:

- Use consistent indentation (**2 spaces** for JavaScript/TypeScript).
- Follow naming conventions (**camelCase** for variables and functions).
- Write clear and concise comments where necessary.
- Avoid unrelated changes within the same pull request.
- Ensure the required validation checks pass before requesting review.

- If you're still unsure what more is needed of coding standards, the team recommends you to refer the **[Coding Standards](https://deakin365.sharepoint.com/:b:/s/HardhatEnterprises2/ESf1jjS7KOJCt1QnALLgmY8BAxWJouKQGX3itT94KG_Iog?e=5MHBFa)**

## 🧑‍🍳 Submitting Contributions

[Top](#table-of-contents)

Once your changes and validations are complete, review what will be committed:

```bash
git status
git diff
```

Stage the relevant file (multiple files are separated by a space):

```bash
git add <file-name>
```

Commit the changes using a short descriptive commit message:

```bash
git commit -m "<your-message>"
```

Push the feature branch to your fork:

```bash
git push origin <branch-name>
```

If the branch already has an open pull request associated with it, pushing to the same branch will update that pull request.

### If There is no Open Pull Request

Create a pull request from your feature branch to DDTs `main` branch.

Within the pull request ensure you clearly describe:

- What was changed
- Why the change was required
- How was the change tested
- Any related issue numbers, use appropriate GitHub keywords such as `fixes #<issue number>` where appropriate
- Screenshots or supporting evidence where appropriate

## GitHub Actions

[Top](#table-of-contents)

Pull requests targeting `main` or `dev` run the DDT CI workflow.

The workflow validates:

- dependency installation;
- formatting/style;
- automated tests;
- security scanning;
- production build.

**A pull request should not be considered ready to merge while required CI jobs are failing.**

If CI fails, review the failed job before making additional changes. Where possible, reproduce and resolve the failure locally before pushing another commit.

## 👮 Reporting Issues

[Top](#table-of-contents)

If you encounter a bug, unexpected behaviour or have suggestions for improvements, please report them by creating an issue in the **[Repository](https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit/issues)**.

Before creating a new issue:

- Check you have encountered the issue on the latest release of DDT, if not, update and recheck
- Identify the affected tool, component or feature
- Search the existing open and closed issues to check whether the problem has already been reported
- Gather any relevant screenshots, logs or error messages

### Writing a Useful Issue

Ensure you select the most relevant issue type from the options:

- **Bug Report** - Report a bug or unexpected behaviour.
- **Feature Request** - Suggest a new feature for the project.
- **Improvement Request** - Suggest an improvement or upgrade to an existing tool.
- **Blank Issue** - Create a new issue that does not fit one of the existing templates.
- **Report a Security Vulnerability** - Follow the instructions in the [Security Policy](SECURITY.md) for security-related issues.

Use a short, descriptive title that clearly identifies the problem.

For example

`<toolname> fails when <conditions>`.

Avoid vague titles such as `Tool broken` or `Not working`.

### Bug Report Information

Include the following details where possible:

- **Affected tool or component** — the DDT tool, page or feature involved.
- **Description** — a clear explanation of the problem.
- **Expected behaviour** — what you expected DDT to do.
- **Actual behaviour** — what happened instead.
- **Steps to reproduce** — clear steps another contributor can follow to reproduce the problem.
- **Environment** — relevant operating system or development environment information.
- **Error output** — relevant console output, error messages or logs.
- **Screenshots** — where they help demonstrate the issue.
- **Additional context** — anything else that may help identify the cause.

### Improvement and Feature Request Information

Please explain:

- What you would like changed or added.
- Why the change would be useful.
- Which part of DDT it affects.
- Any suggested behaviour or design.
- Screenshots or examples where appropriate.

### Suggesting a New Tool or Attack Vector

Suggestions for new tools, exploits and attack vectors are welcome.

Before submitting a suggestion:

- Check the current [Supported Tools and Exploits](docs/TOOLS.md) list to confirm it is not already included.
- Search existing open and closed issues to check whether the suggestion has already been submitted.
- Review the [Kali Linux Tools](https://www.kali.org/tools/) catalogue where applicable.

Submit the suggestion using a **Feature Request** and include:

- **Name** — the name of the proposed tool, exploit or attack vector.
- **Purpose** — a short description of what it provides.
- **Category** — where the tool would fit within DDT, where applicable.
- **Reason for inclusion** — why the addition would be useful to DDT users.
- **Official reference** — a link to the official project, Kali Tools page, CVE or security advisory where available.
- **Dependencies** — any known external software or packages required.
- **Additional context** — supporting documentation, screenshots or examples where appropriate.

[Back](README.md)
