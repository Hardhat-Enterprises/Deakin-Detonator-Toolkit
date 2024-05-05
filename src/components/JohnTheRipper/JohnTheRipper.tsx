import { Button, LoadingOverlay, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { writeTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";

/**
 * Represents the form values for the AirbaseNG component.
 */
interface FormValuesType {
    filePath: string;
    hash: string;
    fileType: string;
    mode: string;
    wordList: string;
    incrementOrder: string;
}

/**
 * The JohnTheRipper component.
 * @returns The JohnTheRipper component.
 */
const JohnTheRipper = () => {
    // Component state variables
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [selectedFileTypeOption, setSelectedFileTypeOption] = useState(""); // State variable to store the selected file type.
    const [selectedModeOption, setSelectedModeOption] = useState(""); // State variable to store the selected crack mode.
    const [selectedIncrementOption, setSelectedIncrementOption] = useState(""); // State variable to store the selected increment order.


    // Component constants
    const modeRequiringWordList = ["dictionary"]; // Crack modes that require a wordlist
    const modeRequiringIncrementOrder = ["incremental"]; // Crack modes that require an increment order
    const fileTypes = ["zip", "rar", "raw"]; // File types supported by the tool
    const mode = ["incremental", "dictionary", "single"]; // Crack modes supported by the tool
    const incrementOrder = [
        // Increment orders
        "ASCII",
        "LM_ASCII",
        "AlNum",
        "Alpha",
        "LowerNum",
        "UpperNum",
        "LowerSpace",
        "Lower",
        "Upper",
        "Digits",
        "LM_ASCII",
    ];
    const title = "John the Ripper"; // Title of the component.
    const description =
        "John the Ripper is a fast password cracker, its primary purpose is to detect weak Unix passwords."; // Description of the component.
    const steps =
        "Step 1: Specify the filepath to the password file that you wish to crack (e.g ~/passwords.txt).\n" +
        "Step 2: Specify the hashing algorithm used by the password you are trying to crack (e.g md5).\n" +
        "Step 3: Specify the cracking mode to use.\n" +
        "Step 4: Select the file type.\n" +
        "Step 5: If you selected the Incremental or Dictionary cracking type, an additional option will appear to select a character set or specify a filepath for a wordlist respectively." +
        "Step 6: Click 'Start John the Ripper'.\n" +
        "Step 7: View the output block to view the results of the tools execution.\n";
    const sourceLink = "https://github.com/openwall/john"; // Link to the source code.
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["john"]; // Contains the dependencies required by the component

    // Form hook to handle form input.
    const form = useForm({
        initialValues: {
            filePath: "",
            hash: "",
            fileType: "",
            wordList: "",
            mode: "",
            incrementOrder: "",
        },
    });

    // Check if the command is available and set the state variables accordingly.
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
     * handleProcessError: Callback to handle any errors that occur during the child process execution.
     * It updates the state by appending the error message to the existing output.
     */
    const handleCancel = () => {
        if (pid !== null) {
            const args = [`-15`, pid];
            CommandHelper.runCommand("kill", args);
        }
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
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the JohnTheRipper tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the filepath, hash, crack mode, and other options.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process.
        setLoading(true);

        // If hash is stored in a text file
        if (values.fileType === "raw") {
            const args = [values.filePath];
            values.hash ? args.push(`--format=${values.hash}`) : undefined;

            selectedModeOption === "dictionary"
                ? args.push(`--wordlist=${values.wordList}`)
                : selectedModeOption === "incremental"
                ? args.push(`-incremental:${values.incrementOrder}`)
                : args.push(`--single`);
            try {
                const result = await CommandHelper.runCommand(`john`, args);
                setOutput(output + "\n" + result);
            } catch (e: any) {
                setOutput(e);
            }

            setLoading(false);
        } else {
            // If hash is stored in a zip/rar file
            const argsExtract = [values.filePath];
            const argsCrack = [`/tmp/hash.txt`];

            // Extract password hash from zip/rar files
            try {
                const result = await CommandHelper.runCommand(`${values.fileType}2john`, argsExtract);
                await writeTextFile("hash.txt", result, { dir: BaseDirectory.Temp });
                setOutput(result);
            } catch (e: any) {
                setOutput(e);
            }

            // Crack the extracted hash
            values.hash ? argsCrack.push(`--format=${values.hash}`) : undefined;
            selectedModeOption === "dictionary"
                ? argsCrack.push(`--wordlist=${values.wordList}`)
                : selectedModeOption === "incremental"
                ? argsCrack.push(`-incremental:${values.incrementOrder}`)
                : argsCrack.push(`--single`);

            try {
                const result = await CommandHelper.runCommand(`john`, argsCrack);
                setOutput(output + "\n" + result);
            } catch (e: any) {
                setOutput(e);
            }

            setLoading(false);
        }
    };

    /**
     * Clears the output state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
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
            <form onSubmit={form.onSubmit((values) => onSubmit({ ...values, fileType: selectedFileTypeOption }))}>
                <LoadingOverlay visible={loading} />
                <Stack>
                    <TextInput label={"Filepath"} required {...form.getInputProps("filePath")} />
                    <TextInput label={"Hash Type (if known)"} {...form.getInputProps("hash")} />
                    <NativeSelect
                        value={selectedModeOption}
                        onChange={(e) => setSelectedModeOption(e.target.value)}
                        title={"Crack Mode"}
                        data={mode}
                        required
                        placeholder={"Crack Mode"}
                        description={"Please select a crack mode"}
                    />
                    <NativeSelect
                        value={selectedFileTypeOption}
                        onChange={(e) => setSelectedFileTypeOption(e.target.value)}
                        title={"File Type"}
                        data={fileTypes}
                        required
                        placeholder={"File Type"}
                        description={"Please select the type of file you want to crack"}
                    />
                    {modeRequiringWordList.includes(selectedModeOption) && (
                        <>
                            <TextInput label={"Dictionary File Path"} required {...form.getInputProps("wordlist")} />
                        </>
                    )}
                    {modeRequiringIncrementOrder.includes(selectedModeOption) && (
                        <>
                            <NativeSelect
                                value={selectedIncrementOption}
                                onChange={(e) => setSelectedIncrementOption(e.target.value)}
                                title={"Increment Order"}
                                data={incrementOrder}
                                required
                                placeholder={"Increment Order"}
                                description={"Please select a Increment Order"}
                            />
                        </>
                    )}

                    <Button type={"submit"}>Crack</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default JohnTheRipper;
