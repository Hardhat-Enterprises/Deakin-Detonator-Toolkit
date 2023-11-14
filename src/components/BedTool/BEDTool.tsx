import { Button, Select, Stack, Switch, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

//plugin header selection field
const plugin_list = ["FTP", "SMTP", "POP", "HTTP", "IRC", "IMAP", "PJL", "LPD", "FINGER", "SOCKS4"];
//plugin that require Authentication
const pluginsRequiringAuth = ["FTP", "IMAP", "POP"];
//plugin that require Email address
const pluginRequiringEmail = ["SMTP"];
//plugin that require username
const pluginsRequiringUsername = ["SOCKS4"];

const title = "BEDTool";

const description_userguide = `
BED (Bruteforce Exploit Detector) is a sophisticated tool designed to check network services for a range of security vulnerabilities including buffer overflows and format string weaknesses.

For detailed information, please visit: https://www.kali.org/tools/bed/

Instructions for using BED:
1. Select a Service: Choose the service to test from the dropdown menu, for instance, "HTTP" to test a web server.

2. Input Required Fields: Fill in the fields that appear based on the selected service. For example, choosing "FTP" will prompt for additional required fields, such as username and password.

3. Custom Configuration (Optional): Activate 'Custom Configuration' to enter a specific target IP address and port number. If this is not enabled, the tool will default to scanning the local machine.

4. Start Scan: Click the 'Scan' button to begin the evaluation.

5. View Results: The results, including any potential vulnerabilities, will be displayed in the output section below after the scan is completed.

Note: The 'Custom Configuration' option is designed for advanced users who wish to target a specific network address or require custom settings. If not used, BED will assume the target is the local host.
`;

interface FormValues {
    plugin: string;
    target: string;
    port: string;
    email: string;
    username: string;
    password: string;
}

export function BEDTool() {
    const [loading, setLoading] = useState(false);
    const [pid, setPid] = useState("");
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [customconfig, setCustomconfig] = useState(false);

    // state for selected plugin
    const [selectedPlugin, setSelectedPlugin] = useState("");

    let form = useForm({
        initialValues: {
            plugin: "",
            target: "",
            port: "",
            email: "",
            username: "",
            password: "",
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
            // Clear the child process pid reference
            setPid("");
            // Cancel the Loading Overlay
            setLoading(false);

            // Allow Saving as the output is finalised
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );
    /**
     * onSubmit: Handler function that is triggered when the form is submitted.
     * It prepares the arguments and initiates the execution of the `bed` command.
     * Upon successful execution, it updates the state with the process PID and output.
     * If an error occurs during the command execution, it updates the output with the error message.
     * @param {FormValues} values - An object containing the form input values.
     */

    // Actions taken after saving the output
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    const onSubmit = (values: FormValues) => {
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        setLoading(true);
        const baseArgs = ["-s", values.plugin];
        const conditionalArgs: string[][] = [
            customconfig ? ["-t", values.target, "-p", values.port] : [],

            pluginsRequiringAuth.includes(selectedPlugin) || selectedPlugin === "SMTP"
                ? ["-u", selectedPlugin === "SMTP" ? values.email : values.username]
                : [],
            pluginsRequiringAuth.includes(selectedPlugin) ? ["-v", values.password] : [],
        ];

        // Flatten the array and remove any falsey entries created by the conditions not met
        const args = baseArgs.concat(conditionalArgs.filter(Boolean).flat());

        CommandHelper.runCommandGetPidAndOutput("bed", args, handleProcessData, handleProcessTermination)
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
     * clearOutput: A callback function to clear the current output displayed in the UI.
     * This function resets the output state to an empty string.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]); // Dependency on the setOutput function.

    const handlePluginChange = (value: string) => {
        form.setFieldValue("plugin", value);
        setSelectedPlugin(value);
    };

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack>
                {UserGuide(title, description_userguide)}
                <Switch
                    size="md"
                    label="Manual Network Configuration"
                    checked={customconfig}
                    onChange={(e) => setCustomconfig(e.currentTarget.checked)}
                />
                <Select
                    label="Plugin"
                    placeholder="Select a plugin"
                    data={plugin_list}
                    required
                    value={selectedPlugin}
                    onChange={handlePluginChange}
                />

                {pluginsRequiringAuth.includes(selectedPlugin) && (
                    <>
                        <TextInput
                            label={"username -> Default user is your login creditial of Kali linux"}
                            required
                            {...form.getInputProps("username")}
                        />
                        <TextInput label={"Password -> your password"} required {...form.getInputProps("password")} />
                    </>
                )}
                {pluginsRequiringUsername.includes(selectedPlugin) && (
                    <>
                        <TextInput label={"username"} required {...form.getInputProps("username")} />
                    </>
                )}
                {pluginRequiringEmail.includes(selectedPlugin) && (
                    <>
                        <TextInput
                            label={"Email address -> abc@example.com"}
                            required
                            {...form.getInputProps("email")}
                        />
                    </>
                )}
                {customconfig && (
                    <>
                        <TextInput
                            label={"Target -> Host to check (default: localhost)"}
                            required
                            {...form.getInputProps("target")}
                        />
                        <TextInput
                            label={"port -> Port to connect to (default: standard port)"}
                            required
                            {...form.getInputProps("port")}
                        />
                    </>
                )}
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
export default BEDTool;
