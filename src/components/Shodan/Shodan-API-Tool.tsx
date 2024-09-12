import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the Shodan API Tool component.
 */
interface FormValuesType {
    hostIP: string;
    shodanKey: string;
}

/**
 * The Shodan API Tool component.
 * @returns The Shodan component.
 */
export function ShodanAPITool() {
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.

    // Component Constants.
    const title = "Shodan API Tool"; // Title of the component.
    const description =
        "The Shodan API is a powerful tool that allows external network scans to be performed with use of a valid API key."; // Description of the component.
    const steps =
        "How to use Shodan API:\n" +
        "Step 1: Install shodkey.py to /usr/share/ddt by running install_exploits.sh script or manually transfer shodkey.py to /usr/share/ddt/\n" +
        "Step 2: Enter a valid API Key\n" +
        "Step 3: Enter a host IP: E.g. 127.0.0.1\n" +
        "Step 4: Click Scan button to commence the Shodan API operation. Or click Cancel Scan to terminate scan\n" +
        "Step 5: View the Output block below to view the results of the tool's execution.\n" +
        "Step 6: Optional: to save scan results enter filename and click on the save output to file button";
    const sourceLink = "https://developer.shodan.io/api"; // Link to the source code.
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["python3"]; // Contains the dependencies required by the component.

    // Form Hook to handle form input.
    let form = useForm({
        initialValues: {
            hostIP: "",
            shodanKey: "",
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
                console.error("An error occurred:", error);
                // Also set loading to false in case of error.
                setLoadingModal(false); // Crucial change, set to false even on errors
            });
    }, []);

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data received to the existing output.
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output.
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
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }
            // Clear the child process pid reference.
            setPid("");
            // Cancel the Loading Overlay.
            setLoading(false);

            // Allow Saving as the output is finalised.
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData],
    );

    /**
     * handleSaveComplete: Callback to handle the completion of the file saving process.
     * It updates the state by indicating that the file has been saved and deactivates the save button.
     */
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user.
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the Shodan API tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the filepath, hash, crack mode, and other options.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Disallow saving until the tool's execution is complete.
        setAllowSave(false);

        // Enable the loading overlay while the tool executes.
        setLoading(true);

        const args = ["/usr/share/ddt/shodkey.py", "-i", values.hostIP, "-k", values.shodanKey];

        try {
            // Execute the Shodan command via helper method and handle its output or potential errors.
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "python3",
                args,
                handleProcessData,
                handleProcessTermination,
            );
            //Update command with the result.
            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any) {
            //Display output error messages.
            setOutput(e.message);
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
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <TextInput label={"Valid API Key"} required {...form.getInputProps("shodanKey")} />
                    <TextInput label={"Host IP"} required {...form.getInputProps("hostIP")} />
                    <Button type={"submit"}>Scan</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}
