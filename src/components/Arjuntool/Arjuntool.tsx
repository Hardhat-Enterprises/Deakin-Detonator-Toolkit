import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";

// Component constants.
const title = "Arjun";

// Contains the description of the component.
const description_userguide =
    "Arjun is a command-line tool specifically designed to look for hidden HTTP parameters. " +
    "Arjun will try to discover parameters and give you a new set of endpoints to test on. " +
    "It is a multi-threaded application and can handle rate limits. It supports GET,POST,XML and JSON methods.\n\n" +
    "How to use Arjun:\n\n" +
    "Step 1: Enter a valid URL. E.g. https://www.deakin.edu.au\n" +
    "Step 2: Enter an optional JSON Ootput filename. E.g. arjunoutput.\n" +
    "Step 3: Click the scan option to commence scanning.\n" +
    "Step 4: View the output block below to see the results.";

/**
 * Represents the form values for the Arjun component.
 */  
interface FormValues {
    url: string;
    output_filename: string;
}

function Arjuntool() {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.

    // Form Hook to handle form input.
    let form = useForm({
        initialValues: {
            url: "",
            output_filename: "",
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
     * @param {object} param - An object containing information about the process termination.
     * @param {number} param.code - The exit code of the terminated process.
     * @param {number} param.signal - The signal code indicating how the process was terminated.
     */
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            // If the process was terminated successfully, display a success message.
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
                // If the process was terminated due to a signal, display the signal code.
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
                // If the process was terminated with an error, display the exit code and signal code.
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }

            // Clear the child process pid reference. There is no longer a valid process running.
            setPid("");

            // Cancel the loading overlay. The process has completed.
            setLoading(false);

            // Now that loading has completed, allow the user to save the output to a file.
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    // Actions taken after saving the output
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    const onSubmit = async (values: FormValues) => {
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Construct arguments for the aircrack-ng command based on form input
        const args = ["-u", values.url];

        if (values.output_filename) {
            args.push("-o", values.output_filename);
        }

        // Execute the arjun command via helper method and handle its output or potential errors
        CommandHelper.runCommandGetPidAndOutput("arjun", args, handleProcessData, handleProcessTermination)
            .then(({ pid, output }) => {
                // Update the output with the results of the command execution.
                setOutput(output);

                // Store the process ID of the executed command.
                setPid(pid);
                
            })
            .catch((error) => {
                // Display any errors encountered during command execution.
                setOutput(error.message);

                // Deactivate loading state.
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
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label={"URL"} required {...form.getInputProps("url")} />
                <Button type={"submit"}>Scan</Button>
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}

export default Arjuntool;
