import { useState, useEffect, useCallback } from "react";
import { Button, Stack, TextInput, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";

/**
 * Represents the form values for the Exif component.
 */
interface FormValuesType {
    filePath: string;
    tag: string;
    value: string;
    actionType: string; // "read" or "write"
}

/**
 * The Exif component.
 * @returns The Exif component.
 */
const ExifTool = () => {
    // Component state variables
    const [loading, setLoading] = useState(false); // State variable to indicate loading state
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving of output
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if output has been saved
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.

    // Component Constants
    const title = "ExifTool";
    const description =
        "ExifTool is a platform-independent command-line application for reading, writing, and editing metadata in a wide variety of file types.";
    const steps =
        "Step 1: Specify the file path of an image on your machine.\n" +
        "Step 2: Enter a metadata tag to read or write to.\n" +
        "Step 3: Choose whether to read or write to the specified metadata field.\n" +
        "Step 4: Input a value to write to the specified metadata field.\n" +
        "Step 5: Run the tool!";
    const sourceLink = ""; // Link to the source code
    const tutorial = ""; // Link to the official documentation/tutorial
    const dependencies = ["exiftool"]; // ExifTool dependency.

    // Form hook to handle form input
    let form = useForm<FormValuesType>({
        initialValues: {
            filePath: "",
            tag: "",
            value: "",
            actionType: "read",
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
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
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
     * Handles form submission for the Exif component.
     * @param {FormValuesType} values - The form values containing the target domain.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Construct arguments for the Exif command based on form input
        let args = [values.filePath];

        if (values.actionType === "read") {
            args.push("-" + values.tag);
        } else if (values.actionType === "write") {
            args.push("-" + values.tag + "=" + values.value);
        }

        // Execute the Exif command via helper method and handle its output or potential errors
        CommandHelper.runCommandWithPkexec("exiftool", args, handleProcessData, handleProcessTermination)
            .then(() => {
                // Deactivate loading state
                setLoading(false);
            })
            .catch((error) => {
                // Display any errors encountered during command execution
                setOutput(`Error: ${error.message}`);
                // Deactivate loading state
                setLoading(false);
            });
        setAllowSave(true);
    };

    /**
     * Handles the completion of output saving by updating state variables.
     */
    const handleSaveComplete = () => {
        setHasSaved(true); //Set hasSaved state to true
        setAllowSave(false); // Disallow further output saving
    };

    /**
     * Clears the command output and resets state variables related to output saving.
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
            tutorial={tutorial} // Pass tutorial
            sourceLink={sourceLink} // Pass sourceLink
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
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <TextInput
                        label="File Path"
                        required
                        {...form.getInputProps("filePath")}
                        placeholder="e.g. /path/to/file.jpg"
                    />
                    <TextInput label="Metadata Tag" required {...form.getInputProps("tag")} placeholder="e.g. Author" />

                    {/* Conditionally render the 'Value' input field based on the actionType */}
                    {form.values.actionType === "write" && (
                        <TextInput
                            label="Value (for writing)"
                            {...form.getInputProps("value")}
                            placeholder="e.g. John Doe"
                        />
                    )}

                    <Checkbox
                        label="Read Metadata"
                        checked={form.values.actionType === "read"}
                        onChange={() => form.setFieldValue("actionType", "read")}
                    />
                    <Checkbox
                        label="Write Metadata"
                        checked={form.values.actionType === "write"}
                        onChange={() => form.setFieldValue("actionType", "write")}
                    />
                    <Button type={"submit"}>Run {title}</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default ExifTool;
