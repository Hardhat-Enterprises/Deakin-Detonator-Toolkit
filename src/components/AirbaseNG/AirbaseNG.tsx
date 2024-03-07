import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

/**
 * TODO:
 * 1. Refine the user interface for better usability and integrate a mechanism for file selection from the local machine.
 * 2. Introduce an 'Advanced Mode' for users familiar with the nuances of the tool.
 * 3. Gradually expand input options in 'Advanced Mode' with the eventual aim of encompassing all functionalities of `airbase-ng`.
 * 4. Enhance the output display to ensure optimal readability, especially for extensive outputs.
 * 5. Unblock the loading screen during the up time of the Airbase ng and provide real time data update
 */

const title = "Create Fake Access Point with Airbase-ng";
const description_userguide =
    "Airbase-ng is a tool to create fake access points.\n\n" +
    "Step 1: Type in the name of your fake host.\n" +
    "Step 2: Select your desired channel.\n" +
    "Step 3: Specify the WLAN interface to be used.\n" +
    "Step 4: Click 'Start AP' to begin the process.\n" +
    "Step 5: View the Output block below to see the results.\n\n";

interface FormValuesType {
    FakeHost: string;
    Channel: string;
    Wlan: string;
}

const AirbaseNG = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");

    const form = useForm({
        initialValues: {
            FakeHost: "",
            Channel: "",
            Wlan: "",
        },
    });
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
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the airbase-ng tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the fake host name, channel, and WLAN interface.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Construct arguments for the aircrack-ng command based on form input
        const args = ["-e", values.FakeHost, "-c", values.Channel, values.Wlan];

        // Execute the aircrack-ng command via helper method and handle its output or potential errors
        CommandHelper.runCommandWithPkexec("airbase-ng", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
                // Update the UI with the results from the executed command
                setOutput(output);
                console.log(pid);
                setPid(pid);
            })
            .catch((error) => {
                // Display any errors encountered during command execution
                setOutput(error.message);
                // Deactivate loading state
                setLoading(false);
            });
    };

    /**
     * clearOutput: Callback function to clear the console output.
     * It resets the state variable holding the output, thereby clearing the display.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);
    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label={"Name of your fake Host"} required {...form.getInputProps("FakeHost")} />
                <TextInput label={"Channel of choice"} required {...form.getInputProps("Channel")} />
                <TextInput label={"Your Wlan"} required {...form.getInputProps("Wlan")} />
                {SaveOutputToTextFile(output)}
                <Button type={"submit"}>Start AP</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default AirbaseNG;
