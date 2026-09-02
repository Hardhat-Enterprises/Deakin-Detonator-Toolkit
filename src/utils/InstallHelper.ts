import { checkCommandAvailability } from "./CommandAvailability";
import { CommandHelper } from "./CommandHelper";

/**
 * Installs dependencies that are not already available.
 *
 * The installation uses a single pkexec session so the user should
 * only receive one authentication prompt for the complete apt process.
 *
 * @param dependencies - Array of dependencies to install.
 * @param setOutput - Function used to update installation output.
 * @returns A boolean array indicating whether each dependency is available.
 */
export const installDependencies = async (
    dependencies: string[],
    setOutput: (updater: (prevOutput: string) => string) => void
): Promise<boolean[]> => {
    /**
     * Add process information to the installation console.
     */
    const handleProcessData = (data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    };

    /**
     * Check which dependencies are already installed.
     */
    handleProcessData(`[DEBUG] Checking dependencies at: ${new Date().toISOString()}`);

    const initialResults: boolean[] = [];

    for (const dependency of dependencies) {
        const isAvailable = await checkCommandAvailability(dependency);
        initialResults.push(isAvailable);

        if (isAvailable) {
            handleProcessData(`[INFO] '${dependency}' is already installed.`);
        } else {
            handleProcessData(`[INFO] '${dependency}' is not installed.`);
        }
    }

    /**
     * Only install dependencies that are actually missing.
     */
    const missingDependencies = dependencies.filter((_, index) => !initialResults[index]);

    /**
     * Everything is already installed.
     * No pkexec/authentication is required.
     */
    if (missingDependencies.length === 0) {
        handleProcessData("\n[INFO] All required dependencies are already installed.");

        handleProcessData("[INFO] Installation process skipped.");

        return initialResults;
    }

    /**
     * Basic validation before putting package names into the shell command.
     * Debian package names normally contain letters, numbers, +, -, . and :
     */
    const packageNamePattern = /^[a-zA-Z0-9.+:-]+$/;

    const safeDependencies = missingDependencies.filter((dependency) => packageNamePattern.test(dependency));

    if (safeDependencies.length !== missingDependencies.length) {
        handleProcessData("\n[ERROR] Invalid dependency name detected. Installation cancelled.");

        return initialResults;
    }

    const installCommand = safeDependencies.join(" ");

    handleProcessData(`[DEBUG] Starting dependency installation at: ${new Date().toISOString()}`);

    handleProcessData(`[INFO] Installing: ${installCommand}`);

    /**
     * Run BOTH apt-get update and apt-get install through a SINGLE
     * pkexec invocation.
     *
     * This avoids multiple authentication prompts.
     *
     * Using && also ensures installation will not continue when
     * apt-get update fails.
     */
    const command =
        `apt-get update && ` +
        `DEBIAN_FRONTEND=noninteractive ` +
        `apt-get install --no-install-recommends -y ${installCommand}`;

    const installationSuccessful = await new Promise<boolean>((resolve) => {
        CommandHelper.runCommandWithPkexec("sh", ["-c", command], handleProcessData, ({ code, signal }) => {
            if (code === 0) {
                handleProcessData("\n[INFO] Dependency installation completed successfully.");

                resolve(true);
                return;
            }

            if (signal === 15) {
                handleProcessData("\n[ERROR] Installation was manually cancelled.");

                resolve(false);
                return;
            }

            handleProcessData(`\n[ERROR] Installation failed with exit code ${code}.`);

            if (signal) {
                handleProcessData(`[ERROR] Process signal: ${signal}`);
            }

            resolve(false);
        });
    });

    if (!installationSuccessful) {
        handleProcessData("\n[ERROR] One or more dependencies could not be installed.");
    }

    /**
     * Verify every dependency again after the installation attempt.
     */
    handleProcessData(`[DEBUG] Verifying dependencies at: ${new Date().toISOString()}`);

    const finalResults: boolean[] = [];

    for (const dependency of dependencies) {
        const isAvailable = await checkCommandAvailability(dependency);

        finalResults.push(isAvailable);

        if (isAvailable) {
            handleProcessData(`[SUCCESS] '${dependency}' is available.`);
        } else {
            handleProcessData(`[ERROR] '${dependency}' is still unavailable.`);
        }
    }

    handleProcessData(`[DEBUG] Dependency verification completed at: ${new Date().toISOString()}`);

    return finalResults;
};
