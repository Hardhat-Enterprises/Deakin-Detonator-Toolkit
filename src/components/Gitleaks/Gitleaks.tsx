import { useState, useCallback, useEffect } from "react";
import { Button, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";

/**
 * Represents the form values for the Gitleaks component.
 */
interface FormValuesType {
    filePath: string;
    logOpts: string;
    reportPath: string;
}

/**
 * The Gitleaks component.
 * @returns The Gitleaks component.
 */
function Gitleaks() {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable to check if the installation modal is open.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state for the installation modal.
    const [advancedMode, setAdvancedMode] = useState(false); // State variable to store the selected mode.

    // Component Constants.
    const title = "Gitleaks"; // Title of the component.
    const description =
        "Gitleaks is a tool for detecting hardcoded secrets like passwords, API keys, and tokens in git repositories."; // Description of the component.
    const steps =
        "Step 1: Enter the path to the directory you want to scan for secrets.\n" +
        "Step 2: (Optional) Enable advanced mode and configure additional options.\n" +
        "Step 3: Click the 'Start Gitleaks' button to initiate the scanning process.\n" +
        "Step 4: Review the output in the console to identify any detected secrets or sensitive information.\n";
    const sourceLink = "https://www.kali.org/tools/gitleaks/"; // Link to the source code or Kali Tools page.
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["gitleaks"]; // Dependencies required for the Gitleaks tool.

    // Form hook to handle form input.
    const form = useForm<FormValuesType>({
        initialValues: {
            filePath: "",
            logOpts: "",
            reportPath: "",
        },
    });

    // Check the availability of all commands in the dependencies array.
    useEffect(() => {
        // Check if the command is available and set the state variables accordingly.
        checkAllCommandsAvailability(dependencies)
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

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data received to the existing output.
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
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
            // If the process was terminated successfully, display a success message.
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
                // If the process was terminated due to a signal, display the signal code.
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
                // If the process was terminated with an error, display the exit code and signal code.
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }

            // Clear the child process pid reference. There is no longer a valid process running.
            setPid("");

            // Cancel the loading overlay. The process has completed.
            setLoading(false);

            // Now that loading has completed, allow the user to save the output to a file.
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData], // Dependency on the handleProcessData callback
    );

    /**
     * handSaveComplete: Recognises that the output file has been saved.
     * Passes the saved status back to SaveOutputToTextFile_v2
     */
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the Gitleaks tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     * @param {FormValuesType} values - The form values, containing the file path and advanced options.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Set the loading state to true to indicate that the process is starting.
        setLoading(true);

        // Disable saving the output to a file while the process is running.
        setAllowSave(false);

        // Check if the required field (file path) is provided.
        if (!values.filePath) {
            // If the file path is missing, display an error message.
            setOutput("Error: Please provide a file path.");

            // Set the loading state to false since the process won't start.
            setLoading(false);

            // Allow saving the output (which is just the error message) to a file.
            setAllowSave(true);

            // Exit the function early since the required field is missing.
            return;
        }

        // Construct the base arguments for the Gitleaks command.
        const baseArgs = ["detect", "-v", "-s", values.filePath];

        // Create an array to store the additional arguments based on advanced mode.
        const additionalArgs: string[] = [];

        if (advancedMode) {
            // Add the log options argument if a value is provided.
            if (values.logOpts) {
                additionalArgs.push("--log-opts", values.logOpts);
            }

            // Add the report path argument if a value is provided.
            if (values.reportPath) {
                additionalArgs.push("-r", values.reportPath);
            }
        }

        // Combine the base arguments and additional arguments.
        const args = [...baseArgs, ...additionalArgs];

        try {
            // Execute the Gitleaks command using the CommandHelper utility.
            // Pass the command name, arguments, and callback functions for handling process data and termination.
            const { pid, output } = await CommandHelper.runCommandGetPidAndOutput(
                "gitleaks",
                args,
                handleProcessData,
                handleProcessTermination,
            );

            // Update the state with the process ID and initial output.
            setPid(pid);
            setOutput(output);
        } catch (error: any) {
            // If an error occurs during command execution, display the error message.
            setOutput(`Error: ${error.message}`);

            // Set the loading state to false since the process failed.
            setLoading(false);

            // Allow saving the output (which includes the error message) to a file.
            setAllowSave(true);
        }
    };

    /**
     * clearOutput: Callback function to clear the console output.
     * It resets the state variable holding the output, thereby clearing the display.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, []);

    return (
        <>
            {/* Render the UserGuide component with component details */}
            <RenderComponent
                title={title}
                description={description}
                steps={steps}
                tutorial={tutorial}
                sourceLink={sourceLink}
            >
                {/* Render the installation modal if the command is not available */}
                {!loadingModal && (
                    <InstallationModal
                        isOpen={opened}
                        setOpened={setOpened}
                        feature_description={description}
                        dependencies={dependencies}
                    ></InstallationModal>
                )}
                <form onSubmit={form.onSubmit(onSubmit)}>
                    {/* Render the loading overlay and cancel button */}
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <Stack>
                        <TextInput label="File Path" required {...form.getInputProps("filePath")} />
                        <Switch
                            label="Advanced Mode"
                            checked={advancedMode}
                            onChange={(event) => setAdvancedMode(event.currentTarget.checked)}
                        />
                        {advancedMode && (
                            <>
                                <TextInput
                                    label="Log Options"
                                    description="Specify additional git log options"
                                    {...form.getInputProps("logOpts")}
                                />
                                <TextInput
                                    label="Report Path"
                                    description="Specify the path to save the report file"
                                    {...form.getInputProps("reportPath")}
                                />
                            </>
                        )}
                        <Button type={"submit"}>Start {title}</Button>
                        {/* Render the save output to file component */}
                        {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                        {/* Render the console wrapper component */}
                        <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                    </Stack>
                </form>
            </RenderComponent>
        </>
    );
}

export default Gitleaks;
