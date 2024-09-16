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
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [advanceMode, setAdvanceMode] = useState(false);
    const [customMode, setCustomMode] = useState(false);

    // Constants for the component's metadata.
    const title = "Airbase-ng";
    const description = "Airbase-ng is a tool to create fake access points.";
    const steps =
        "Step 1: Type in the name of your fake host.\n" +
        "Step 2: Select your desired channel.\n" +
        "Step 3: Specify the WLAN interface to be used.\n" +
        "Step 4: Click 'Start AP' to begin the process.\n" +
        "Step 5: View the output block to see the results.";
    const sourceLink = ""; // Placeholder for source link.
    const tutorial = ""; // Placeholder for tutorial link.
    const dependencies = ["aircrack-ng"];

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

        // Validation: Ensure essential fields are filled.
        validate: {
            fakeHost: (value) => (value ? null : "Fake host name is required."),
            channel: (value) => (value ? null : "Channel is required."),
            replayInterface: (value) => (value ? null : "WLAN interface is required."),
        },
    });

    // Effect to check command availability on component mount.
    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable);
                setOpened(!isAvailable);
                setLoadingModal(false);
            })
            .catch((error: any) => {
                // Fix the error type
                console.error("An error occurred:", error);
                setLoadingModal(false);
            });
    }, []);

    /**
     * Handles incoming data from the child process.
     * @param {string} data - Data received from the process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    /**
     * Handles the termination of the child process.
     * @param {object} param - Process termination details.
     * @param {number} param.code - Exit code of the process.
     * @param {number} param.signal - Termination signal.
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
            setPid("");
            setLoading(false);
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    /**
     * Handles the form submission to run the airbase-ng command.
     * @param {FormValuesType} values - Form values.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);

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
            // Fix the error type
            setOutput(error.message || "An unknown error occurred.");
            setLoading(false);
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
        setHasSaved(true);
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
                                    label="Verbose Output"
                                    {...form.getInputProps("verbosity", { type: "checkbox" })}
                                />
                            </Tooltip>
                            <Tooltip label="Disable sending beacons">
                                <Switch
                                    label="Disable Beacons"
                                    {...form.getInputProps("disableBeacons", { type: "checkbox" })}
                                />
                            </Tooltip>
                        </>
                    )}

                    {/* Custom Mode Inputs */}
                    {customMode && (
                        <>
                            <TextInput label="Custom Configuration" {...form.getInputProps("customConfig")} />
                            <TextInput
                                label="Custom Script Path"
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
