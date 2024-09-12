import { Button, Stack, TextInput, Checkbox, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";

/**
 * Represents the form values for the Goldeneye component.
 */
interface FormValuesType {
    input: string;
    outputDir: string;
    config: string;
    quiet: boolean;
    verbose: boolean;
    types: string;
    indirectBlockDetection: boolean;
    allHeaders: boolean;
    auditFileOnly: boolean;
    quickMode: boolean;
}

/**
 * The Foremost component.
 * @returns The Foremost component.
 */
const Foremost = () => {
    //Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [checkedVerbose, setCheckedVerbose] = useState(false); //State variable to indicate if verbose mode is enabled
    const [checkedQuiet, setCheckedQuiet] = useState(false); //State variable to indicate if quiet mode is enabled
    const [checkedAdvanced, setCheckedAdvanced] = useState(false); //State variable to indicate if advanced mode is enabled
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [loadingModal, setLoadingModal] = useState(true); // State variable that indicates if the modal is opened.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable to indicate loading state of the modal.
    const [allowSave, setAllowSave] = useState(false); // State variable to indicate if saving is allowed
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved

    // Component Constants.
    const title = "Foremost"; // Title of the component.
    const description =
        "Foremost is a forensic program to recover lost files based on their headers, footers, and internal data structures."; // Description of the component.
    const steps =
        "Step 1: Enter a valid file path to the subject file.\n" +
        "Step 2: Enter a valid file path to the output results.\n";
    "Step 3: Enter any additional options for the scan.\n" +
        "Step 4: Enter any additional parameters for the scan.\n" +
        "Step 5: Click Run Foremost to commence Foremost's operation.\n" +
        "Step 6: View the Output block below to view the results of the tool's execution."; //Steps to run the component
    const sourceLink = "https://www.kali.org/tools/foremost/"; // Link to the source code (or Kali Tools).
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["foremost"]; // Contains the dependencies required by the component.

    // Form hook to handle form input.
    let form = useForm({
        initialValues: {
            input: "",
            outputDir: "",
            config: "",
            quiet: false,
            verbose: false,
            types: "",
            indirectBlockDetection: false,
            allHeaders: false,
            auditFileOnly: false,
            quickMode: false,
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

            // Allow Saving as the output is finalised
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData],
    );

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the Foremost tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the url, userAgent, worker, sockets, method, sslCheck
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        // Construct arguments for the Foremost command based on form input
        const args = [`-i`, `${values.input}`, `-o`, `${values.outputDir}`];
        if (values.config) {
            args.push(`-c`, `${values.config}`);
        }
        if (values.types) {
            args.push(`-t`, `${values.types}`);
        }
        if (checkedAdvanced) {
            if (checkedQuiet) {
                args.push(`-Q`);
            }
            if (checkedVerbose) {
                args.push(`-v`);
            }
            if (values.indirectBlockDetection) {
                args.push(`-d`);
            }
            if (values.allHeaders) {
                args.push(`-a`);
            }
            if (values.auditFileOnly) {
                args.push(`-w`);
            }
            if (values.quickMode) {
                args.push(`-q`);
            }
        }

        try {
            // Execute the Foremost command via helper method and handle its output or potential errors
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "foremost",
                args,
                handleProcessData,
                handleProcessTermination,
            );

            // Update the UI with the results from the executed command
            setPid(result.pid);
            setOutput(result.output);
            console.log(pid);
        } catch (e: any) {
            // Display any errors encountered during command execution
            setOutput(e.message);
            // Deactivate loading state
            setLoading(false);
            setAllowSave(true);
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
     * handleSaveComplete: handle state changes when saves are completed
     * Once the output is saved, prevent duplicate saves
     */
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    // Render the GUI
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
                {LoadingOverlayAndCancelButton(loading, pid)}
                <Stack spacing="lg">
                    {/* Advanced Mode Switch */}
                    <Switch
                        label="Advanced Mode"
                        checked={checkedAdvanced}
                        onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                    />
                    {/* Input File/Device */}
                    <TextInput
                        label={"Input File/Device"}
                        placeholder={"eg. /path/to/myfile/file.dd"}
                        required
                        {...form.getInputProps("input")}
                    />
                    {/* Output Directory */}
                    <TextInput
                        label={"Output Directory"}
                        placeholder={"eg. path/to/output/folder"}
                        required
                        {...form.getInputProps("outputDir")}
                    />
                    {/* File Types */}
                    <TextInput
                        label={"File Types"}
                        placeholder={"Specify types (comma-separated) e.g., jpg,doc. if blank will retrieve all."}
                        {...form.getInputProps("types")}
                    />
                    <Stack spacing="lg"></Stack>

                    {/* Advanced Options */}
                    {checkedAdvanced && (
                        <Stack spacing="lg">
                            {!checkedVerbose && (
                                <Switch
                                    label="Quiet Mode"
                                    checked={checkedQuiet}
                                    onChange={(e) => setCheckedQuiet(e.currentTarget.checked)}
                                />
                            )}
                            {!checkedQuiet && (
                                <Switch
                                    label="Verbose Mode"
                                    checked={checkedVerbose}
                                    onChange={(e) => setCheckedVerbose(e.currentTarget.checked)}
                                />
                            )}
                            {/* Configuration File */}
                            <TextInput
                                label={"Configuration File"}
                                placeholder={"set configuration file to use (defaults to foremost.conf)"}
                                {...form.getInputProps("config")}
                            />
                            {/* Indirect Block Detection */}
                            <Checkbox
                                label={
                                    "Indirect Block Detection - turn on indirect block detection (for UNIX file-systems)."
                                }
                                {...form.getInputProps("indirectBlockDetection" as keyof FormValuesType)}
                            />
                            {/* Write All Headers */}
                            <Checkbox
                                label={
                                    "Write All Headers - write all headers, perform no error detection (corrupted files)."
                                }
                                {...form.getInputProps("allHeaders" as keyof FormValuesType)}
                            />
                            {/* Audit File Only */}
                            <Checkbox
                                label={
                                    "Audit File Only - only write the audit file, do not write any detected files to the disk."
                                }
                                {...form.getInputProps("auditFileOnly" as keyof FormValuesType)}
                            />
                            {/* Quick Mode */}
                            <Checkbox
                                label={
                                    "Quick Mode - enables quick mode. Searches are performed on 512 byte boundaries."
                                }
                                {...form.getInputProps("quickMode" as keyof FormValuesType)}
                            />
                        </Stack>
                    )}
                    {/* Submit Button */}
                    <Button type={"submit"}>Run Foremost</Button>
                    {/* Saving the output to a text file if requested */}
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    {/* Console Output */}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Foremost;
