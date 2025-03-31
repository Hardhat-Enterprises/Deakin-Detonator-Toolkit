import { Button, Stack, Switch, TextInput, Tooltip } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the AirbaseNG component.
 * @interface
 */
interface FormValuesType {
    fakeHost: string;
    channel: string;
    macAddress: string;
    replayInterface: string;
    filePath: string;
    verbosity: boolean; // Advanced mode: Verbosity flag
    disableBeacons: boolean; // Advanced mode: Disable beacons
    customConfig: string;
    customScript: string; // Custom mode: Custom script path
}

/**
 * The AirbaseNG component handles the setup and execution of the airbase-ng tool.
 * Supports Basic, Advanced, and Custom modes for flexibility in input parameters.
 * @returns The AirbaseNG component.
 */
const AirbaseNG = () => {
    // State variables to manage the component's functionality.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [advanceMode, setAdvanceMode] = useState(false);
    const [customMode, setCustomMode] = useState(false);

    // Constants for the component's metadata.
    const title = "Airbase-ng"; // Title of the component.
    const description = "Airbase-ng is a tool to create fake access points."; // Description of the component.
    const steps =
        "Step 1: Type in the name of your fake host.\n" +
        "Step 2: Select your desired channel.\n" +
        "Step 3: Specify the WLAN interface to be used.\n" +
        "Step 4: Click 'Start AP' to begin the process.\n" +
        "Step 5: View the output block to see the results.";
    const sourceLink = "https://www.kali.org/tools/aircrack-ng/#airbase-ng"; // Link to the source code (or Kali Tools).
    const tutorial = "https://docs.google.com/document/d/1B1DCpYKFMOn-aEKUJhFvvHnQDxe6KqeLqCgKWijn9pM/edit?usp=sharing"; // Link to the official documentation/tutorial.
    const dependencies = ["aircrack-ng"]; // Contains the dependencies required by the compon

    // Form handling for the component's input fields.
    const form = useForm({
        initialValues: {
            fakeHost: "",
            channel: "6", // Default channel
            replayInterface: "wlan0", // Default interface
            macAddress: "",
            filePath: "",
            verbosity: false,
            disableBeacons: false,
            customConfig: "",
            customScript: "",
        },
    });

    // Effect to check command availability on component mount.
    useEffect(() => {
        // Check if the command is available and set the state variables accordingly.
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable); // Set the command availability state
                setOpened(!isAvailable); // Set the modal state to opened if the command is not available
                setLoadingModal(false); // Set loading to false after the check is done
            })
            .catch((error: any) => {
                // Fix the error type
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
            if (code === 0) {
                // If the process was successful, display a success message.
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                // If the process was terminated manually, display a termination message.
                handleProcessData("\nProcess was manually terminated.");
            } else {
                // If the process was terminated with an error, display the exit and signal codes.
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }
            setPid("");
            // Clear the child process pid reference. There is no longer a valid process running.
            setLoading(false);
            // Cancel the loading overlay. The process has completed.
            setAllowSave(true);
            // Allow Saving as the output is finalised
            setHasSaved(false);
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
        setLoading(true);
        // Activate loading state to indicate ongoing process
        setAllowSave(false);
        // Disallow saving until the tool's execution is complete

        // Construct arguments for the airbase-ng command based on form input
        const args = ["-e", values.fakeHost, "-c", values.channel, values.replayInterface];

        // Advanced Mode Options
        if (advanceMode) {
            if (values.verbosity) args.push("-v");
            if (values.disableBeacons) args.push("--no-beacons");
        }

        // Additional parameters for Advanced and Custom modes
        if (values.macAddress) args.push("-a", values.macAddress);
        if (values.filePath) args.push("-F", values.filePath);
        if (values.customConfig) args.push(values.customConfig);

        // Custom Mode Option: Custom script execution
        if (customMode && values.customScript) {
            args.push(`&& bash ${values.customScript}`);
        }

        try {
            const { output, pid } = await CommandHelper.runCommandWithPkexec(
                "airbase-ng",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setOutput(output);
            setAllowSave(true);
            setPid(pid);
        } catch (error: any) {
            // Display any errors encountered during command execution
            setOutput(error.message || "An unknown error occurred.");
            setLoading(false); // Deactivate loading state
            setAllowSave(true);
        }
    };

    /**
     * Clears the output state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    const handleSaveComplete = () => {
        setHasSaved(true); // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setAllowSave(false);
    };

    return (
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
                />
            )}
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, handleProcessData, handleProcessTermination)}

                    {/* Advanced Mode Switch */}
                    <Tooltip label="Enable advanced settings">
                        <Switch
                            size="md"
                            label="Advanced Mode"
                            checked={advanceMode}
                            onChange={(e) => setAdvanceMode(e.currentTarget.checked)}
                        />
                    </Tooltip>

                    {/* Custom Mode Switch */}
                    <Tooltip label="Enable custom configuration">
                        <Switch
                            size="md"
                            label="Custom Configuration"
                            checked={customMode}
                            onChange={(e) => setCustomMode(e.currentTarget.checked)}
                        />
                    </Tooltip>

                    {/* Basic Mode Inputs */}
                    <TextInput label="Name of your fake host" required {...form.getInputProps("fakeHost")} />
                    <TextInput label="Channel of choice" required {...form.getInputProps("channel")} />
                    <TextInput label="Your WLAN interface" required {...form.getInputProps("replayInterface")} />

                    {/* Advanced Mode Inputs */}
                    {advanceMode && (
                        <>
                            <TextInput label="Set AP MAC address" {...form.getInputProps("macAddress")} />
                            <TextInput
                                label="Save as Pcap File (Please Supply FilePath)"
                                {...form.getInputProps("filePath")}
                            />
                            <Tooltip label="Enable verbose output">
                                <Switch
                                    label="Verbose output"
                                    {...form.getInputProps("verbosity", { type: "checkbox" })}
                                />
                            </Tooltip>
                            <Tooltip label="Disable sending beacons">
                                <Switch
                                    label="Disable beacons"
                                    {...form.getInputProps("disableBeacons", { type: "checkbox" })}
                                />
                            </Tooltip>
                        </>
                    )}

                    {/* Custom Mode Inputs */}
                    {customMode && (
                        <>
                            <TextInput label="Custom configuration" {...form.getInputProps("customConfig")} />
                            <TextInput
                                label="Custom script path"
                                placeholder="Path to custom script"
                                {...form.getInputProps("customScript")}
                            />
                            <div>
                                <strong>Command Preview:</strong> airbase-ng {form.values.fakeHost}{" "}
                                {form.values.customConfig}
                            </div>
                        </>
                    )}

                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type="submit">Start {title}</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default AirbaseNG;
