import { Button, Stack, TextInput, Alert, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect, useRef } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the EyeWitness component.
 */
interface FormValuesType {
    filePath: string;
    directory: string;
    timeout: string;
}

/**
 * Normalizes a file or directory path:
 * - Trims whitespace
 * - Collapses consecutive slashes
 * - Resolves '.' and '..' segments
 * - Strips trailing slash (unless path is '/')
 *
 * @param {string} p - Path to normalize
 * @returns {string} Normalized path
 */
export const normalizePath = (p: string): string => {
    const trimmed = (p || "").trim();
    if (!trimmed) return "";

    const isAbsolute = trimmed.startsWith("/");
    const segments = trimmed.split("/").filter(Boolean);
    const resolved: string[] = [];

    for (const segment of segments) {
        if (segment === ".") continue;
        if (segment === "..") {
            resolved.pop();
        } else {
            resolved.push(segment);
        }
    }

    const normalized = (isAbsolute ? "/" : "") + resolved.join("/");
    return normalized || (isAbsolute ? "/" : "");
};

/**
 * Validates the file path for EyeWitness.
 * Must be an absolute path pointing to a file (not root, not a directory).
 *
 * @param {string} filePath - Input file path to validate.
 * @returns {string | null} Error message if invalid, null if valid.
 */
export const validateFilePath = (filePath: string): string | null => {
    const trimmed = (filePath || "").trim();
    if (!trimmed) {
        return "File path is required.";
    }

    if (!trimmed.startsWith("/")) {
        return "File path must be an absolute path (start with /).";
    }

    const normalized = normalizePath(trimmed);
    if (normalized === "/") {
        return "File path cannot be the root directory.";
    }

    if (trimmed.endsWith("/") && normalized !== "/") {
        return "File path must point to a file, not a directory.";
    }

    return null;
};

// Top-level system directories that should never be targeted for output purge
const SYSTEM_DIRECTORIES = new Set([
    "/",
    "/bin",
    "/boot",
    "/dev",
    "/etc",
    "/home",
    "/lib",
    "/lib32",
    "/lib64",
    "/libx32",
    "/media",
    "/mnt",
    "/opt",
    "/proc",
    "/root",
    "/run",
    "/sbin",
    "/srv",
    "/sys",
    "/tmp",
    "/usr",
    "/var",
]);

/**
 * Validates the output directory for EyeWitness.
 * EyeWitness invokes shutil.rmtree on existing output directories under --no-prompt.
 * This validator prevents data loss by disallowing root/system directories,
 * user home/desktop directories, app directories, and directories containing the input file.
 *
 * @param {string} directory - Output directory to validate.
 * @param {string} [filePath] - Optional input file path to check for containment conflict.
 * @returns {string | null} Error message if invalid, null if valid.
 */
export const validateOutputDirectory = (directory: string, filePath?: string): string | null => {
    const trimmed = (directory || "").trim();
    if (!trimmed) {
        return "Output directory is required.";
    }

    if (!trimmed.startsWith("/")) {
        return "Output directory must be an absolute path (start with /).";
    }

    const normDir = normalizePath(trimmed);

    if (normDir === "/") {
        return "Output directory cannot be the root directory.";
    }

    if (SYSTEM_DIRECTORIES.has(normDir)) {
        return `Output directory cannot be a system directory (${normDir}).`;
    }

    // Protect user home directory (e.g., /home/kali)
    if (/^\/home\/[^/]+$/i.test(normDir)) {
        return `Output directory cannot be the user home directory. Please specify a dedicated subfolder (e.g., ${normDir}/eyewitness_results).`;
    }

    // Protect user common library directories (Desktop, Documents, Downloads, etc.)
    const userCommonDirRegex =
        /^\/(?:home\/[^/]+|root)\/(?:Desktop|Documents|Downloads|Music|Pictures|Videos|Public|Templates)$/i;
    if (userCommonDirRegex.test(normDir)) {
        return `Output directory cannot be a common user folder (${normDir}). Please specify a dedicated subfolder (e.g., ${normDir}/eyewitness_results).`;
    }

    // Protect the application directory itself
    if (normDir.endsWith("/Deakin-Detonator-Toolkit") || normDir.includes("/Deakin-Detonator-Toolkit/")) {
        return "Output directory cannot be within the Deakin-Detonator-Toolkit directory.";
    }

    // Check if input file is inside or matches the output directory
    if (filePath && filePath.trim()) {
        const normFile = normalizePath(filePath);
        if (normDir === normFile) {
            return "Output directory cannot be the same as the input file path.";
        }

        const dirPrefix = normDir === "/" ? "/" : `${normDir}/`;
        if (normFile.startsWith(dirPrefix)) {
            return "Output directory contains the input file. EyeWitness purges the output directory before scanning; please specify a dedicated directory separate from the input file.";
        }
    }

    return null;
};

/**
 * Validates timeout input for EyeWitness.
 * Must be a positive integer.
 *
 * @param {string} timeout - Timeout string to validate.
 * @returns {string | null} Error message if invalid, null if valid.
 */
export const validateTimeout = (timeout: string): string | null => {
    const trimmed = (timeout || "").trim();
    if (!trimmed) {
        return "Timeout is required.";
    }

    if (!/^\d+$/.test(trimmed)) {
        return "Timeout must be a positive integer (e.g., 15).";
    }

    const parsed = parseInt(trimmed, 10);
    if (parsed <= 0) {
        return "Timeout must be greater than 0.";
    }

    if (parsed > 3600) {
        return "Timeout cannot exceed 3600 seconds.";
    }

    return null;
};

/**
 * The Eyewitness component.
 * @returns The Eyewitness component.
 */
const title = "EyeWitness";
const description =
    "EyeWitness takes screenshots of websites, provides information about the server header, and identifies default credentials (if known). It presents this information in a HTML report.";
const steps =
    "Step 1: Create a plain text file on your local drive and add URLs to it. Each URL must be on its own line. Add the file path to the text file in the first field. \n\n" +
    "Step 2: Add the file path for a dedicated directory where you want the output saved in the second field (e.g., /home/kali/Desktop/eyewitness_results). Note: EyeWitness purges existing files in the output directory.\n\n" +
    "Step 3: Add a number in the third field for the maximum number of seconds for EyeWitness to try and screenshot a webpage, e.g. 20. \n\n" +
    "Step 4: Press the scan button. ";
const sourceLink = "https://www.kali.org/tools/eyewitness/#eyewitness"; // Link to the source code or relevant documentation.
const tutorial = "https://docs.google.com/document/d/1V4lIQbeIbKwNiLQqSXvJZ0HM34q5FDxe2HHP2t6d8mA/edit?usp=sharing"; // Link to the official tutorial/documentation.
const dependencies = ["eyewitness"]; // Dependencies required by the component.

function Eyewitness() {
    // State Variables
    const [loading, setLoading] = useState(false); // Controls the loading state of the component
    const [output, setOutput] = useState(""); // Stores the output generated by the command
    const [pid, setPid] = useState(""); // Stores the PID of the running command process
    const [allowSave, setAllowSave] = useState(false); // Determines whether saving the output is allowed
    const [hasSaved, setHasSaved] = useState(false); // Indicates whether the output has been saved
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal
    const [showAlert, setShowAlert] = useState(true);
    const alertTimeout = useRef<NodeJS.Timeout | null>(null);

    let form = useForm({
        initialValues: {
            filePath: "",
            directory: "",
            timeout: "",
        },
        validate: {
            filePath: (value) => validateFilePath(value),
            directory: (value, values) => validateOutputDirectory(value, values.filePath),
            timeout: (value) => validateTimeout(value),
        },
    });

    useEffect(() => {
        // Check if the command is available and set the state variables accordingly.
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable); // Set the command availability state.
                setOpened(!isAvailable); // Set the modal state to opened if the command is not available.
                setLoadingModal(false); // Set loading to false after the check is done.
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false); // Also set loading to false in case of error.
            });
        // Set timeout to remove alert after 5 seconds on load.
        alertTimeout.current = setTimeout(() => {
            setShowAlert(false);
        }, 5000);

        return () => {
            if (alertTimeout.current) {
                clearTimeout(alertTimeout.current);
            }
        };
    }, []);

    const handleShowAlert = () => {
        setShowAlert(true);
        if (alertTimeout.current) {
            clearTimeout(alertTimeout.current);
        }
        alertTimeout.current = setTimeout(() => {
            setShowAlert(false);
        }, 5000);
    };

    // Uses the callback function of runCommandGetPidAndOutput to handle and save data
    // generated by the executing process into the output state variable.
    /**
     * Handles the data received from the subprocess and appends it to the output.
     *
     * @param {string} data - The string data received from the subprocess.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output
    }, []);

    // Uses the onTermination callback function of runCommandGetPidAndOutput to handle
    // the termination of that process, resetting state variables, handling the output data,
    // and informing the user.
    /**
     * Handles the termination of the subprocess, updating the state and processing the output data.
     *
     * @param {object} params - The termination event parameters.
     * @param {number} params.code - The exit code of the subprocess.
     * @param {number} params.signal - The termination signal code.
     */
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("\nProcess completed successfully."); // Successful completion message
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated."); // Manual termination message
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`); // Error message
            }

            setPid(""); // Clear the child process pid reference
            setLoading(false); // Cancel the Loading Overlay
            setAllowSave(true); // Allow Saving as the output is finalised
            setHasSaved(false); // Reset save status
        },
        [handleProcessData],
    );

    // Actions taken after saving the output
    /**
     * Handles the state updates after a save operation is completed.
     * Allows saving and indicates that the save has been completed.
     */
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * Handles form submission, executes the EyeWitness tool, and updates the state.
     *
     * @param {FormValues} values - The form input values.
     * @returns {Promise<void>} - An asynchronous operation.
     */
    const onSubmit = async (values: FormValuesType) => {
        if (form.validate().hasErrors) {
            return;
        }

        const fileError = validateFilePath(values.filePath);
        if (fileError) {
            setOutput(`Error: ${fileError}`);
            return;
        }

        const dirError = validateOutputDirectory(values.directory, values.filePath);
        if (dirError) {
            setOutput(`Error: ${dirError}`);
            return;
        }

        const timeoutError = validateTimeout(values.timeout);
        if (timeoutError) {
            setOutput(`Error: ${timeoutError}`);
            return;
        }

        setAllowSave(false); // Disallow saving until the tool's execution is complete
        setLoading(true); // Enable the Loading Overlay

        const args = [`-f`, `${values.filePath.trim()}`];
        args.push(`--web`);
        args.push(`-d`, `${values.directory.trim()}`);
        args.push(`--timeout`, `${values.timeout.trim()}`);
        args.push(`--no-prompt`);

        CommandHelper.runCommandGetPidAndOutput("eyewitness", args, handleProcessData, handleProcessTermination)
            .then(({ pid, output }) => {
                setPid(pid);
                setOutput(output);
            })
            .catch((error) => {
                setLoading(false); // Cancel the Loading Overlay
                setOutput(`Error: ${error.message}`);
            });
    };

    /**
     * Clears the output data and resets the save state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    return (
        <RenderComponent
            title={title}
            description={description}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description}
                    dependencies={dependencies}
                ></InstallationModal>
            )}
            <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                {LoadingOverlayAndCancelButton(loading, pid)}
                <Stack>
                    <Group position="right">
                        {!showAlert && (
                            <Button onClick={handleShowAlert} size="xs" variant="outline" color="gray">
                                Show Disclaimer
                            </Button>
                        )}
                    </Group>
                    {showAlert && (
                        <Alert title="Warning: Potential Risks" color="red">
                            This tool is used to perform website enumeration, use with caution and only on targets you
                            own or have explicit permission to test.
                        </Alert>
                    )}

                    <p>{description}</p>
                    <TextInput
                        label={"Enter the file name or path containing URLs:"}
                        placeholder={"Example: /home/kali/Desktop/urls.txt"}
                        required
                        {...form.getInputProps("filePath")}
                    />
                    <TextInput
                        label={
                            "Enter the directory name where you want to save screenshots or define path of directory:"
                        }
                        placeholder={"Example: /home/kali/Desktop/eyewitness_results"}
                        required
                        {...form.getInputProps("directory")}
                    />
                    <TextInput
                        label={"Enter the timeout time (in seconds):"}
                        placeholder={"Example: 15"}
                        required
                        {...form.getInputProps("timeout")}
                    />
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type={"submit"}>Scan</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}
export default Eyewitness;
