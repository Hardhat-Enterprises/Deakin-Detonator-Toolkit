import { checkCommandAvailability } from "./CommandAvailability";
import { CommandHelper } from "./CommandHelper";

/**
 * Installs a dependency using the specified package manager.
 * @param dependency - The name of the dependency to install.
 * @param setOutput - A function to update the output state.
 * @returns A promise that resolves to a boolean indicating whether the installation was successful.
 */
const installDependency = async (
    dependency: string,
    setOutput: React.Dispatch<React.SetStateAction<string>>
): Promise<boolean> => {
    /**
     * Handles the processed data from a process.
     * @param data - The data to be handled.
     */
    const handleProcessData = (data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    };

    const handleProcessTermination = ({ code, signal }: { code: number; signal: number }) => {
        if (code === 0) {
            handleProcessData("\nProcess completed successfully."); // Notify that the process completed successfully.
        } else if (signal === 15) {
            handleProcessData("\nProcess was manually terminated."); // Notify that the process was manually terminated.
        } else {
            handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`); // Notify the exit code and signal code of the process termination.
        }
    };

    // Runs the `apt-get update` process to update package lists before installation
    // Log beginning of apt-get update command
    handleProcessData(`[DEBUG] Starting 'apt-get update' at: ${new Date().toISOString()}`);
    await new Promise<void>((resolve, reject) => {
        // Run the command to perform 'apt-get update' using pkexec
        CommandHelper.runCommandWithPkexec(
            "sh",
            ["-c", `apt-get update | tee /dev/null`],
            handleProcessData,
            (terminationDetails) => {
                handleProcessTermination(terminationDetails);
                // Log end of apt-get update command
                handleProcessData(`[DEBUG] 'apt-get update' completed at: ${new Date().toISOString()}`);
                resolve(); 
            }
        );
    });

    return new Promise(async (resolve, reject) => {
        try {
            // Run the command to install the dependency using pkexec
            CommandHelper.runCommandWithPkexec(
                "apt-get",
                ["install", dependency],
                handleProcessData,
                handleProcessTermination
            );

            // Check if the dependency is available after installation
            if (await checkCommandAvailability(dependency)) {
                resolve(true); // Resolve with true if the dependency is available
            } else {
                resolve(false); // Resolve with false if the dependency is not available
            }
        } catch (error) {
            reject(error); // Reject with the error if there was an exception
        }
    });
};

/**
 * Installs the specified dependencies and returns an array of boolean values indicating the success of each installation.
 * @param dependencies - An array of strings representing the dependencies to be installed.
 * @param setOutput - A React dispatch function used to update the state of the output.
 * @returns A Promise that resolves to an array of boolean values indicating the success of each installation.
 */
export const installDependencies = async (
    dependencies: string[],
    setOutput: React.Dispatch<React.SetStateAction<string>>
): Promise<boolean[]> => {
    const results: boolean[] = [];
    for (const dependency of dependencies) {
        const result = await installDependency(dependency, setOutput);
        results.push(result);
        if (!result) {
            break; // Stop installing dependencies if one installation fails
        }
    }
    return results;
};
