import { useState, useEffect, useCallback } from "react";
import { Button, Stack, TextInput, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";

/**
 * Represents the form values for the Arping component.
 */
interface FormValuesType {
    targetIP: string;
    count: string;
    interface: string;
    verbose: boolean;
}

/**
 * The Arping component.
 * @returns The Arping component.
 */
const Arping = () => {
    // Component state variables
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [pid, setPid] = useState("");

    // Component Constants
    const title = "Arping"; // Title for the Arping component.
    const description = "Arping is a tool to send ARP requests to a specified IP address to discover the MAC address.";
    const steps =
        "=== Required ===\n" +
        "Step 1: Input the target IP address to send ARP requests.\n" +
        "Step 2: Optionally specify the number of requests to send.\n" +
        "Step 3: Specify the network interface to use for sending ARP requests.\n" +
        "Step 4: Check the verbose mode to get detailed output.\n"; // Description providing information about the Arping component.
    const sourceLink = "http://github.com/ThomasHabets/arping"; // Link to the source code
    const tutorial = "https://www.kali.org/tools/arping/"; // Link to the official documentation/tutorial
    const dependencies = ["arping"]; // Contains the dependencies required by the component.

    // Form hook to handle form input
    const form = useForm<FormValuesType>({
        initialValues: {
            targetIP: "",
            count: "",
            interface: "",
            verbose: false,
        },
    });

    useEffect(() => {
        // Check if the command is available and set the state variables accordingly.
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                // Set the command availability state.
                setIsCommandAvailable(isAvailable);
                // Set the modal state to opened if the command is not available.
                setOpened(!isAvailable);
                // Set loading to false after the check is done.
                setLoadingModal(false); // Ensure this is set to false even if successful
            })
            .catch((error) => {
                // Also set loading to false in case of error.
                console.error("An error occurred:", error);
                setLoadingModal(false); // Crucial change, set to false even on errors
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
            // If the process was successful, display a success message.
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
                // If the process was terminated manually, display a termination message.
            } else if (signal === 2) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                // If the process was terminated with an error, display the exit and signal codes.
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }
            // Clear the child process pid reference. There is no longer a valid process running.
            setPid("");
            // Cancel the loading overlay. The process has completed.
            setLoading(false);
            // Allow Saving as the output is finalised
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    /**
     * Function to handle form submission.
     * Executes the Arping component with the provided form values.
     * @param {FormValuesType} values - Form values containing Arping input.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process.
        setLoading(true);
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);
        // Construct arguments for the Arping component command based on form input.
        let args = [values.targetIP];

        if (values.count) {
            args.push("-c", values.count);
        }

        if (values.interface) {
            args.push("-I", values.interface);
        }

        if (values.verbose) {
            args.push("-v");
        }
        //Execute the Arping component via helper method and handle its output or potential errors.
        CommandHelper.runCommandWithPkexec("arping", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
                // Update the UI with the results from the executed command
                setOutput(output);
                setAllowSave(true);
                setPid(pid);
            })
            .catch((error) => {
                // Display any errors encountered during command execution
                setOutput(error.message);
                // Deactivate loading state
                setLoading(false);
                setAllowSave(true);
            });
    };

    /**
     * handleSaveComplete: Callback to handle the completion of the file saving process.
     * It updates the state by indicating that the file has been saved and deactivates the save button.
     */
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * clearOutput: Callback function to clear the console output.
     * It resets the state variable holding the output, thereby clearing the display.
     */
    const clearOutput = () => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    };

    // Render component
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
                />
            )}
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, handleProcessData, handleProcessTermination)}
                    <TextInput
                        label="Target IP Address"
                        required
                        {...form.getInputProps("targetIP")}
                        placeholder="e.g. 192.168.1.1"
                    />
                    <TextInput label="Count of ARP Requests" {...form.getInputProps("count")} placeholder="e.g. 5" />
                    <TextInput label="Network Interface" {...form.getInputProps("interface")} placeholder="e.g. eth0" />
                    <Checkbox
                        label="Verbose Mode"
                        checked={form.values.verbose}
                        onChange={(event) => form.setFieldValue("verbose", event.currentTarget.checked)}
                    />
                    <Button type={"submit"}>Start {title}</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Arping;
