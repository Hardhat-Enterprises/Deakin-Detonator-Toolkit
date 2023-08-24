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
};
