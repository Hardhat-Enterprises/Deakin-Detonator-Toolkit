import { Button, Stack, TextInput, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

const title = "NsLookup";
const description_userguide =
    "The nslookup command is a tool used to query Domain Name System (DNS) servers and retrieve information about a specific domain or IP address." +
    "This command is an essential tool for network administrators and system engineers as it can be used to troubleshoot DNS issues and gather information about DNS configurations." +
    "How to use NSLookUp.\n\n" +
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

    // Initialize form with default values for IP address and query type
    let form = useForm({
        initialValues: {
            ipaddress: "",
            queryType: "A", // Default query type is "A"
        },
    });

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data received to the existing output.
     *
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Append new data to the previous output.
    }, []);

    /**
     * handleProcessTermination: Callback to handle the termination of the child process.
     * Once the process termination is handled, it clears the process PID reference and
     * deactivates the loading overlay.
     * @param {object} param0 - An object containing information about the process termination.
     * @param {number} param0.code - The exit code of the terminated process.
     * @param {number} param0.signal - The signal code indicating how the process was terminated.
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
            // Clear the child process PID reference
            setPid("");
            // Cancel the Loading Overlay
            setLoading(false);

            // Allow Saving as the output is finalized
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback
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
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack>
                {UserGuide(title, description_userguide)}
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
    );
}
export default NSLookup;
