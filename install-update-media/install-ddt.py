import sys
import json
import subprocess
import time
import os

def run_command(command, message, sudo=False):
    """
    Executes a shell command.

    Args:
        command (str): The command to be executed.
        message (str):The message to show to the user of the current step.
        sudo (bool, optional): Whether to run the command with sudo. Defaults to False.
    """

    # Initialise global variables within the function.
    global TOTAL_STEPS
    global DEBUG
    global current_step

    # Print the loading bar.
    print_loading_bar(current_step, message, TOTAL_STEPS)

    # Run the command.
    # If debug mode is enabled, show the output.
    if DEBUG:

        # If sudo is enabled, run the command with sudo.
        if sudo:
            subprocess.run(f"sudo {command}", shell=True)

        # If sudo is not enabled, run the command without sudo.
        else:
            subprocess.run(command, shell=True)

    # If debug mode is not enabled, hide the output.
    else:

        # If sudo is enabled, run the command with sudo.
        if sudo:
            subprocess.run(f"sudo {command}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # If sudo is not enabled, run the command without sudo.
        else:
            subprocess.run(command, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Increment the current step counter.
    # This is used to update the loading bar.
    current_step += 1

def print_loading_bar(iteration, message, total, length=50):
    """
    Prints a loading bar to indicate the progress of an iteration.

    Parameters:
    - iteration (int): The current iteration.
    - message (str): The message to be displayed.
    - total (int): The total number of iterations.
    - length (int): The length of the loading bar (default is 50).

    Returns:
    None
    """

    # Initialise global variables within the function.
    global last_step_message, DEBUG

    percent = int(iteration / total * 100)               # Calculate the percentage of the total iterations.
    bar_length = int(length * iteration / total)         # Calculate the length of the loading bar.
    bar = "=" * bar_length + "-" * (length - bar_length) # Create the loading bar.

    # Clear the terminal if debug mode is not enabled.
    # This prevents the terminal from being cluttered with output.
    if not DEBUG:
        os.system('clear')

    # Print the loading bar.
    # If the iteration is the last iteration, print the last step message.
    if iteration == total:
        sys.stdout.write(f"\r\033[K{last_step_message} (Complete)\n")
        sys.stdout.flush()

    # If the iteration is not the last iteration, print the current step message.
    else:
        sys.stdout.write(f"{last_step_message} (Complete)\n")   # Print the last step message.
        last_step_message = message                             # Update the last step message.
        sys.stdout.write(f"{message} (In Progress)\n")          # Print the current step message.
        sys.stdout.write(f"[{bar}] {percent}% Complete\n")      # Print the loading bar.
        sys.stdout.flush()                                      # Flush the output buffer.

def new_terminal(command, message, title="Terminal", sudo=False):
    """
    Opens a new terminal window and executes the given command.

    Args:
        command (str): The command to be executed in the new terminal window.
        message (str): The message to be displayed before executing the command.
        title (str, optional): The title of the new terminal window. Defaults to "Terminal".
        sudo (bool, optional): Whether to run the command with sudo privileges. Defaults to False.
    """

    # Initialise global variables within the function.
    global DEBUG

    # Print the loading bar.
    # If debug mode is enabled, maintain the terminal. 
    if DEBUG:
        run_command(f"gnome-terminal --title='{title}' -- bash -c '{command}; exec bash'", message, sudo)
    
    # If debug mode is not enabled, close the terminal after the command has been executed.
    else:
        run_command(f"gnome-terminal --title='{title}' -- bash -c '{command}'", message, sudo)

def sleep_time(seconds, message):
    """
    Sleep for the specified number of seconds and display a countdown message.

    Parameters:
    - seconds (int): The number of seconds to sleep.
    - message (str): The message to display during the countdown.

    Returns:
    None
    """

    # Iterate over the number of seconds provided as an argument.
    for i in range(seconds, 0, -1):
        sys.stdout.write(f"\r\033[K{message}. Waiting {i} seconds...") # Print the countdown message.
        sys.stdout.flush()                                             # Flush the output buffer.
        time.sleep(1)                                                  # Sleep for 1 second.

    sys.stdout.write("\r\033[K")                                       # Clear the line after the countdown
    sys.stdout.flush()                                                 # Flush the output buffer.

def check_sudo():
    """
    Checks if the script is running with sudo.

    Returns:
        bool: Whether the script is running with sudo.
    """

    # If the user ID is 0, the script is running with sudo.
    return os.geteuid() == 0

# Establish global variables.
global TOTAL_STEPS 
global DEBUG
global last_step_message
global current_step

# Initialise constants.
TOTAL_STEPS = 13    # Total number of steps
DEBUG = False       # Whether to show debug information.
SLEEP_TIME = 20     # The number of seconds to sleep for.

# Initialise local variables.
current_step = 0                            # Iterable. Current step counter.
last_step_message = "Start Install Tool"    # The message of the last step.

# This script manually executes specific commands with sudo permissions.
# Therefore, it should not be run with sudo.
# If the command is run with sudo, the script will exit.
if (check_sudo()):
    print("Please do not run this script with sudo. Exiting...")
    exit()

# Get sudo permissions.
message = "Checking for sudo permissions..."
run_command("-v", message, True)

# Clone the repository and install dependencies.
message = "Downloading the Deakin Detonator Toolkit..."
run_command("git clone https://github.com/Hardhat-Enterprises/Deakin-Detonator-Toolkit", message)

# Temporary commands for functionality testing.
# TODO: Remove these commands.
# run_command("mv ./dependencies.json ./Deakin-Detonator-Toolkit/dependencies.json", "Moving dependencies.json to the DDT directory.")
# run_command("mv ./start-ddt.sh ./Deakin-Detonator-Toolkit/start-ddt.sh", "Moving start-ddt.sh to the DDT directory.")

# Read packages from the dependencies JSON file.
message = "Reading the list of software dependencies..."
print_loading_bar(current_step, message, TOTAL_STEPS)

# Read the dependencies from the JSON file. This is used to install the required software.
# TODO: Add a method to check if the software is already installed.
# Loads the json file into a dictionary.
with open("./Deakin-Detonator-Toolkit/install-update-media/dependencies.json", "r") as json_file:
    data = json.load(json_file)
    packages = data["packages"]
current_step += 1

# Update and upgrade the system
message = "Updating the system information..."
run_command("apt update", message, True)

# Upgrade the host.
message = "Upgrading the system (this may take a while)..."
run_command("apt upgrade --fix-missing -y", message, True)

# Install the packages.
message = "Installing the required software dependencies..."
run_command(f"apt install {' '.join(packages)} -y", message, True)

# Install Rust.
message = "Installing Rust..."
new_terminal('curl --proto "=https" --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y', message, "Rust Install Terminal")

# Add Rust to PATH.
# This allows running Rust commands from the terminal without restarting.
message = "Setting Rust PATH variable..."
print_loading_bar(current_step, message, TOTAL_STEPS)
os.environ["PATH"] = f"{os.path.expanduser('~')}/.cargo/bin:{os.environ['PATH']}"
current_step += 1

# TODO: Introduce a method to check if it installed rather than waiting specified time.
sleep_time(SLEEP_TIME, "Allowing time for Rust to install")

# Install Volta.
message = "Installing Volta..."
new_terminal('curl https://get.volta.sh | bash', message, "Volta Install Terminal")

# Set the PATH variable for the current session.
# This allows running Volta commands from the terminal without restarting.
message = "Setting Volta PATH variable..."
print_loading_bar(current_step, message, TOTAL_STEPS)
os.environ["PATH"] = f"{os.path.expanduser('~')}/.volta/bin:{os.environ['PATH']}"
current_step += 1

# TODO: Introduce a method to check if it installed rather than waiting specified time.
sleep_time(SLEEP_TIME, "Allowing time for volta to install")

# Install Node.
message = "Installing Node..."
new_terminal('volta install node', message, "Node Install Terminal")

# TODO: Introduce a method to check if it installed rather than waiting specified time.
sleep_time(SLEEP_TIME, "Allowing time for NODE to install")

# Install Yarn.
message = "Installing Yarn..."
new_terminal('volta install yarn', message, "Yarn Install Terminal")

# TODO: Introduce a method to check if it installed rather than waiting specified time.
sleep_time(SLEEP_TIME, "Allowing time for YARN to install")

os.chdir("./Deakin-Detonator-Toolkit")
message = "Starting the Deakin Detonator Toolkit..."
new_terminal("sh ./install-update-media/start-ddt.sh", message, "DDT Terminal")

message = "Install DDT (Complete).\n\n"
print_loading_bar(current_step, message, TOTAL_STEPS)
