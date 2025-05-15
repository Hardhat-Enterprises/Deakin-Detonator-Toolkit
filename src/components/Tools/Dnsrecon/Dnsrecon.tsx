import { useState, useCallback, useEffect, useRef } from "react";
import { Button, Stack, TextInput, Alert, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../../utils/CommandHelper";
import ConsoleWrapper from "../../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../../utils/CommandAvailability";
import InstallationModal from "../../InstallationModal/InstallationModal";
import { RenderComponent } from "../../UserGuide/UserGuide";

/**
 * Represents the form values for the Dnsrecon component.
 */
interface FormValuesType {
    domain: string;
}

/**
 * The Dnsrecon component.
 * @returns The Dnsrecon component.
 */
function Dnsrecon() {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable to check if the installation modal is open.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state for the installation modal.
    const [showAlert, setShowAlert] = useState(true);
    const alertTimeout = useRef<NodeJS.Timeout | null>(null);

    // Component Constants.
    const title = "DNSRecon"; // Title of the component.
    const description = "DNSRecon is a tool for DNS enumeration and scanning."; // Description of the component.
    const steps =
        "Step 1: Enter Target Domain: Use the correct format (e.g., deakin.edu.au). Avoid including http:// or https://.\n" +
        "Step 2: Click start DNSRecon to commence DNSRecon's operation.\n" +
        "Step 3: View the output block below to view the results of the tool's execution.\n";
    const sourceLink = "https://www.kali.org/tools/dnsrecon/"; // Link to the source code or Kali Tools page.
    const tutorial = "https://docs.google.com/document/d/1ZEBKlad_0qlAugE0_1YLUMACLC0m9JyfpUPl6WkF0wc/edit?usp=sharing"; // Link to the official documentation/tutorial.
    const dependencies = ["dnsrecon"]; // Dependencies required for the Dnsrecon tool.

    // Form hook to handle form input.
    const form = useForm<FormValuesType>({
        initialValues: {
            domain: "",
        },
        validate: {
            domain: (value) => (/^(([\w-]+\.)+[a-zA-Z]{2,})$/i.test(value) ? null : "Invalid domain format"), // Regex for domain validation
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
     * It sets up and triggers the Dnsrecon tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     * @param {FormValuesType} values - The form values, containing the URL.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Set the loading state to true to indicate that the process is starting.
        setLoading(true);

        // Disable saving the output to a file while the process is running.
        setAllowSave(false);

        // Construct the arguments for the Dnsrecon command.
        const args = ["-d", values.domain];

        try {
            // Execute the Dnsrecon command using the CommandHelper utility.
            // Pass the command name, arguments, and callback functions for handling process data and termination.
            const { pid, output } = await CommandHelper.runCommandGetPidAndOutput(
                "dnsrecon",
                args,
                handleProcessData,
                handleProcessTermination
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
                        <Group position="right">
                            {!showAlert && (
                                <Button onClick={handleShowAlert} size="xs" variant="outline" color="gray">
                                    Show Disclaimer
                                </Button>
                            )}
                        </Group>
                        {showAlert && (
                            <Alert title="Warning: Potential Risks" color="red">
                                This tool is used to perform DNS enumeration, use with caution and only on targets you
                                own or have explicit permission to test.
                            </Alert>
                        )}

                        <TextInput
                            label={"Domain Name"}
                            placeholder="Enter a valid domain name, e.g., deakin.edu.au"
                            required
                            {...form.getInputProps("domain")}
                        />
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

export default Dnsrecon;
