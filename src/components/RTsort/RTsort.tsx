import { Button, Stack } from "@mantine/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import InstallationModal from "../InstallationModal/InstallationModal";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";

// Function for implementing RTSort as GUI component
const RTSort = () => {
    // Component state variables
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); //  State variable to store the process ID of the command execution.
    const [allowSave, setAllowSave] = useState(false); //   State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [tablePath, setTablePath] = useState<string>(""); // Directory containing the rainbow tables to sort.

    // Component Constants.
    const title = "Rtsort"; // Title of the component.
    const description =
        "RTSort is a sub-function of the Rainbowcrack tool. This function sorts created rainbow tables."; // Description of the component.
    const steps =
        "Step 1: Click the picker below and select a rainbow table (.rt) file. Every file in the folder will be used.\n" +
        "Step 2: Click 'Start Sort'.\n" +
        "Step 3: See the console to view the results of the command's execution.\n";

    const sourceLink = "https://gitlab.com/kalilinux/packages/rainbowcrack"; // Link to the source code (or Kali Tools).
    const tutorial = "https://docs.google.com/document/d/1d_DmZxMeOaoJexz5mNqXMXd48rmTCWjwYAQg-Eyu7Qs/edit?usp=sharing"; // Link to the official documentation/tutorial.
    const binaryDependencies = ["rtsort"]; // Contains the dependencies required by the component.
    const packageDependencies = ["rainbowcrack"];

    // Check if the command is available and set the state variables accordingly.
    useEffect(() => {
        checkAllCommandsAvailability(binaryDependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable); // Set the command availability state
                setOpened(!isAvailable); // Set the modal state to opened if the command is not available
                setLoadingModal(false); // Set loading to false after the check is done
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false); // Also set loading to false in case of error
            });
    }, []);

    /** *
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     *  It updates the state by appending the new data received to the existing output.
     *  @param {string} data - The data received from the child process.
     * */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Append new data to the previous output.
    }, []);

    /**
     * handleProcessTermination: Callback to handle the termination of the child process.
     * Once the process termination is handled, it clears the process PID reference and
     * deactivates the loading overlay.
     * @param {object} param - An object containing information about the process termination.
     * @param {number} param.code - The exit code of the terminated process.
     * @param {number} param.signal - The signal code indicating how the process was terminated.
     */
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            // If the process was successful, display a success message.
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");

                // If the process was terminated manually, display a termination message.
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");

                // If the process was terminated with an error, display the exit and signal codes.
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }

            // Clear the child process pid reference
            setPid("");

            // Cancel the Loading Overlay
            setLoading(false);
            // Allow Saving as the output is finalised
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData], // Dependency on the handleProcessData callback
    );

    /**
     * pickTableFolder: Opens a native file picker filtered to .rt files
     * then stores just the containing directory in tablePath.
     */
    const pickTableFolder = async () => {
        const selected = await open({
            defaultPath: "/usr/share/rainbowcrack",
            filters: [{ name: "Rainbow Table", extensions: ["rt"] }],
            multiple: false,
        });
        if (typeof selected === "string") {
            const dir = selected.substring(0, selected.lastIndexOf("/"));
            setTablePath(dir);
        }
    };

    /**
     * onSubmit: Handler for the "Start Sort" button.
     * Runs rtsort against the folder containing the selected rainbow tables
     */
    const onSubmit = async () => {
        // Activate loading state to indicate ongoing process
        setLoading(true);
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);
        setOutput("");

        const args = [tablePath || "."];

        // Please note this command should not be cancelled as this will cause the rainbow table to be corrupted
        // Execute the rtsort command via helper method and handle its output or potential errors
        CommandHelper.runCommandWithPkexec("rtsort", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
                // Update the UI with the results from the executed command
                setOutput(output);
                setPid(pid);
            })
            .catch((error) => {
                setOutput(`Error: ${error.message}`);
                // Disallow save after the output
                setAllowSave(false);
                setLoading(false);
            });
    };

    /**
     * Clears the output state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setAllowSave(false);
        setHasSaved(false);
    }, [setOutput]);

    const handleSaveComplete = useCallback(() => {
        setHasSaved(true);
        setAllowSave(false);
    }, []);

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
                    dependencies={packageDependencies}
                ></InstallationModal>
            )}
            {LoadingOverlayAndCancelButtonPkexec(loading, pid, "", handleProcessData, handleProcessTermination)}
            <Stack>
                <div style={{ textAlign: "center" }}>
                    <div style={{ textAlign: "center", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>
                        Select Rainbow Table
                    </div>
                    <label style={{ cursor: "pointer", display: "inline-block" }} onClick={pickTableFolder}>
                        <img src="https://www.svgrepo.com/show/499790/upload.svg" alt="Upload" width={80} height={80} />
                        <div style={{ fontSize: "14px", color: "#666" }}>
                            {tablePath ? tablePath : "Select a path for .rt files"}
                        </div>
                    </label>
                </div>

                <Button onClick={onSubmit} disabled={!tablePath || loading}>
                    Start Sort
                </Button>
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </RenderComponent>
    );
};

export default RTSort;
