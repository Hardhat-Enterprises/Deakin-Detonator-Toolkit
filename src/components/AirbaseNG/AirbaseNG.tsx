import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

// Component constants.
const title = "Airbase-Ng"; // Contains the title of the component.

// Contains the description of the component.
const description_userguide =
    "Airbase-Ng is a component of the Aircrack-Ng suite. Its primary purpose is to create fake access points and perform various " +
    "attacks on wireless networks.\n\n" +
    "How to use Airbase-Ng:\n\n" +
    "Step 1: Type in the name of your fake host. This will be used as the SSID (Service Set Identifier). E.g. Free WiFi.\n" +
    "Step 2: Specify the WLAN interface to be used.\n" +
    "Step 3: Click 'Start AP' to begin the process.\n" +
    "Step 4: View the Output block below to see the results.\n" +
    "Optionally you may select additional advanced options.";

/**
 * Represents the form values for the AirbaseNG component.
 */
interface FormValuesType {
    fakeHost: string;
    channel: string;
    wlan: string;
}

const AirbaseNG = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.

    // Component Constants.
    const dependencies = ["aircrack-ng"]; // Contains the dependencies required by the component.

    // Check if the command is available and set the state variables accordingly.
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

    // Form Hook to handle form input.
    const form = useForm({
        initialValues: {
            fakeHost: "",
            channel: "",
            wlan: "",
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
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the airbase-ng tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the fake host name and WLAN interface.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process.
        setLoading(true);

        // Construct arguments for the aircrack-ng command based on form input.
        const args = ["-e", values.fakeHost, "-c", values.channel, values.wlan];

        // Execute the aircrack-ng command via helper method and handle its output or potential errors.
        CommandHelper.runCommandWithPkexec("airbase-ng", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
                // Update the output with the results of the command execution.
                setOutput(output);

                // Store the process ID of the executed command.
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
        <>
            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description_userguide}
                    dependencies={dependencies}
                ></InstallationModal>
            )}
            <form onSubmit={form.onSubmit(onSubmit)}>
                {LoadingOverlayAndCancelButton(loading, pid)}
                <Stack>
                    {UserGuide(title, description_userguide)}
                    <TextInput label={"Service Set Identifier (SSID)"} required {...form.getInputProps("fakeHost")} />
                    <TextInput label={"Channel of choice"} required {...form.getInputProps("channel")} />
                    <TextInput label={"WLAN Interface"} required {...form.getInputProps("wlan")} />
                    {SaveOutputToTextFile(output)}
                    <Button type={"submit"}>Start Access Point</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </>
    );
};

export default AirbaseNG;
