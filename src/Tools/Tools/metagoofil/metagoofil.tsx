import { Button, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../../utils/CommandHelper";
import ConsoleWrapper from "../../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../../OverlayAndCancelButton/OverlayAndCancelButton";
import { RenderComponent } from "../../UserGuide/UserGuide";
import InstallationModal from "../../InstallationModal/InstallationModal";
import { checkAllCommandsAvailability } from "../../../utils/CommandAvailability";

/**
 * Represents the form values for the Metagoofil component.
 */
interface FormValuesType {
    webName: string;
    searchMax: string;
    fileLimit: string;
    fileType: string;
    filePath: string;
}

/**
 * The Metagoofil component.
 * @returns The Metagoofil component.
 */
function Metagoofil() {
    //Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [customConfig, setCustomConfig] = useState(false); //State variable to indicate if custom configuration is enabled
    const [downloadConfig, setDownloadConfig] = useState(false); //State variable to indicate if download configuration is enabled
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [loadingModal, setLoadingModal] = useState(true); // State variable that indicates if the modal is opened.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable to indicate loading state of the modal.
    const [allowSave, setAllowSave] = useState(false); // State variable to indicate if saving is allowed
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved

    // Component Constants.
    const title = "Metagoofil"; // Title of the component.
    const description =
        "Metagoofil is an information gathering tool designed for extracting metadata of public documents (pdf,doc,xls,ppt,docx,pptx,xlsx) that belong to a target company."; // Description of the component.
    const steps =
        "Step 1: Enter a website URL for the tool to search.\n" +
        "Step 2: Enter the desired number of results.\n" +
        "Step 3: Enter the limit for the number of files to be downloaded\n" +
        "Step 4: Enter the file type name to be extracted.\n" +
        "Step 5: Click scan to commence the Metagoofil operation.\n" +
        "Step 6: View the Output block below to view the results of the tool's execution."; //Steps to run the component
    const sourceLink = "https://www.kali.org/tools/metagoofil/"; // Link to the source code (or Kali Tools).
    const tutorial = "https://docs.google.com/document/d/10RQ82QbVrjiS6-MdZpbV3r32dhhPSMtD0c6nQOP3RoY/edit?usp=sharing"; // Link to the official documentation/tutorial.
    const dependencies = ["metagoofil"]; // Contains the dependencies required by the component.

    // Form hook to handle form input.
    let form = useForm({
        initialValues: {
            webName: "",
            searchMax: "",
            fileLimit: "",
            fileType: "",
            filePath: "",
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
        if (!allowSave) setAllowSave(true);
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
        [handleProcessData]
    );

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the goldeneye tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the webName, searchMax, fileLimit, fileType, filePath.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Disable Output Save
        setAllowSave(false);
        setHasSaved(false);

        // Construct arguments for the Metagoofil command based on form input
        const args = [`-d`, `${values.webName}`, `-t`, `${values.fileType}`];
        values.searchMax ? args.push(`-l`, `${values.searchMax}`) : undefined;
        values.fileLimit ? args.push(`-n`, `${values.fileLimit}`) : undefined;
        values.filePath ? args.push(`-o`, `${values.filePath}`, `-w`) : undefined;

        try {
            // Execute the Metagoofil command via helper method and handle its output or potential errors
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "metagoofil",
                args,
                handleProcessData,
                handleProcessTermination
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
        }
    };

    /**
     * Clears the output state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");

        //Disallow saving when output is cleared
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    /**
     * handleSaveComplete: handle state changes when saves are completed
     * Once the output is saved, prevent duplicate saves
     */
    const handleSaveComplete = useCallback(() => {
        //Disallow saving once the output is saved
        setHasSaved(true);
        setAllowSave(false);
    }, []);

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
                    <Switch
                        size="md"
                        label="Manual Configuration"
                        checked={customConfig}
                        onChange={(e) => setCustomConfig(e.currentTarget.checked)}
                    />
                    <Switch
                        size="md"
                        label="Download Files"
                        checked={downloadConfig}
                        onChange={(e) => setDownloadConfig(e.currentTarget.checked)}
                    />
                    <TextInput label={"Enter the website for search"} required {...form.getInputProps("webName")} />
                    <TextInput label={"Enter your file type"} required {...form.getInputProps("fileType")} />
                    {customConfig && (
                        <>
                            <TextInput
                                label={"Enter number of results (default 100)"}
                                {...form.getInputProps("searchMax")}
                            />
                        </>
                    )}
                    {downloadConfig && (
                        <>
                            <TextInput
                                label={"Enter the value for Download file limit"}
                                {...form.getInputProps("fileLimit")}
                            />
                            <TextInput label={"Enter file path"} {...form.getInputProps("filePath")} />
                        </>
                    )}

                    <Button type={"submit"}>Scan</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}
export default Metagoofil;
