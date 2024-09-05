import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the CloudBrute component.
 */
interface FormValuesType {
    domain: string;
    keyword: string;
    wordlist: string;
}

/**
 * The CloudBrute component.
 * @returns The CloudBrute component.
 */
const CloudBrute = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.

    // Component Constants.
    const title = "CloudBrute"; // Title of the component.
    const description = "CloudBrute is a tool for cloud enumeration and infrastructure discovery in various cloud providers."; // Description of the component.
    const steps =
        "Step 1: Enter the target domain.\n" +
        "Step 2: Enter a keyword for URL generation.\n" +
        "Step 3: Specify the path to the wordlist file.\n" +
        "Step 4: Click 'Run CloudBrute' to start the scan.\n" +
        "Step 5: View the Output block below to see the results of the scan.";
    const sourceLink = ""; // Link to the source code.
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["cloudbrute"]; // Contains the dependencies required by the component.

    // Form hook to handle form input.
    const form = useForm({
        initialValues: {
            domain: "",
            keyword: "",
            wordlist: "/usr/share/dirb/wordlists/common.txt",
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
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }

            setPid(""); // Clear the child process pid reference.
            setLoading(false); // Cancel the loading overlay.
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the CloudBrute tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the domain, keyword, and wordlist path.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = ["-d", values.domain, "-k", values.keyword, "-w", values.wordlist];
        CommandHelper.runCommandGetPidAndOutput("cloudbrute", args, handleProcessData, handleProcessTermination)
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
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <TextInput
                        label="Target Domain"
                        required
                        placeholder="e.g., google.com"
                        {...form.getInputProps("domain")}
                    />
                    <TextInput label="Keyword" required placeholder="e.g., test" {...form.getInputProps("keyword")} />
                    <TextInput
                        label="Path to Wordlist"
                        required
                        placeholder="/usr/share/dirb/wordlists/common.txt"
                        {...form.getInputProps("wordlist")}
                    />
                    {SaveOutputToTextFile(output)}
                    <Button type="submit">Run CloudBrute</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default CloudBrute;