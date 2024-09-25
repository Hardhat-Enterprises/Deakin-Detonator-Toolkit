import { useState, useEffect, useCallback } from "react";
import { Button, Stack, TextInput, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile"; //v2
/**
 * Represents the form values for the Wifite component.
 */
interface FormValuesType {
    targetInterface: string;
    attackMode: string;
    channel: string;
    handshake: string;
    beacon: string;
}

/**
 * The Wifite component.
 * @returns The Wifite component.
 */
const Wifite = () => {
    // Component state variables
    const [loading, setLoading] = useState(false); // State variable to indicate loading state
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [verboseMode, setVerboseMode] = useState(false); // State variable for verbose mode

    // Component Constants
    const title = "Wifite";
    const description =
        "Wifite is a Python tool for automating the process of attacking WPA and WPA2 networks. It handles the cracking of handshakes and supports multiple attack modes.";
    const steps =
        "=== Required ===\n" +
        "Step 1: Select the network interface to use for scanning.\n" +
        "Step 2: Specify the attack mode you want to use (e.g., `-a 1` for deauthentication).\n" +
        "Step 3: Input the channel to scan (if applicable).\n" +
        "Step 4: Optionally, input a specific handshake file or beacon file to use.\n" +
        " \n" +
        "=== Optional ===\n" +
        "Step 5: Enable verbose mode for more detailed output.\n";
    const sourceLink = ""; // Link to the source code
    const tutorial = ""; // Link to the official documentation/tutorial
    const dependencies = ["wifite"]; // Contains the dependencies required by the component.

    // Form hook to handle form input
    let form = useForm({
        initialValues: {
            targetInterface: "",
            attackMode: "",
            channel: "",
            handshake: "",
            beacon: "",
        },
    });

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

            // Clear the child process pid reference. There is no longer a valid process running.
            setPid("");

            // Cancel the loading overlay. The process has completed.
            setLoading(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    /**
     * Handles form submission for the Wifite component.
     * @param {FormValuesType} values - The form values containing the target domain.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Construct arguments for the Wifite command based on form input
        let args = [];
        args = [values.targetInterface, "-a", values.attackMode];

        // Check if channel has a value and push it to args
        if (values.channel) {
            args.push("--channel", values.channel);
        }

        // Check if handshake has a value and push it to args
        if (values.handshake) {
            args.push("--handshake", values.handshake);
        }

        // Check if beacon has a value and push it to args
        if (values.beacon) {
            args.push("--beacon", values.beacon);
        }

        if (verboseMode) {
            args.push("-v"); // Add verbose mode option if enabled
        }

        // Execute the Wifite command via helper method and handle its output or potential errors
        CommandHelper.runCommandWithPkexec("wifite", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
                // Deactivate loading state
                // Update the UI with the results from the executed command
                setOutput(output);
                setAllowSave(true);
                setPid(pid);
            })
            .catch((error) => {
                // Display any errors encountered during command execution
                setOutput(`Error: ${error.message}`);
                // Deactivate loading state
                setLoading(false);
            });
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
                        label="Network Interface"
                        required
                        {...form.getInputProps("targetInterface")}
                        placeholder="e.g. wlan0"
                    />
                    <TextInput
                        label="Attack Mode"
                        required
                        {...form.getInputProps("attackMode")}
                        placeholder="e.g. 1 for deauth"
                    />
                    <TextInput label="Channel" {...form.getInputProps("channel")} placeholder="e.g. 6" />
                    <TextInput
                        label="Handshake File"
                        {...form.getInputProps("handshake")}
                        placeholder="e.g. /path/to/handshake.cap"
                    />
                    <TextInput
                        label="Beacon File"
                        {...form.getInputProps("beacon")}
                        placeholder="e.g. /path/to/beacon.pcap"
                    />
                    <Checkbox
                        label="Verbose Mode"
                        checked={verboseMode}
                        onChange={(event) => setVerboseMode(event.currentTarget.checked)}
                    />
                    <Button type="submit">Start Attack</Button>
                    {output && <ConsoleWrapper output={output} />}
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Wifite;
