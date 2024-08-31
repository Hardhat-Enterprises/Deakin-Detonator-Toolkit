import { checkCommandAvailability } from "./CommandAvailability";
import { CommandHelper } from "./CommandHelper";

/**
 * Installs a dependency using the specified package manager.
 * @param dependencies - The name of the dependency to install.
 * @param setOutput - A function to update the output state.
 * @returns A promise that resolves to a boolean indicating whether the installation was successful.
 */
export const installDependencies = async (
    dependencies: string[],
    setOutput: React.Dispatch<React.SetStateAction<string>>
): Promise<boolean[]> => {
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

    // Installs the specified dependencies
    // Log beginning of dependencies installation
    handleProcessData(`[DEBUG] Starting installation of dependencies at: ${new Date().toISOString()}`);
    const installCommand = dependencies.join(" ");
    await new Promise<void>((resolve, reject) => {
        // Run the command to install the dependencies using pkexec
        CommandHelper.runCommandWithPkexec(
            "sh",
            [
                "-c",
                `DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y ${installCommand} -o Debug::pkgProblemResolver=true | tee /dev/null`,
            ],
            handleProcessData,
            (terminationDetails) => {
                handleProcessTermination(terminationDetails);
                // Log end of dependencies installation
                handleProcessData(`[DEBUG] Installation of dependencies completed at: ${new Date().toISOString()}`);
                resolve();
            }
        );
    });

    // Verifies and returns if each dependency is installed
    // Log beginning of dependencies availability
    handleProcessData(`[DEBUG] Starting check for command availability at: ${new Date().toISOString()}`);
    const results: boolean[] = [];
    for (const dependency of dependencies) {
        const isAvailable = await checkCommandAvailability(dependency);
        results.push(isAvailable);
    }
    // Log end of dependencies availability
    handleProcessData(`[DEBUG] Command availability check completed at: ${new Date().toISOString()}`);

    return results;
};