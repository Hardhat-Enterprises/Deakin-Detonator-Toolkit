import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

const title = "BEDTool";
const description_userguide =
    "BED is a tool created for checking daemons to identify any potential buffer overflows, format strings, " +
    "and other parameters.\n\nFurther information can be found at: https://www.kali.org/tools/bed/\n\n" +
    "Using BED:\n" +
    "Step 1: Enter a Plugin to be used for the scan.\n" +
    "       Eg: HTTP\n\n" +
    "Step 2: Enter a Target IP address.\n" +
    "       Eg: Localhost\n\n" +
    "Step 3: Enter a Port to connect to.\n" +
    "       Eg: 80\n\n" +
    "Step 4: Enter a Timeout value.\n" +
    "       Eg: 5\n\n" +
    "Step 5: Click Scan to commence BED's operation.\n\n" +
    "Step 6: View the Output block below to view the results of the tools execution.";

interface FormValues {
    plugin: string;
    target: string;
    port: string;
    timeout: string;
}

export function BEDTool() {
    const [loading, setLoading] = useState(false);
    const [pid, setPid] = useState("");
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            plugin: "",
            target: "",
            port: "",
            timeout: "",
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
    const onSubmit = (values: FormValues) => {
        setLoading(true);
        const args = ["-s", values.plugin, "-t", values.target, "-p", values.port, "-o", values.timeout];
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
    }, [setOutput]); // Dependency on the setOutput function.

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput
                    label={"plugin Ex: FTP/SMTP/POP/HTTP/IRC/IMAP/PJL/LPD/FINGER/SOCKS4/SOCKS5"}
                    required
                    {...form.getInputProps("plugin")}
                />
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
                <TextInput
                    label={"Timeout -> seconds to wait after each test (default: 2 seconds)"}
                    required
                    {...form.getInputProps("timeout")}
                />
                {SaveOutputToTextFile(output)}
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
export default BEDTool;
