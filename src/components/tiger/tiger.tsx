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
 * Represents the form values for the Tiger component.
 */
interface FormValuesType {
    targetIP: string;
    auditLevel: string;
    reportFile: string;
    enableModules: string;
    excludeModules: string;
}

/**
 * The Tiger component.
 * @returns The Tiger component.
 */
const Tiger = () => {
    // Component state variables
    const [loading, setLoading] = useState(false); // State variable to indicate loading state
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving of output
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if output has been saved
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [verboseMode, setVerboseMode] = useState(false); // State variable for verbose mode

    // Component Constants
    const title = "Tiger";
    const description =
        "Tiger is a security audit and intrusion detection tool designed to audit Unix-based systems for security issues.";
    const steps =
        "=== Required ===\n" +
        "Step 1: Input a target IP or hostname to audit.\n" +
        "Step 2: Input the desired audit level (e.g., 1 for basic, 5 for deep).\n" +
        " \n" +
        "=== Optional ===\n" +
        "Step 3: Specify a file to save the audit report.\n" +
        "Step 4: Enable specific modules for the audit by entering module names.\n" +
        "Step 5: Exclude specific modules from the audit by entering module names.\n" +
        "Step 6: Check the verbose mode box for detailed output.\n";
    const sourceLink = ""; // Link to the source code
    const tutorial = ""; // Link to the official documentation/tutorial
    const dependencies = ["tiger"]; // Contains the dependencies required by the component.

    // Form hook to handle form input
    let form = useForm({
        initialValues: {
            targetIP: "",
            auditLevel: "",
            reportFile: "",
            enableModules: "",
            excludeModules: "",
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
     * Handles form submission for the Tiger component.
     * @param {FormValuesType} values - The form values containing the target domain.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Construct arguments for the Tiger command based on form input
        let args = [];
        args = [values.targetIP, "-l", values.auditLevel];

        // Check if reportFile has a value and push it to args
        if (values.reportFile) {
            args.push("-R", values.reportFile);
        }

        // Check if enableModules has a value and push it to args
        if (values.enableModules) {
            args.push("-E", values.enableModules);
        }

        // Check if excludeModules has a value and push it to args
        if (values.excludeModules) {
            args.push("-X", values.excludeModules);
        }

        if (verboseMode) {
            args.push("-v"); // Add verbose mode option if enabled
        }

        // Execute the Tiger command via helper method and handle its output or potential errors
        CommandHelper.runCommandWithPkexec("tiger", args)
            .then(() => {
                setOutput(output);
                setAllowSave(true);
                setPid(pid);
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
        setHasSaved(true); // Set hasSaved state to true
        setAllowSave(false); // Disallow further output saving
    };

    /**
     * Clears the command output and resets state variables related to output saving.
     */
    const clearOutput = () => {
        setOutput(""); // Clear the command output
        setHasSaved(false); // Reset hasSaved state
        setAllowSave(false); // Disallow further output saving
    };

    // Render component
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
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid, handleProcessData, clearOutput)}
                    <TextInput
                        label="Target IP/Hostname"
                        required
                        {...form.getInputProps("targetIP")}
                        placeholder="e.g. 192.168.1.1"
                    />
                    <TextInput
                        label="Audit Level"
                        required
                        {...form.getInputProps("auditLevel")}
                        placeholder="e.g. 5"
                    />
                    <TextInput
                        label="Report File"
                        {...form.getInputProps("reportFile")}
                        placeholder="e.g. /path/to/report.txt"
                    />
                    <TextInput
                        label="Enable Modules"
                        {...form.getInputProps("enableModules")}
                        placeholder="e.g. passwd, fs"
                    />
                    <TextInput
                        label="Exclude Modules"
                        {...form.getInputProps("excludeModules")}
                        placeholder="e.g. account, cron"
                    />
                    <Checkbox
                        label="Verbose Mode"
                        checked={verboseMode}
                        onChange={(event) => setVerboseMode(event.currentTarget.checked)}
                    />
                    <Button type="submit">
                        Start {title}
                    </Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Tiger;
