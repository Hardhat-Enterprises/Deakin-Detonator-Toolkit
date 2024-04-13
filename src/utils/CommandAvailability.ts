import { Command } from '@tauri-apps/api/shell';

/**
 * Checks the availability of a command in the system.
 * @param commandString - The command to check availability for.
 * @returns A promise that resolves to a boolean indicating whether the command is available or not.
 */
/**
 * Checks the availability of a command in the system.
 * @param commandString - The command to check availability for.
 * @returns A promise that resolves to a boolean indicating whether the command is available or not.
 */
export const checkCommandAvailability = (commandString: string): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try{
            // Create a new Command instance with the "which" command and the specified commandString
            const command = new Command("which", [commandString]);
            // Execute the command and get the handle
            const handle = await command.execute();
    
            // Check if the stdout of the handle has any output
            if (handle.stdout.length > 0) {
                // If there is output, resolve the promise with true indicating that the command is available
                resolve(true);
            } else {
                // If there is no output, resolve the promise with false indicating that the command is not available
                resolve(false);
            }
        }
        catch (error) {
            // If there is an error, reject the promise with the error
            reject(error);
        }
    });
};

/**
 * Checks the availability of all commands in the given array.
 * @param commands - An array of commands to check availability for.
 * @returns A Promise that resolves to a boolean indicating whether all commands are available.
 * @throws If there is an error while checking command availability.
 */
/**
 * Checks the availability of all commands in the given array.
 * @param commands - An array of commands to check availability for.
 * @returns A Promise that resolves to a boolean indicating whether all commands are available.
 * @throws If there is an error while checking command availability.
 */
export const checkAllCommandsAvailability = async (commands: string[]): Promise<boolean> => {
    try {
        // Iterate over each command in the array
        for (const command of commands) {
            // Check the availability of the command using the checkCommandAvailability function
            const isAvailable = await checkCommandAvailability(command);
            // If the command is not available, return false indicating that not all commands are available
            if (!isAvailable) {
                return false;
            }
        }
        // If all commands are available, return true
        return true;
    } catch (error) {
        // If there is an error while checking command availability, throw the error
        throw error;
    }
};