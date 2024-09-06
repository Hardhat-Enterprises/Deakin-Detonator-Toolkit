import { useState, useCallback, useEffect } from "react";
import { Button, Stack, TextInput, Checkbox, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { RenderComponent, UserGuide } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the SQLmap component.
 */
interface FormValuesType {
    targetURL: string;
    detectionLevel: string;
    riskLevel: string;
    banner: boolean;
    dbs: boolean;
    passwords: boolean;
}

/**
 * The SQLmap component.
 * @returns The SQLmap component.
 */
function SQLmap() {
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
    const title = "SQLmap";
    const description =
        "SQLmap is a tool to detect and exploit SQL injection flaws and the taking over of database servers.";
    const steps =
        "Step 1: Provide the target database URL or IP to analyse for vulnerabilities.\n" +
        "Step 2: Start the process.\n" +
        "Step 3: Review the output for further analysis.\n";
    const sourceLink = "https://github.com/sqlmapproject/sqlmap"; // Link to the source code
    const tutorial = ""; // Link to the official documentation/tutorial
    const dependencies = ["sqlmap"]; // Contains the dependencies required by the component.

    // Form hook to handle form input
    let form = useForm({
        initialValues: {
            targetURL: "",
            detectionLevel: "1", // Default detection level (low)
            riskLevel: "1", // Default risk level (safe)
            banner: false, // Default banner option
            dbs: false, // Default database enumeration option
            passwords: false, // Default password hashes option
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
        setOutput((prevOutput) => prevOutput + "\n" + data);
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
     * Handles form submission for the SQLmap component.
     * @param {FormValuesType} values - The form values containing the target domain.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process
        setLoading(true);
        // Construct arguments for the SQLmap command based on form input
        const args = ["-u", values.targetURL, `--level=${values.detectionLevel}`, `--risk=${values.riskLevel}`];

        // Add optional arguments based on form input
        if (values.banner) {
            args.push("--banner");
        }
        if (values.dbs) {
            args.push("--dbs");
        }
        if (values.passwords) {
            args.push("--passwords");
        }

        CommandHelper.runCommandGetPidAndOutput("sqlmap", [...args], handleProcessData, handleProcessTermination)
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
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <TextInput label="Target database URL" required {...form.getInputProps("targetURL")} />

                    {}
                    <Select
                        label="Detection Level"
                        placeholder="Choose detection level (1-5)"
                        {...form.getInputProps("detectionLevel")}
                        data={[
                            { value: "1", label: "1 (Default)" },
                            { value: "2", label: "2" },
                            { value: "3", label: "3" },
                            { value: "4", label: "4" },
                            { value: "5", label: "5" },
                        ]}
                    />

                    {}
                    <Select
                        label="Risk Level"
                        placeholder="Choose risk level (1-3)"
                        {...form.getInputProps("riskLevel")}
                        data={[
                            { value: "1", label: "1 (Default)" },
                            { value: "2", label: "2" },
                            { value: "3", label: "3" },
                        ]}
                    />

                    {}
                    <Checkbox
                        label="Retrieve Database Banner"
                        {...form.getInputProps("banner", { type: "checkbox" })}
                    />
                    <Checkbox label="List All Databases" {...form.getInputProps("dbs", { type: "checkbox" })} />
                    <Checkbox
                        label="Retrieve Password Hashes"
                        {...form.getInputProps("passwords", { type: "checkbox" })}
                    />

                    <Button type={"submit"}>Start {title}</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}

export default SQLmap;
