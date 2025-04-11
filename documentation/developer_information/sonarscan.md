# Conducting sonar scan on the PT-GUI project

A SonarQube scan is an essential process used to analyse code for quality and security issues. By scanning the source code, it assists in locating bugs, vulnerabilities, code smells, and other such issues that impact the robustness and maintainability of the project. SonarQube offers feedback based on industry standards and supports a variety of programming languages. Continuous codebase improvement is made possible by its integration with development pipelines and tools, which provide developers with insights into code quality, technical debt, and potential security issues.

Below are the detailed steps to install and run a SonarQube scan on the PT-GUI project.

## Step 1: Install Docker on Kali Linux

To begin, Docker needs to be installed on your Kali Linux system. Use the following commands to install Docker:

```bash
sudo apt update
sudo apt install docker.io
```

## Step 2: Start and Enable Docker

Once Docker is installed, start and enable the Docker service with these commands:

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

## Step 3: Check Docker Status

Confirm that Docker is running properly by checking its status:

```bash
sudo systemctl status docker
```

## Step 4: Run SonarQube in a Docker Container

Now pull and run the SonarQube LTS image in a Docker container by executing:

```bash
sudo docker run -d --name sonarqube -p 9000:9000 sonarqube:lts
```

## Step 5: Access SonarQube

Once the container is running, access SonarQube by navigating to `http://localhost:9000` in your web browser. This will open the welcome page of SonarQube.

## Step 6: Create a Project in SonarQube

Click on the **"Manually"** option for creating a project. Enter a suitable project name and key for your PT-GUI project, then click **Set Up** to proceed.

## Step 7: Set Up Repository

On the next screen, SonarQube will prompt you to choose how to set up your repository. Since the scan will run locally, select the **Locally** option.

## Step 8: Generate a Token

Next, SonarQube will require a token for authentication. Provide a meaningful token name and click **Generate**. Copy this token, as it will be required later.

## Step 9: Select Project Language

Specify the primary programming language of your project. In the case of the PT-GUI project, select **TypeScript**.

## Step 10: Select Operating System

Select the operating system on which your project is running. This will provide the appropriate commands to execute the SonarQube scan for your setup.

## Step 11: Configure `sonar-project.properties`

Create a `sonar-project.properties` file in the root directory of your project. In this file, include the following details, ensuring to update the token generated in Step 8:

```properties
sonar.projectKey=your_project_key
sonar.projectName=your_project_name
sonar.login=your_generated_token
sonar.host.url=your localhosturl
```

## Step 12: Run the SonarQube Scan

Navigate to the project directory in the terminal and run the command provided by SonarQube in Step 10. This will initiate the Sonar scan.

## Step 13: View Scan Results

Once the scan is completed, navigate back to the SonarQube dashboard to view the analysis results. The dashboard will provide a detailed overview of code quality, security vulnerabilities, and areas for improvement.
