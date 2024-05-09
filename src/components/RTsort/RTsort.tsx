import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

const title = "Rainbow Table Sort (rtsort)";
const description_userguide =
    "RTSort is a subfuntion of the Rainbow Crack tool. This function sorts created rainbow tables.";

/**
 * Represents the form values for the RTsort component.
 */
interface FormValuesType {
    path: string;
}

// Funtion for implementing RTSort as GUI component
const rtsort = () => {
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); //  State variable to store the process ID of the command execution.

    // Form hook to handle form input.
    let form = useForm({
        initialValues: {
            path: "./",
        },
    });

    /** *
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     *  It updates the state by appending the new data received to the existing output.
     *  @param {string} data - The data received from the child process.
     * */
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

            // Clear the child process pid reference
            setPid("");

            // Cancel the Loading Overlay
            setLoading(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the rt-sort tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form value, containing path.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process
        setLoading(true);
        // Construct arguments for the RTsort command based on form input
        const args = [values.path];
        const filteredArgs = args.filter((arg) => arg !== ""); // Variable to store non empty string as argument

        // Please note this command should not be cancelled as this will cause the rainbow table to be corrupted
        // Execute the aircrack-ng command via helper method and handle its output or potential errors
        try {
            // Execute the artsort command via helper method and handle its output or potential errors
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "rtsort",
                filteredArgs,
                handleProcessData,
                handleProcessTermination
            );
            // Update the UI with the results from the executed command
            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any) {
            setOutput(e);
        }
    };
    /**
     * Clears the output state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    // placeholder="/home/user/rainbowcrack/tables/ntlm_loweralpha-numeric#1-9_0_1000x1000_0.rt"
    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput
                    label={"Path"}
                    required
                    placeholder="/home/user/rainbowcrack/tables/ntlm_loweralpha-numeric#1-9_0_1000x1000_0.rt"
                    {...form.getInputProps("path")}
                />
                <br></br>
                <Button type={"submit"}>Start Sort</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default rtsort;
