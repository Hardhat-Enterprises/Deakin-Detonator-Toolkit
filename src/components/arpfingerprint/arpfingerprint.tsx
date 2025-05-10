import { useState, useCallback, useEffect, useRef } from "react";
import { Button, Stack, TextInput, Alert, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";

/**
 * Represents the form values for the ARPfingerprint component.
 */
interface FormValuesType {
    interface: string;
}

/**
 * The ARPfingerprint component.
 * @returns The ARPfingerprint component.
 */
function ARPFingerprinting() {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable to check if the installation modal is open.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state for the installation modal.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [showAlert, setShowAlert] = useState(true);
    const alertTimeout = useRef<NodeJS.Timeout | null>(null);

    // Component Constants.
    const title = "ARP fingerprint Tool"; // Title of the component.
    const description =
        "ARP fingerprinting is a network reconnaissance technique used to detect the operating systems and devices in a network."; // Description of the component.
    const steps = "Step 1: Enter the IP address of the target device.\n";
    ("Step 2: Click Scan to start ARP fingerprinting.\n");
    ("Step 3: View the Output block below to see the fingerprinting results.");
    const sourceLink = "https://www.kali.org/tools/arp-scan/#arp-fingerprint"; // Link to the source code or Kali Tools page.
    const tutorial = "https://docs.google.com/document/d/1PLMdKlXsbzYI9rF25Fo_Gv8aDJvtai0s09hPjM7NA6w/edit?usp=sharing"; // Link to the official documentation/tutorial.
    const dependencies = ["arp-scan"]; // Dependencies required for the ARPfingerprint tool.

    // Form hook to handle form input.
    const form = useForm<FormValuesType>({
        initialValues: {
            interface: "",
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
                handleProcessData("\nARP fingerprinting completed successfully.");

                // If the process was terminated manually, display a termination message.
            } else if (signal === 15) {
                handleProcessData("\nARP fingerprinting was manually terminated.");

                // If the process was terminated with an error, display the exit and signal codes.
            } else {
                handleProcessData(`\nARP fingerprinting terminated with exit code: ${code} and signal code: ${signal}`);
            }

            // Cancel the loading overlay. The process has completed.
            setLoading(false);

            // Now that loading has completed, allow the user to save the output to a file.
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    /**
     * handleSaveComplete: Recognizes that the output file has been saved.
     * Passes the saved status back to SaveOutputToTextFile_v2.
     */
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the ARPfingerprint tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *@param {FormValuesType} values - The form values, containing target IP.     */
    const onSubmit = async (values: FormValuesType) => {
        // Set the loading state to true to indicate that the process is starting.
        setLoading(true);

        // Disable saving the output to a file while the process is running.
        setAllowSave(false);

        // Construct the arguments for the ARPfingerprint command.
        const args = [`-l`, values.interface];
        // Execute the ARPFingerprint command via helper method and handle its output or potential errors
        CommandHelper.runCommandWithPkexec("arp-fingerprint", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
                setOutput(output);
                setPid(pid);
            })
            .catch((error) => {
                // Display any errors encountered during command execution
                setOutput(`Error: ${error.message}`);
                // Deactivate loading state
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
                    <Group position="right">
                        {!showAlert && (
                            <Button onClick={handleShowAlert} size="xs" variant="outline" color="gray">
                                Show Disclaimer
                            </Button>
                        )}
                    </Group>
                    {/* Render the loading overlay and cancel button */}
                    {LoadingOverlayAndCancelButton(loading, pid)}

                    {showAlert && (
                        <Alert title="Warning: Potential Risks" color="red">
                            This tool is used to perform ARP fingerprinting, use with caution and only on networks you
                            own or have explicit permission to test.
                        </Alert>
                    )}

                    <Stack>
                        <TextInput label="Target IP address" required {...form.getInputProps("targetIP")} />
                        {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}

                        <Button type={"submit"} disabled={loading}>
                            Start {title}
                        </Button>

                        {/* Render the console wrapper component */}
                        <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                    </Stack>
                </form>
            </RenderComponent>
        </>
    );
}

export default ARPFingerprinting;
