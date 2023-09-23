import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

/**
 * TODO:
 * 1. Refine the user interface for better usability and integrate a mechanism for file selection from the local machine.
 * 2. Introduce an 'Advanced Mode' for users familiar with the nuances of the tool.
 * 3. Gradually expand input options in 'Advanced Mode' with the eventual aim of encompassing all functionalities of `aircrack-ng`.
 * 4. Enhance the output display to ensure optimal readability, especially for extensive outputs.
 * 5. Provide real-time feedback during the loading phase, allowing users to monitor ongoing processes.
 */

const title = "WEP/WPA Cracking with Aircrack-ng";
const description_userguide =
    "Aircrack-ng is a tool for cracking WEP and WPA/WPA2 passphrases using captured network packets.\n\n" +
    "IMPORTANT NOTE: this tools require real capture packets containing 4 ways handshake to work.\n\n" +
    "                For tester move your both your capture file and password file into src-tauri folder.\n\n" +
    "                before Step 1.\n\n" +
    "Step 1: Type in your capture packets name including the extension .cap";
"Step 2: Type your password file name including the extension .txt or .lst).\n" +
    "Step 3: Click 'Start Cracking' to begin the process.\n" +
    "Step 4: View the Output block below to see the results.\n\n";

interface FormValuesType {
    capFile: string;
    wordlist: string;
}

const AircrackNG = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    const form = useForm({
        initialValues: {
            capFile: "",
            wordlist: "",
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

            // Allow Saving as the output is finalised
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the aircrack-ng tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the CAP file path and wordlist path.
     */

    // Actions taken after saving the output
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    const onSubmit = async (values: FormValuesType) => {
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Construct arguments for the aircrack-ng command based on form input
        const args = [values.capFile, "-w", values.wordlist];

        // Execute the aircrack-ng command via helper method and handle its output or potential errors
        CommandHelper.runCommandGetPidAndOutput("aircrack-ng", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
                // Update the UI with the results from the executed command
                setOutput(output);
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
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label={"CAP File Path"} required {...form.getInputProps("capFile")} />
                <TextInput label={"Path to worldlist"} required {...form.getInputProps("wordlist")} />
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <Button type={"submit"}>Start Cracking</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default AircrackNG;
