import { useState, useCallback, useEffect, useRef } from "react";
import { Button, Stack, TextInput, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";

/**
 * Represents the form values for the ARPScan component.
 */
interface FormValuesType {
    interface: string;
}

/**
 * The ARPScan component.
 * @returns The ARPScan component.
 */
function ARPScan() {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable to check if the installation modal is open.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state for the installation modal.
    const [showAlert, setShowAlert] = useState(true);
    const alertTimeout = useRef<NodeJS.Timeout | null>(null);

    // Component Constants.
    const title = "ARP Scan Tool"; // Title of the component.
    const description =
        "ARP scanning is a network discovery technique used to map out the devices within a local network. " +
        "The tool sends out ARP requests and collects responses to build a list of active IP and MAC addresses " +
        "within the network. ARP scanning is often used for network inventory and security assessments."; // Description of the component.
    const steps =
        "Step 1: Click on the 'Scan' button to start the ARP scan.\n" +
        "Step 2: View the Output block below to see the results of the scan.\n";
    const sourceLink = "https://www.kali.org/tools/arp-scan/"; // Link to the source code or Kali Tools page.
    const tutorial = "https://docs.google.com/document/d/1QG2icMDZw-dwH6wJGRRJDr-c_vcaNQv1U-kovCx1kqY/edit?usp=sharing"; // Link to the official documentation/tutorial.
    const dependencies = ["arp-scan"]; // Dependencies required for the ARPScan tool.

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
                handleProcessData("\nARP scan completed successfully.");

                // If the process was terminated manually, display a termination message.
            } else if (signal === 15) {
                handleProcessData("\nARP scan was manually terminated.");

                // If the process was terminated with an error, display the exit and signal codes.
            } else {
                handleProcessData(`\nARP scan terminated with exit code: ${code} and signal code: ${signal}`);
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
     * It sets up and triggers the ARPScan tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     * @param {FormValuesType} values - The form values, containing the network interface.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Set the loading state to true to indicate that the process is starting.
        setLoading(true);

        // Disable saving the output to a file while the process is running.
        setAllowSave(false);

        // Construct the arguments for the ARPScan command.
        const args = [`--localnet`, `-I`, values.interface];

        try {
            // Execute the ARPScan command using the CommandHelper utility with pkexec.
            await CommandHelper.runCommandWithPkexec("arp-scan", args, handleProcessData, handleProcessTermination);
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
                    {LoadingOverlayAndCancelButton(loading, "")}

                    {showAlert && (
                        <Alert title="Warning: Potential Risks" color="red">
                            This tool is used to perform ARP Scans, use with caution and only on networks you own or have explicit permission to test.
                        </Alert>
                    )}

                    {!showAlert && (
                        <Button onClick={handleShowAlert}>Show Alert</Button>
                    )}

                    <Stack>
                        <TextInput label={"Network Interface"} required {...form.getInputProps("interface")} />
                        {loading && (
                            <Alert radius="md">Scanning network on interface: {form.values.interface}...</Alert>
                        )}
                        <Button type={"submit"} disabled={loading}>
                            Start {title}
                        </Button>
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

export default ARPScan;