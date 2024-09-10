import { Button, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the Sqlninja component.
 */
interface FormValuesType {
    filePath: string;
    mode: string;
}

/**
 * The Sqlninja component.
 * @returns The Sqlninja component.
 */
function Sqlninja() {
    // Component State Variables
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [selectedMode, setSelectedMode] = useState(""); //State variable to store the mode selected

    // Component Constants.
    const title = "Sqlninja"; // Title of the component.
    const description =
        "Exploit SQL injection vulnerabilities on web applications that use Microsoft SQL Server as back end."; // Description of the component.
    const steps = "";
    const sourceLink = "https://www.kali.org/tools/sqlninja/"; // Link to the source code (or Kali Tools).
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["sqlninja"]; // Constains the dependencies required for the component.
    const attackMode = ["test", "escalation", "upload", "backscan"]; //Contains the attack modes that are available.

    // Form hook to handle form input.
    const form = useForm({
        initialValues: {
            filePath: "",
            mode: "",
        },
    });

    // Check if the command is available and set the state variables accordingly.
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
    }, []);

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data received to the existing output.
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output
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

            // Allow Saving as the output is finalised.
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback.
    );

    // Actions taken after saving the output.
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user.
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the Sqlninja tool with the given parameter.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form value containing the file path of the sqlninja configuration file, and mode selected.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process.
        setLoading(true);

        // Disallow saving until the tool's execution is complete.
        setAllowSave(false);

        // Construct the argmentss for the sqlninja command based on form input.
        const args = ["-f", `${values.filePath}`];
        selectedMode ? args.push(`-m`, selectedMode) : undefined;

        // Execute the bash command via helper method and handle its output or potential errors.
        CommandHelper.runCommandGetPidAndOutput("sqlninja", args, handleProcessData, handleProcessTermination)
            .then(({ pid, output }) => {
                setPid(pid);
                setOutput(output);
            })
            .catch((error) => {
                setLoading(false);
                setOutput(`Error: ${error.message}`);
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
                    <TextInput
                        label={"Configuration File Path"}
                        placeholder="Example: /home/kali/sqlninja.conf"
                        {...form.getInputProps("filePath")}
                    />
                    <NativeSelect
                        value={selectedMode}
                        onChange={(e) => setSelectedMode(e.target.value)}
                        title={"Attack Mode"}
                        data={attackMode}
                        placeholder={"Attack Mode"}
                        description={"Please select attack mode"}
                        required
                    />
                    <Button type={"submit"}>Start</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}

export default Sqlninja;
