import { Child, Command } from "@tauri-apps/api/shell";

export const CommandHelper = {
    /**
     * Helper method to run the given command and return the stdout/stderr result.
     * @param commandString command to run
     * @param args arguments of the command
     * @returns a string containing the command + arguments, as well as the output of the command.
     */
    async runCommand(commandString: string, args: string[]): Promise<string> {
        const command = new Command(commandString, args);
        const handle = await command.execute();

        const stdout = handle.stdout;
        const stderr = handle.stderr;

        const output = `$ ${commandString} ${args.join(" ")}\n\n${stdout}\n${stderr}`;

        return output;
    },
    async getCommandHandle(commandString: string, args: string[]): Promise<Child> {
        const command = new Command(commandString, args);
        const handle = await command.spawn();
        return handle;
    },

    /**
     * Helper method to run the given command and return the stdout/stderr result.
     * This replaces runCommand() and allows for a process to be manually terminated by the user
     *
     * @param commandString command to run
     * @param args arguments of the command
     * @returns the pid string that can be used to terminate the executing process
     * and a string containing the executed command + arguments, as well as the output of the command.
     */
    async runCommandGetPidAndOutput(
        commandString: string,
        args: string[],
        onData: (data: string) => void,
        onTermination: ({ code, signal }: { code: number; signal: number }) => void
    ): Promise<{ pid: string; output: string }> {
        const command = new Command(commandString, args);
        const handle: Child = await command.spawn();
        const pid = handle.pid.toString();

        let stdout = "";
        let stderr = "";

        if (command.stdout) {
            command.stdout.on("data", (data) => {
                data = data.replace(/\u001b[^m]*?m/g, ""); // Uses regex to look for and remove any ANSI colour stylings
                stdout += data.toString() + "\n";
                onData(data.toString());
            });
        }

        if (command.stderr) {
            command.stderr.on("data", (data) => {
                stderr += data.toString() + "\n";
                onData(data.toString());
            });
        }

        return new Promise<{ pid: string; output: string }>((resolve, reject) => {
            command.on("close", ({ code, signal }: { code: number; signal: number }) => {
                if (pid !== undefined) {
                    onTermination({ code, signal });
                    resolve({ pid: pid, output: `${stdout}\n${stderr}` });
                } else {
                    reject(new Error("Failed to get process PID."));
                }
            });
            if (pid !== undefined) {
                resolve({ pid: pid, output: `$ ${commandString} ${args.join(" ")}\n\n${stdout}\n${stderr}` });
            } else {
                reject(new Error("Failed to get process PID."));
            }
        });
    },
    /**
     * Implementation note, known bug, and limitations:
     *
     * Purpose:
     * This function was introduced to facilitate developers in testing their code that requires elevated privileges. Prior to this,
     * it was not possible to test code segments that demanded 'sudo'. With the incorporation of 'pkexec', we can now invoke commands
     * with elevated privileges, thereby enabling more comprehensive testing.
     *
     * Current Bug:
     * One of the limitations of this current implementation is that it doesn't keep track of the Child PID once the command starts.
     * This essentially means that, as of now, there's no way to cancel or interrupt the command once it has been initiated.
     * We are aware of this limitation and there are plans to address this in the future. However, for the time being, the bug persists.
     *
     * Implementation Limitation:
     * When using this function, every command executed in the current component (e.g., functions like nmap or airbase-ng) will be run
     * with root privileges. This means users will be prompted for the password every single time, leading to a potential user-experience
     * inconvenience. Developers and users should be aware of this behavior and use the function judiciously.
     *
     * Scope Bug:
     * There is an observed behavior wherein if you don't use `pkexec`, the `scope` is essential for specific commands (e.g., `snmp-check`)
     * in order for the command to execute. However, when `pkexec` is employed, the scope seems to default to `pkexec`, making other scopes
     * (like `snmp-check`) redundant or not required. This is an important nuance to be aware of when relying on the `scope` behavior.
     *
     * Usage:
     * If you're looking to test commands requiring elevated privileges, simply replace the `runCommandGetPidAndOutput()` with this
     * `runCommandWithPkexec()` function. When the command is executed correctly, a GUI will pop up prompting for the password of your
     * machine. Ensure that you, or the user executing the command, know the password beforehand, as this is a security measure to gain
     * elevated privileges.
     *
     * Note: It's essential to be cautious when testing with elevated privileges, especially in production or critical environments.
     */

    /**
     * Execute a command with elevated privileges using 'pkexec'.
     * This function mimics the behavior of `runCommandGetPidAndOutput()` but escalates privileges.
     * 'pkexec' provides a GUI for user password input, making it a more user-friendly method for privilege escalation.
     * This is especially useful for commands that traditionally need 'sudo'.
     *
     * @param commandString The primary command string to be executed.
     * @param args Array of arguments to pass to the command.
     * @param onData Callback function invoked upon receiving data from the command's output.
     * @param onTermination Callback function invoked when the command process terminates.
     * @returns A promise resolving to an object containing the PID and combined output of the command, or rejecting with an error message.
     */

    async runCommandWithPkexec(
        commandString: string,
        args: string[],
        onData: (data: string) => void,
        onTermination: ({ code, signal }: { code: number; signal: number }) => void
    ): Promise<{ pid: string; output: string }> {
        // Modify how the command is prepared with 'pkexec'
        const command = new Command("pkexec", [commandString, ...args]);
        const handle: Child = await command.spawn();
        const pid = handle.pid.toString();
        console.log(pid);

        let stdout = "";
        let stderr = "";

        if (command.stdout) {
            command.stdout.on("data", (data) => {
                stdout += data.toString() + "\n";
                onData(data.toString());
            });
        }

        if (command.stderr) {
            command.stderr.on("data", (data) => {
                stderr += data.toString() + "\n";
                onData(data.toString());
            });
        }

        return new Promise<{ pid: string; output: string }>((resolve, reject) => {
            command.on("close", ({ code, signal }: { code: number; signal: number }) => {
                if (pid !== undefined) {
                    onTermination({ code, signal });
                    resolve({ pid: pid, output: `${stdout}\n${stderr}` });
                } else {
                    reject(new Error("Failed to get process PID."));
                }
            });
            if (pid !== undefined) {
                resolve({ pid: pid, output: `$ pkexec ${commandString} ${args.join(" ")}\n\n${stdout}\n${stderr}` });
            } else {
                reject(new Error("Failed to get process PID."));
            }
        });
    },
};
