// Import necessary hooks and components from React and other libraries
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
 * Represents the form values for the Amass component.
 */
interface FormValuesType {
    domain: string;
}

/**
 * The Amass component.
 * @returns The Amass component.
 */
export function Amass() {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [allowSave, setAllowSave] = useState(false); // State variable boolean to indicate save state.
    const [hasSaved, setHasSaved] = useState(false); // State variable boolean to indicate if the save has been saved.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.

    // Component Constants.
    const title = "Amass"; // Title of the component.
    const description =
        "Amass is an open source network mapping and attack surface discovery tool that uses information gathering and other techniques to create maps of network infrastructures."; // Description of the component.
    const steps =
        "Step 1: Enter a domain name.\n" +
        " E.g. example.com\n\n" +
        "Step 2: Click 'Run Amass' to start the enumeration.\n" +
        "Step 3: View the Output block below to see the results of the scan.";
    const sourceLink = ""; // Link to the source code.
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["amass"]; // Contains the dependencies required by the component.

    // Form hook to handle form input.
    let form = useForm<FormValuesType>({
        initialValues: {
            domain: "",
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
            setAllowSave(true); // Allow Saving as the output is finalised.
            setHasSaved(false);
        },
        [handleProcessData]
    );

    /**
     * Function to handle completion of saving output to a text file.
     * Sets the hasSaved flag to true and disallows further saving.
     */
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the Amass tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the domain to scan.
     */
    const onSubmit = (values: FormValuesType) => {
        setAllowSave(false);
        setLoading(true);
        const args = ["enum", "-d", values.domain];
        CommandHelper.runCommandGetPidAndOutput("amass", args, handleProcessData, handleProcessTermination)
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
     * Function to clear output and reset save status.
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
                    <TextInput label="Enter the domain to scan" required {...form.getInputProps("domain")} />
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type="submit">Run Amass</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}

export default Amass;
