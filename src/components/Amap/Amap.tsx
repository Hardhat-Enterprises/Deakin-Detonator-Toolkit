import { Button, NativeSelect, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

// Component Constants
const title = "AMAP"; // Contains the title of the component.

// Contains the description of the component.
const description_userguide =
    "AMAP is a network scanning tool used to identify open ports and services on target hosts.\n\n" +
    "How to use AMAP:\n\n" +
    "Step 1: Enter the target IP address or domain name.\n" +
    "Step 2: Optionally configure advanced scanning options.\n" +
    "Step 3: Click 'Start Scan' to begin the scanning process.\n" +
    "Step 4: View the output block below to see the results.";

/**
 * Represents the form values for the AMAP component.
 */
interface FormValuesType {
    target: string;
    scanType: string;
    options: string;
}

const AMAP = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable to check if the installation modal is open.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state for the installation modal.

    // AMAP specific state variables.
    const [advancedMode, setAdvancedMode] = useState(false); // State variable to store the selected mode.
    const [selectedScanType, setSelectedScanType] = useState(""); // State variable to store the selected scan type.

    // Component Constants.
    const scanTypes = ["TCP", "UDP", "SYN", "NULL", "FIN"]; // Scan types supported by AMAP.
    const dependencies = ["amap"]; // Dependencies required for the AMAP tool.

    useEffect(() => {
        // Check the availability of all commands in the dependencies array.
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                // Set the state variable to indicate if the command is available.
                setIsCommandAvailable(isAvailable);
                // Set the state variable to indicate if the installation modal should be open.
                setOpened(!isAvailable);
                // Set the loading state of the installation modal to false after the check is done.
                setLoadingModal(false);
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                // Set the loading state of the installation modal to false in case of error.
                setLoadingModal(false);
            });
    }, []);

    // Form Hook to handle form input.
    const form = useForm({
        initialValues: {
            target: "",
            scanType: "",
            options: "",
        },
    });

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data received to the existing output.
     * @param {string} data - The data received from the child process.
     */
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
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    // Actions taken after saving the output
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the amap tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the target and scan type.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Construct arguments for the amap command based on form input
        const args = [values.target];

        values.scanType ? args.push(`-s`, values.scanType) : undefined;
        values.options ? args.push(values.options) : undefined;

        // Execute the amap command via helper method and handle its output or potential errors
        CommandHelper.runCommandGetPidAndOutput("amap", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
                // Update the output with the results of the command execution.
                setOutput(output);

                // Store the process ID of the executed command.
                setPid(pid);
            })
            .catch((error) => {
                // Display any errors encountered during command execution.
                setOutput(error.message);

                // Deactivate loading state.
                setLoading(false);
            });
    };

    /**
     * clearOutput: Callback function to clear the console output.
     * It resets the state variable holding the output, thereby clearing the display.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    return (
        <>
            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description_userguide}
                    dependencies={dependencies}
                ></InstallationModal>
            )}

            <form onSubmit={form.onSubmit(onSubmit)}>
                {LoadingOverlayAndCancelButton(loading, pid)}
                <Stack>
                    {UserGuide(title, description_userguide)}
                    <TextInput label={"Target IP/Domain"} required {...form.getInputProps("target")} />
                    <Switch
                        size="md"
                        label="Advanced Mode"
                        checked={advancedMode}
                        onChange={(e) => setAdvancedMode(e.currentTarget.checked)}
                    />
                    {advancedMode && (
                        <TextInput label={"Additional Options"} {...form.getInputProps("options")} />
                    )}
                    <NativeSelect
                        value={selectedScanType}
                        onChange={(e) => setSelectedScanType(e.target.value)}
                        title={"Scan Type"}
                        data={scanTypes}
                        placeholder={"Scan Type"}
                        description={"Please select the type of scan."}
                    />
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type={"submit"}>Start Scan</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </>
    );
};

export default AMAP;
