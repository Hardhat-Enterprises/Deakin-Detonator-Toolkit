import { Button, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { writeTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { FilePicker } from "../FileHandler/FilePicker";

/**
 * Represents the form values for the JohnTheRipper component.
 */
export interface FormValuesType {
    filePath: string;
    hash: string;
    fileType: string;
    mode: string;
    wordList: string;
    incrementOrder: string;
    maskPattern: string;
    ruleSet: string;
    externalMode: string;
    markovLevel: string;
    potFile: string;
}

// Deals with the generatedfilepath unique identifier that is added at the end of a file created by the FilePicker component
const cleanFileName = (filePath: string): string => {
    // Split the file name by the underscore (_) and keep the first part (before the timestamp/ID)
    const parts = filePath.split("_");

    // Keep only the base file name (before the timestamp and unique identifier)
    const baseFileName = parts[0];
    return baseFileName;
};

/**
 * Helper to build command-line arguments for John the Ripper attack modes.
 * @param selectedMode - The selected attack mode.
 * @param values - Form values containing mode-specific parameters.
 * @returns Array of command-line argument strings.
 */
export const buildAttackModeArgs = (selectedMode: string, values: FormValuesType): string[] => {
    const modeArgs: string[] = [];

    switch (selectedMode) {
        case "incremental":
            if (values.incrementOrder && values.incrementOrder.trim() !== "") {
                modeArgs.push(`-incremental:${values.incrementOrder.trim()}`);
            } else {
                modeArgs.push("--incremental");
            }
            break;

        case "dictionary":
            if (values.wordList && values.wordList.trim() !== "") {
                modeArgs.push(`--wordlist=${values.wordList.trim()}`);
            }
            break;

        case "single":
            modeArgs.push("--single");
            break;

        case "mask":
            if (values.maskPattern && values.maskPattern.trim() !== "") {
                modeArgs.push(`--mask=${values.maskPattern.trim()}`);
            } else {
                modeArgs.push("--mask");
            }
            if (values.wordList && values.wordList.trim() !== "") {
                modeArgs.push(`--wordlist=${values.wordList.trim()}`);
            }
            break;

        case "rules":
            if (values.wordList && values.wordList.trim() !== "") {
                modeArgs.push(`--wordlist=${values.wordList.trim()}`);
            }
            if (values.ruleSet && values.ruleSet.trim() !== "") {
                modeArgs.push(`--rules=${values.ruleSet.trim()}`);
            } else {
                modeArgs.push("--rules");
            }
            break;

        case "external":
            if (values.externalMode && values.externalMode.trim() !== "") {
                modeArgs.push(`--external=${values.externalMode.trim()}`);
            } else {
                modeArgs.push("--external");
            }
            break;

        case "markov":
            if (values.markovLevel && values.markovLevel.trim() !== "") {
                modeArgs.push(`--markov=${values.markovLevel.trim()}`);
            } else {
                modeArgs.push("--markov");
            }
            break;

        case "loopback":
            if (values.potFile && values.potFile.trim() !== "") {
                modeArgs.push(`--loopback=${values.potFile.trim()}`);
            } else {
                modeArgs.push("--loopback");
            }
            break;

        case "prince":
            if (values.wordList && values.wordList.trim() !== "") {
                modeArgs.push(`--prince=${values.wordList.trim()}`);
            } else {
                modeArgs.push("--prince");
            }
            break;

        case "stdin":
            modeArgs.push("--stdin");
            break;

        default:
            modeArgs.push("--incremental");
            break;
    }

    return modeArgs;
};

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
    const [selectedFileTypeOption, setSelectedFileTypeOption] = useState("raw"); // State variable to store the selected file type.
    const [selectedModeOption, setSelectedModeOption] = useState("incremental"); // State variable to store the selected crack mode.
    const [fileNames, setFileNames] = useState<string[]>([]); // State variable to store the file names.

    // Component constants
    const modeOptions = [
        { value: "incremental", label: "Incremental (Brute-force)" },
        { value: "dictionary", label: "Dictionary / Wordlist" },
        { value: "single", label: "Single Crack" },
        { value: "mask", label: "Mask Attack" },
        { value: "rules", label: "Rules-based Dictionary" },
        { value: "external", label: "External Mode" },
        { value: "markov", label: "Markov Mode" },
        { value: "loopback", label: "Loopback (Potfile)" },
        { value: "prince", label: "PRINCE Mode" },
        { value: "stdin", label: "Standard Input (Stdin)" },
    ];

    const fileTypes = [
        { value: "raw", label: "Raw Hash / Text File" },
        { value: "zip", label: "ZIP Archive (.zip)" },
        { value: "rar", label: "RAR Archive (.rar)" },
    ];

    const incrementOrderOptions = [
        { value: "", label: "Default (Full Charset)" },
        { value: "ASCII", label: "ASCII (All Printable ASCII)" },
        { value: "LM_ASCII", label: "LM_ASCII (LAN Manager ASCII)" },
        { value: "AlNum", label: "AlNum (Alphanumeric)" },
        { value: "Alpha", label: "Alpha (Letters only)" },
        { value: "LowerNum", label: "LowerNum (Lowercase & Digits)" },
        { value: "UpperNum", label: "UpperNum (Uppercase & Digits)" },
        { value: "LowerSpace", label: "LowerSpace (Lowercase & Space)" },
        { value: "Lower", label: "Lower (Lowercase only)" },
        { value: "Upper", label: "Upper (Uppercase only)" },
        { value: "Digits", label: "Digits (Digits only)" },
    ];

    const title = "John the Ripper"; // Title of the component.
    const description =
        "John the Ripper is a fast password cracker, its primary purpose is to detect weak Unix passwords. It supports multiple attack modes including Incremental, Dictionary, Single Crack, Mask attack, Rules-based dictionary, External mode, Markov mode, Loopback, PRINCE, and Standard Input."; // Description of the component.
    const steps =
        "Step 1: Specify the filepath to the password file that you wish to crack (e.g ~/passwords.txt).\n" +
        "Step 2: Specify the hashing algorithm used by the password you are trying to crack (e.g md5).\n" +
        "Step 3: Specify the cracking mode to use (e.g. Incremental, Dictionary, Single Crack, Mask, Rules, External, Markov, Loopback, PRINCE, Stdin).\n" +
        "Step 4: Select the file type (raw, zip, rar).\n" +
        "Step 5: Fill in any mode-specific parameters (e.g. wordlist path, mask pattern, rule set, increment character set, etc.).\n" +
        "Step 6: Click 'Start John the Ripper'.\n" +
        "Step 7: View the output block to view the results of the tool execution.\n";
    const sourceLink = "https://github.com/openwall/john"; // Link to the source code.
    const tutorial = "https://docs.google.com/document/d/1aRE9aSsaxEm_joT4-1w3ow5fZo2iILD8UJA87cdz9T0/edit?usp=sharing"; // Link to the official documentation/tutorial.
    const dependencies = ["john"]; // Contains the dependencies required by the component

    // Form hook to handle form input.
    const form = useForm<FormValuesType>({
        initialValues: {
            filePath: "",
            hash: "",
            fileType: "raw",
            wordList: "",
            mode: "incremental",
            incrementOrder: "",
            maskPattern: "",
            ruleSet: "",
            externalMode: "",
            markovLevel: "",
            potFile: "",
        },
    });

    // Check if the command is available and set the state variables accordingly.
    useEffect(() => {
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

            // Allow Saving as the output is finalised
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    /**
     * handleCancel: Callback to handle cancelling the active running command process.
     */
    const handleCancel = () => {
        if (pid !== "") {
            const args = [`-15`, pid];
            CommandHelper.runCommand("kill", args);
        }
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the JohnTheRipper tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the filepath, hash, crack mode, and other options.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Validate that a file has been selected before proceeding.
        if (!fileNames || fileNames.length === 0) {
            setOutput("Error: No input file selected. Please select a file before attempting to crack.");
            return;
        }

        // Activate loading state to indicate ongoing process.
        setLoading(true);

        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        const fileToProcess = fileNames[0]; // Assuming only one file is selected.
        const cleanName = cleanFileName(fileToProcess);
        const baseFilePath = "/home/kali";
        const filePathToUse = `${baseFilePath}/${cleanName}`;

        const targetFileType = values.fileType || selectedFileTypeOption;
        const targetMode = selectedModeOption || values.mode;
        const modeArgs = buildAttackModeArgs(targetMode, values);

        // If hash is stored in a text file
        if (targetFileType === "raw") {
            const args = [filePathToUse];
            if (values.hash && values.hash.trim() !== "") {
                args.push(`--format=${values.hash.trim()}`);
            }
            args.push(...modeArgs);

            await CommandHelper.runCommandGetPidAndOutput(`john`, args, handleProcessData, handleProcessTermination)
                .then(({ output, pid }) => {
                    // Update the UI with the results from the executed command
                    setOutput(output);
                    setPid(pid);
                })
                .catch((error) => {
                    // Display any errors encountered during command execution
                    setOutput(error.message);
                    setLoading(false);
                    setAllowSave(true);
                });
        } else {
            // If hash is stored in a zip/rar file
            const argsExtract = [filePathToUse];
            const argsCrack = [`/tmp/hash.txt`];

            // Extract password hash from zip/rar files
            try {
                const result = await CommandHelper.runCommand(`${targetFileType}2john`, argsExtract);
                await writeTextFile("hash.txt", result, { dir: BaseDirectory.Temp });
                setOutput(result);
            } catch (e: any) {
                setOutput(e);
            }

            // Crack the extracted hash
            if (values.hash && values.hash.trim() !== "") {
                argsCrack.push(`--format=${values.hash.trim()}`);
            }
            argsCrack.push(...modeArgs);

            await CommandHelper.runCommandGetPidAndOutput(
                `john`,
                argsCrack,
                handleProcessData,
                handleProcessTermination
            )
                .then(({ output, pid }) => {
                    // Update the UI with the results from the executed command
                    setOutput(output);
                    setPid(pid);
                })
                .catch((error) => {
                    // Display any errors encountered during command execution
                    setOutput(error.message);
                    setLoading(false);
                    setAllowSave(true);
                });
        }
    };

    /**
     * Clears the output state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

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
            <form
                onSubmit={form.onSubmit((values) =>
                    onSubmit({ ...values, mode: selectedModeOption, fileType: selectedFileTypeOption })
                )}
            >
                {LoadingOverlayAndCancelButton(loading, pid)}
                <Stack>
                    <FilePicker
                        fileNames={fileNames}
                        setFileNames={setFileNames}
                        multiple={false}
                        componentName="JohnTheRipper"
                        labelText="File (Can only select files in /home/kali)"
                        placeholderText="Click to select file(s)"
                    />
                    {fileNames.length > 0 && (
                        <div style={{ fontSize: "16px", color: "#aaa", marginTop: "8px", textAlign: "center" }}>
                            <strong>Uploaded File:</strong> {cleanFileName(fileNames[0])}
                        </div>
                    )}
                    <TextInput
                        label={"Hash Type (if known)"}
                        placeholder="e.g. md5, sha256crypt"
                        {...form.getInputProps("hash")}
                    />
                    <NativeSelect
                        value={selectedModeOption}
                        onChange={(e) => setSelectedModeOption(e.target.value)}
                        label={"Crack Mode"}
                        data={modeOptions}
                        required
                        description={"Please select a crack mode"}
                    />
                    <NativeSelect
                        value={selectedFileTypeOption}
                        onChange={(e) => setSelectedFileTypeOption(e.target.value)}
                        label={"File Type"}
                        data={fileTypes}
                        required
                        description={"Please select the type of file you want to crack"}
                    />

                    {selectedModeOption === "incremental" && (
                        <NativeSelect
                            label={"Increment Order (Character Set)"}
                            data={incrementOrderOptions}
                            description={"Select a character set or leave as default"}
                            {...form.getInputProps("incrementOrder")}
                        />
                    )}

                    {selectedModeOption === "dictionary" && (
                        <TextInput
                            label={"Dictionary / Wordlist File Path"}
                            placeholder={"/usr/share/wordlists/rockyou.txt"}
                            required
                            {...form.getInputProps("wordList")}
                        />
                    )}

                    {selectedModeOption === "mask" && (
                        <>
                            <TextInput
                                label={"Mask Pattern"}
                                placeholder={"e.g. ?u?l?l?l?d?d (?l=lower, ?u=upper, ?d=digit, ?s=special, ?a=all)"}
                                required
                                {...form.getInputProps("maskPattern")}
                            />
                            <TextInput
                                label={"Wordlist File Path (Optional for hybrid mask)"}
                                placeholder={"/usr/share/wordlists/rockyou.txt"}
                                {...form.getInputProps("wordList")}
                            />
                        </>
                    )}

                    {selectedModeOption === "rules" && (
                        <>
                            <TextInput
                                label={"Dictionary / Wordlist File Path"}
                                placeholder={"/usr/share/wordlists/rockyou.txt"}
                                required
                                {...form.getInputProps("wordList")}
                            />
                            <TextInput
                                label={"Rule Set (Optional)"}
                                placeholder={"e.g. Wordlist, Jumbo, KoreLogic (leave blank for default rules)"}
                                {...form.getInputProps("ruleSet")}
                            />
                        </>
                    )}

                    {selectedModeOption === "external" && (
                        <TextInput
                            label={"External Mode Name"}
                            placeholder={"e.g. Parallel, DateTime, Keyboard, Filter_Lower"}
                            required
                            {...form.getInputProps("externalMode")}
                        />
                    )}

                    {selectedModeOption === "markov" && (
                        <TextInput
                            label={"Markov Level / Threshold (Optional)"}
                            placeholder={"e.g. 100, 200 (leave blank for default)"}
                            {...form.getInputProps("markovLevel")}
                        />
                    )}

                    {selectedModeOption === "loopback" && (
                        <TextInput
                            label={"Potfile Path (Optional)"}
                            placeholder={"e.g. /home/kali/.john/john.pot (leave blank for default)"}
                            {...form.getInputProps("potFile")}
                        />
                    )}

                    {selectedModeOption === "prince" && (
                        <TextInput
                            label={"Wordlist File Path (Optional)"}
                            placeholder={"e.g. /usr/share/wordlists/rockyou.txt (leave blank for default)"}
                            {...form.getInputProps("wordList")}
                        />
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
