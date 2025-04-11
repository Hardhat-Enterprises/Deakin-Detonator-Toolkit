import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the slowhttptest component.
 */
interface FormValuesType {
    url: string;
    timeout: string;
    requests: string;
}

/**
 * The SlowHttpTest component.
 * @returns The SlowHttpTest component.
 */
const title = "SlowHttpTest";
const description =
    "SlowHttpTest is a tool that performs various slow HTTP attacks to test the robustness of web servers. It can simulate different types of slow attacks like Slowloris and SlowPOST.";
const steps =
    "Step 1: Enter the target URL in the first field.\n\n" +
    "Step 2: Specify the timeout in seconds in the second field.\n\n" +
    "Step 3: Define the number of requests to be sent in the third field.\n\n" +
    "Step 4: Press the scan button.";
const sourceLink = "https://github.com/stamparm/slowhttptest"; // Link to the source code or relevant documentation.
const tutorial = "https://docs.google.com/document/d/1H_2wECvvjTGRlzH-sQtxV2Td8U6F-bCEP4qlQxbqRws/edit?usp=sharing"; // Link to the official tutorial/documentation.
const dependencies = ["slowhttptest"]; // Dependencies required by the component.

function SlowHttpTest() {
    // State Variables
    const [loading, setLoading] = useState(false); // Controls the loading state of the component
    const [output, setOutput] = useState(""); // Stores the output generated by the command
    const [pid, setPid] = useState(""); // Stores the PID of the running command process
    const [allowSave, setAllowSave] = useState(false); // Determines whether saving the output is allowed
    const [hasSaved, setHasSaved] = useState(false); // Indicates whether the output has been saved
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal

    let form = useForm({
        initialValues: {
            url: "",
            timeout: "",
            requests: "",
        },
    });

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

    // Uses the callback function of runCommandGetPidAndOutput to handle and save data
    // generated by the executing process into the output state variable.
    /**
     * Handles the data received from the subprocess and appends it to the output.
     *
     * @param {string} data - The string data received from the subprocess.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output
    }, []);

    // Uses the onTermination callback function of runCommandGetPidAndOutput to handle
    // the termination of that process, resetting state variables, handling the output data,
    // and informing the user.
    /**
     * Handles the termination of the subprocess, updating the state and processing the output data.
     *
     * @param {object} params - The termination event parameters.
     * @param {number} params.code - The exit code of the subprocess.
     * @param {number} params.signal - The termination signal code.
     */
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("\nProcess completed successfully."); // Successful completion message
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated."); // Manual termination message
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`); // Error message
            }

            setPid(""); // Clear the child process pid reference
            setLoading(false); // Cancel the Loading Overlay
            setAllowSave(true); // Allow Saving as the output is finalised
            setHasSaved(false); // Reset save status
        },
        [handleProcessData]
    );

    // Actions taken after saving the output
    /**
     * Handles the state updates after a save operation is completed.
     * Allows saving and indicates that the save has been completed.
     */
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * Handles form submission, executes the SlowHttpTest tool, and updates the state.
     *
     * @param {FormValues} values - The form input values.
     * @returns {Promise<void>} - An asynchronous operation.
     */
    const onSubmit = async (values: FormValuesType) => {
        setAllowSave(false); // Disallow saving until the tool's execution is complete

        setLoading(true); // Enable the Loading Overlay

        const args = [`-u`, `${values.url}`];
        args.push(`-i`, `${values.timeout}`);
        args.push(`-r`, `${values.requests}`);
        args.push(`-H`);

        CommandHelper.runCommandGetPidAndOutput("slowhttptest", args, handleProcessData, handleProcessTermination)
            .then(({ pid, output }) => {
                setPid(pid);
                setOutput(output);
            })
            .catch((error) => {
                setLoading(false); // Cancel the Loading Overlay
                setOutput(`Error: ${error.message}`);
            });
    };

    /**
     * Clears the output data and resets the save state.
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
                    <p>{description}</p>
                    <TextInput
                        label={"Enter the target URL:"}
                        placeholder={"Example: http://example.com"}
                        required
                        {...form.getInputProps("url")}
                    />
                    <TextInput
                        label={"Enter the timeout time (in seconds):"}
                        placeholder={"Example: 30"}
                        required
                        {...form.getInputProps("timeout")}
                    />
                    <TextInput
                        label={"Enter the number of requests:"}
                        placeholder={"Example: 100"}
                        required
                        {...form.getInputProps("requests")}
                    />
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type={"submit"}>Scan</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}

export default SlowHttpTest;
