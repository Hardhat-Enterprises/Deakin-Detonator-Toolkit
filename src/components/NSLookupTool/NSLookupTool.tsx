import { Button, Stack, TextInput, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { installDependencies } from "../../utils/InstallHelper";

/**
 * Title and Description of the tool
 */
const title = "NSLookup";
const description =
    "The NSLookup command is a tool used to query Domain Name System (DNS) servers and retrieve information about a specific domain or IP address. This command is an essential tool for network administrators and system engineers as it can be used to troubleshoot DNS issues and gather information about DNS configurations.";
const steps =
    "How to use NSLookup.\n\n" +
    "Step 1: Enter an IP or Web URL.\n" +
    "       E.g. 127.0.0.1\n\n" +
    "Step 2: Select the query type (e.g., A, MX, NS).\n\n" +
    "Step 3: View the Output block below to view the results of the Scan.";

interface FormValues {
    ipaddress: string;
    queryType: string;
}

export function NSLookup() {
    const [loading, setLoading] = useState(false);
    const [pid, setPid] = useState("");
    const [output, setOutput] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [opened, setOpened] = useState(false); // Modal open state
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // Command availability state
    const [loadingModal, setLoadingModal] = useState(true); // Loading state for modal
    const dependencies = ["bind9"]; // List of dependencies

    /**
     * useEffect hook: Checks the availability of necessary commands and updates the modal state accordingly.
     * This hook runs only once when the component is mounted.
     */
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

    // Initialize form with default values for IP address and query type
    let form = useForm({
        initialValues: {
            ipaddress: "",
            queryType: "A", // Default query type is "A"
        },
    });

    // Handling the processed data output
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    // Process Termination
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }
            // Clear the child process PID reference
            setPid("");
            setLoading(false);

            // Allow Saving as the output is finalized
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData],
    );

    /**
     * handleSaveComplete: Callback function executed after the output is saved to a file.
     * It updates the state to indicate that the file has been saved and disables the save button.
     */
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Handler function triggered when the form is submitted.
     * It prepares the arguments for the command, initiates the command execution, and updates the state with the process PID and output.
     * If an error occurs during execution, it updates the output with the error message.
     *
     * @param {FormValues} values - An object containing the form input values (IP address and query type).
     */
    const onSubmit = (values: FormValues) => {
        setAllowSave(false);
        setLoading(true);

        const query = `${values.queryType} - ${values.ipaddress}`;
        // Add to history if not already present
        if (!history.includes(query)) {
            setHistory((prevHistory) => [...prevHistory, query]);
        }

        const args = [values.ipaddress, "-type=" + values.queryType];
        CommandHelper.runCommandGetPidAndOutput("nslookup", args, handleProcessData, handleProcessTermination)
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
     * clearOutput: Callback function to clear the current output displayed in the UI.
     * This function resets the output state to an empty string.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    return (
        <>
            <RenderComponent
                title={title}
                description={description}
                steps={steps}
                tutorial={""} // Empty string since we don't need the tutorial section
                sourceLink={"https://www.nslookup.io"} // This will output the link to NSLookup
                children={""}
            />

            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description}
                    dependencies={dependencies}
                />
            )}
            <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                {LoadingOverlayAndCancelButton(loading, pid)}
                <Stack>
                    {/* Dropdown for selecting from history of previous queries */}
                    <Select
                        label="History"
                        placeholder="Select from history"
                        data={history}
                        onChange={(value) => {
                            if (value) {
                                const [queryType, ipaddress] = value.split(" - ");
                                form.setValues({ ipaddress, queryType });
                            }
                        }}
                    />
                    {/* Dropdown for selecting query type */}
                    <Select
                        label="Query Type"
                        data={[
                            { value: "A", label: "A (Address)" },
                            { value: "MX", label: "MX (Mail Exchange)" },
                            { value: "NS", label: "NS (Name Server)" },
                            { value: "CNAME", label: "CNAME (Canonical Name)" },
                            { value: "TXT", label: "TXT (Text)" },
                        ]}
                        {...form.getInputProps("queryType")}
                    />
                    {/* Input field for entering IP address or domain name */}
                    <TextInput
                        label={"Please enter the IP Address for nslookup"}
                        required
                        {...form.getInputProps("ipaddress")}
                    />
                    {/* Component for saving output to a text file */}
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    {/* Submit button for executing the nslookup command */}
                    <Button type={"submit"}>Scan</Button>
                    {/* Component for displaying command output and providing a clear output button */}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </>
    );
}

export default NSLookup;
