import { Button, Select, Stack, Switch, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

//plugin header selection field
const plugin_list = ["FTP", "SMTP", "POP", "HTTP", "IRC", "IMAP", "PJL", "LPD", "FINGER", "SOCKS4", "SOCKS5"];
//plugin that require Authentication
const pluginsRequiringAuth = ["FTP", "IMAP", "POP"];
//plugin that require Email address
const pluginRequiringEmail = ["SMTP"];
//plugin that require username
const pluginsRequiringUsername = ["SOCKS4", "SOCKS5"];
//const pluginRequiring IP and port
const pluginsRequiringIP = ["HTTP", "IRC", "PJL", "LPD", "FINGER"];

//Default value for Target IP
const defaultTarget = "localhost";

const title = "BEDTool";
const description_userguide =
    "BED is a tool created for checking daemons to identify any potential buffer overflows, format strings, " +
    "and other parameters.\n\nFurther information can be found at: https://www.kali.org/tools/bed/\n\n" +
    "Using BED:\n" +
    "Step 1: Select a Plugin to be used for the scan.\n" +
    "       Eg: HTTP\n\n" +
    "Step 2: Field in the require field that show on the UI\n" +
    "       Eg: For HTTP we need to have a target port.\n\n" +
    "Step 3: Click Scan to commence BED's operation.\n\n" +
    "Step 4: View the Output block below to view the results of the tools execution. \n\n" +
    "Optional: For more advance usage, turn on advance mode.";

interface FormValues {
    plugin: string;
    target: string;
    port: string;
    timeout: string;
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
    const [checkedAdvanced, setCheckedAdvanced] = useState(false);

    // state for selected plugin
    const [selectedPlugin, setSelectedPlugin] = useState("");

    let form = useForm({
        initialValues: {
            plugin: "",
            target: "",
            port: "",
            timeout: "",
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
            pluginsRequiringIP.includes(selectedPlugin)
                ? ["-t", checkedAdvanced ? values.port : defaultTarget, "-p", values.port]
                : [],
            checkedAdvanced ? ["-o", values.timeout] : [],
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
                    label="Advanced Mode"
                    checked={checkedAdvanced}
                    onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                />
                <Select
                    label="Plugin"
                    placeholder="Select a plugin"
                    data={plugin_list}
                    required
                    value={selectedPlugin}
                    onChange={handlePluginChange}
                />
                <TextInput
                    label={"port -> Port to connect to (default: standard port)"}
                    required
                    {...form.getInputProps("port")}
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
                {checkedAdvanced && (
                    <>
                        <TextInput
                            label={"Target -> Host to check (default: localhost)"}
                            {...form.getInputProps("target")}
                        />
                        <TextInput
                            label={"Timeout -> seconds to wait after each test (default: 2 seconds)"}
                            {...form.getInputProps("timeout")}
                        />
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
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
export default BEDTool;
