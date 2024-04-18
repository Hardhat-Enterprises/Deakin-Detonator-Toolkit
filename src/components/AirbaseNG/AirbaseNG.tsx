import { Button, Stack, Switch, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
<<<<<<< HEAD

const title = "Create Fake Access Point with Airbase-ng";
const description_userguide =
    "Airbase-ng is a tool to create fake access points.\n\n" +
    "Step 1: Type in the name of your fake host.\n" +
    "Step 2: Select your desired channel.\n" +
    "Step 3: Specify the WLAN interface to be used.\n" +
    "Step 4: Click 'Start AP' to begin the process.\n" +
    "Step 5: View the Output block below to see the results.\n\n";

interface FormValuesType {
    fakeHost: string;
    channel: string;
    replayInterface: string;
    macAddress: string;
    interface: string;
    filePath: string;
    customConfig: string;
=======
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the AirbaseNG component.
 */
interface FormValuesType {
    fakeHost: string;
    channel: string;
    wlan: string;
>>>>>>> main
}

/**
 * The AirbaseNG component.
 * @returns The AirbaseNG component.
 */
const AirbaseNG = () => {
<<<<<<< HEAD
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [advanceMode, setAdvanceMode] = useState(false);
    const [customMode, setCustomMode] = useState(false);
=======
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
>>>>>>> main

    // Component Constants.
    const title = "Airbase-ng"; // Title of the component.
    const description = "Airbase-ng is a tool to create fake access points."; // Description of the component.
    const steps =
        "Step 1: Type in the name of your fake host.\n" +
        "Step 2: Select your desired channel.\n" +
        "Step 3: Specify the WLAN interface to be used.\n" +
        "Step 4: Click 'Start AP' to begin the process.\n" +
        "Step 5: View the output block to see the results. ";
    const sourceLink = ""; // Link to the source code (or Kali Tools).
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["aircrack-ng"]; // Contains the dependencies required by the component.

    // Form hook to handle form input.
    const form = useForm({
        initialValues: {
            fakeHost: "",
            channel: "",
<<<<<<< HEAD
            replayInterface: "",
            macAddress: "",
            interface: "",
            filePath: "",
            customConfig: "",
=======
            wlan: "",
>>>>>>> main
        },
    });

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
     * @param {FormValuesType} values - The form values, containing the fake host name, channel, and WLAN interface.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Construct arguments for the aircrack-ng command based on form input
<<<<<<< HEAD
        const args = ["-e", values.fakeHost, "-c", values.channel, values.replayInterface];

        values.macAddress ? args.push(`-a`, values.macAddress) : undefined;
        values.interface ? args.push(`-i`, values.interface) : undefined;
        values.filePath ? args.push(`-F`, values.filePath) : undefined;
=======
        const args = ["-e", values.fakeHost, "-c", values.channel, values.wlan];
>>>>>>> main

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

    const close = async () => {
        const args = [`-2`, pid];
        await CommandHelper.runCommandWithPkexec("kill", args, handleProcessData, handleProcessTermination);
        setLoading(false);
    };

    /**
     * Clears the output state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
<<<<<<< HEAD
        <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack>
                {UserGuide(title, description_userguide)}
                <Switch
                    size="md"
                    label="Advanced Mode"
                    checked={advanceMode}
                    onChange={(e) => setAdvanceMode(e.currentTarget.checked)}
                />
                <Switch
                    size="md"
                    label="Custom Mode"
                    checked={customMode}
                    onChange={(e) => setCustomMode(e.currentTarget.checked)}
                />
                <TextInput label={"Name of your fake Host"} required {...form.getInputProps("fakeHost")} />
                <TextInput label={"Channel of choice"} required {...form.getInputProps("channel")} />
                <TextInput label={"Replay Interface"} required {...form.getInputProps("replayInterface")} />
                {advanceMode && (
                    <>
                        <TextInput label={"Set AP MAC address"} {...form.getInputProps("macAddress")} />
                        <TextInput label={"Capture packets from this interface"} {...form.getInputProps("interface")} />
                        <TextInput
                            label={"Output results as Pcap file (Please supply file path)"}
                            {...form.getInputProps("filePath")}
                        />
                    </>
                )}
                {customMode && <TextInput label={"Custom Configuration"} {...form.getInputProps("customConfig")} />}
                {SaveOutputToTextFile(output)}
                <Button type={"submit"}>Start AP</Button>
                {loading && <Button onClick={close}>Stop</Button>}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
=======
        <RenderComponent
            title={title}
            description={description}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description}
                    dependencies={dependencies}
                ></InstallationModal>
            )}
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <TextInput label={"Name of your fake host"} required {...form.getInputProps("fakeHost")} />
                    <TextInput label={"Channel of choice"} required {...form.getInputProps("channel")} />
                    <TextInput label={"Your WLAN interface"} required {...form.getInputProps("wlan")} />
                    {SaveOutputToTextFile(output)}
                    <Button type={"submit"}>Start {title}</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
>>>>>>> main
    );
};

export default AirbaseNG;
