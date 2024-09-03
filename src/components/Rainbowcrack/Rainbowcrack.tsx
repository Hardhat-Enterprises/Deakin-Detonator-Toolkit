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
import { FilePicker } from "../FileHandler/FilePicker";
import { generateFilePath } from "../FileHandler/FileHandler";

/**
 * Represents the form values for the RainbowCrack component.
 */
interface FormValuesType {
    hashValue: string;
}

/**
 * The RainbowCrack component.
 * @returns The RainbowCrack component.
 */
const RainbowCrack = () => {
    // Component State Variables
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [allowSave, setAllowSave] = useState(false); // State variable to enable/disable saving
    const [hasSaved, setHasSaved] = useState(false); // State variable to track whether output has been saved
    const [fileNames, setFileNames] = useState<string[]>([]); // State variable to store the file names.

    // Component Constants
    const title = "RainbowCrack"; // Title of the component.
    const description =
        "RainbowCrack is a computer program which utilises rainbow tables to be used in password cracking."; // Description of the component.
    const steps =
        "How to use RainbowCrack \n" +
        "Step 1: Enter a hash value. (E.g. 5d41402abc4b2a76b9719d911017c592) \n" +
        "Step 2: Simply tap on the crack button to crack the hash key. \n" +
        "The user can even save the output to a file by assigning a file-name under 'save output to file' option."; // Steps to use the component.
    const sourceLink = ""; // Link to the source code (or RainbowCrack documentation).
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["rainbowcrack"]; // Dependencies required by the component.

    // Form hook to handle form input.
    const form = useForm({
        initialValues: {
            hashValue: "",
        },
    });

    // Check if the command is available and set state variables accordingly.
    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable);
                setOpened(!isAvailable);
                setLoadingModal(false);
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false);
            });
    }, []);

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Append new data to the previous output.
    }, []);

    /**
     * handleProcessTermination: Callback to handle the termination of the child process.
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
            setPid("");
            setLoading(false);
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * @param {FormValuesType} values - The form values.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);

        // Construct arguments for rainbowcrack command based on form input
        const args = ["."];

        if (fileNames.length === 0) {
            args.push("-h", values.hashValue);
        } else {
            const filePath = generateFilePath("Rainbowcrack");
            const dataUploadPath = filePath + "/" + fileNames[0];
            args.push("-l", dataUploadPath);
        }

        // Execute the rainbowcrack command via helper method
        CommandHelper.runCommandGetPidAndOutput("rcrack", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
                setOutput(output);
                console.log(pid);
                setPid(pid);
            })
            .catch((error) => {
                setOutput(error.message);
                setLoading(false);
            });
    };

    /**
     * Clears the output state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    const handleSaveComplete = () => {
        // This function could handle any actions needed after saving the output
        setHasSaved(true);
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
                />
            )}
            <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <TextInput
                        label="Hash Value"
                        required
                        disabled={fileNames.length > 0}
                        value={fileNames.length > 0 ? "" : form.values.hashValue}
                        onChange={(event) => {
                            if (fileNames.length === 0) {
                                form.setFieldValue("hashValue", event.currentTarget.value);
                            }
                        }}
                    />
                    <FilePicker
                        fileNames={fileNames}
                        setFileNames={setFileNames}
                        multiple={false}
                        componentName="Rainbowcrack"
                        labelText="Hash File"
                        placeholderText="Click to select file(s)"
                    />
                    <Button type="submit">Crack</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default RainbowCrack;
