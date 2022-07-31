import { Command } from "@tauri-apps/api/shell";

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
};
