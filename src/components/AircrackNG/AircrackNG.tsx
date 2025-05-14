import { Button, NativeSelect, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { Tooltip, ActionIcon } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";

/**
 * Represents the form values for the Aircrack-ng component.
 */
interface FormValuesType {
    capFile: string;
    wordList: string;
    BSSID: string;
    ESSID: string;
    keyFile: string;
    characters: string;
    customConfig: string;
    KoreK: string;
    quietMode: string;
    fudge: string;
}

const AircrackNG = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable to check if the installation modal is open.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state for the installation modal.
    const [selectedModeOption, setSelectedModeOption] = useState("WEP");
    const [selectedcharacter, setSelectedCharacter] = useState(""); // State variable to store the selected character type.
    const [advancedMode, setAdvancedMode] = useState(false);
    const [KoreKMode, setKoreKMode] = useState(false);
    const [quietMode, setQuietMode] = useState(false);
    const [fudgeMode, setFudgeMode] = useState(false);
    const [customMode, setCustomMode] = useState(false);

    // Component Constants
    const title = "Aircrack-ng";
    const description =
        "Aircrack-ng is a tool for recovering Wi-Fi encryption keys. It supports both WEP and WPA/WPA2-PSK modes for decrypting captured network traffic.";
    const steps =
        "=== Aircrack-ng User Guide ===\n" +
        "=== WEP Mode ===\n" +
        "Step 1. WEP or WPA-PSK: Select 'WEP' from the dropdown menu.\n" +
        "Step 2. Advanced Mode (Optional): Toggle 'Advanced Mode' to enable additional configuration options (see below for more details).\n" +
        "Step 3. Set Access Point Details (Optional): Provide the MAC address (BSSID) and/or network name (ESSID) of the target access point (e.g., 12:34:56:78:90:AB, MyWiFiNetwork).\n" +
        "Step 4. Packet Capture File: Specify the path and filename of the packet capture file containing intercepted packets (e.g., /path/to/file.cap).\n" +
        "Step 5. Save Key to Output File (Optional): Provide the file path and name where the recovered key should be saved.\n" +
        "Step 6. Start Aircrack-ng: Once all fields are configured, click 'Start Aircrack-ng' to begin the key recovery process.\n" +
        "=== WPA/WPA2-PSK Mode ===\n" +
        "Step 1. WEP or WPA-PSK: Select 'WPA' from the dropdown menu.\n" +
        "Step 2. Advanced Mode (Optional): Toggle 'Advanced Mode' to enable additional configuration options (see below for more details).\n" +
        "Step 3. Wordlist(s) Filename(s): Specify the file path(s) to the wordlist(s) that will be used for the dictionary attack (e.g., /path/to/wordlist.txt).\n" +
        "Step 4. Set Access Point Details (Optional): Provide the MAC address (BSSID) and/or network name (ESSID) of the target access point (e.g., 12:34:56:78:90:AB, MyWiFiNetwork).\n" +
        "Step 5. Packet Capture File: Specify the path and filename of the packet capture file containing the WPA handshake (e.g., /path/to/file.cap).\n" +
        "Step 6. Save Key to Output File (Optional): Provide a file path and name where the recovered key will be saved.\n" +
        "Step 7. Start Aircrack-ng: Click 'Start Aircrack-ng' to initiate the dictionary attack.\n" +
        "=== Advanced Mode Options (WEP & WPA) ===\n" +
        "Alpha-numeric or Binary-coded Decimal or Default: Restricts the key search space to the selected character set.\n" +
        "Quiet Mode: Suppresses status output until the key is found, resulting in a cleaner and less cluttered display. Requires either BSSID or ESSID to function.\n" +
        "Custom Mode: Allows additional parameters not included in the toolkit to be entered. Only use if necessary.\n" +
        "--- Advanced Options (WEP Only) ---\n" +
        "KoreK: Enables KoreK attack method, improving WEP key recovery using older .ivs files. Do not enable unless the capture file is in the .ivs format.\n" +
        "Fudge: Sets the brute-force fudge factor. A higher value increases the depth of the attack and the likelihood of success, but also increases runtime.";
    const sourceLink = "https://www.kali.org/tools/aircrack-ng/"; //link to the source component.
    const tutorial = "https://docs.google.com/document/d/1UJQSVmOsA2mF0XYxnAzipqiYGfVSCUB5/edit?usp=sharing&ouid=104969582837646506925&rtpof=true&sd=true";


    // Component Constants.
    const types = ["WEP", "WPA"]; // Security types supported by Aircrack-ng.
    const characters = ["Default", "Alpha-Numeric", "Binary Coded Decimal"]; // Character types supported by Aircrack-ng.
    const dependencies = ["aircrack-ng"]; // Dependencies required for the Aircrack-ng tool.

    useEffect(() => {
        // Check the availability of all commands in the dependencies array.
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                // Set the state variable to indicate if the command is available.
                setIsCommandAvailable(isAvailable);
                // Set the state variable to indicate if the installation modal should be open.
                setOpened(!isAvailable);
                // Set the loading state of the installation modal to false after the check is done.
                setLoadingModal(false);
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                // Set the loading state of the installation modal to false in case of error.
                setLoadingModal(false);
            });
    }, []);

    // Form Hook to handle form input.
    const form = useForm({
        initialValues: {
            capFile: "",
            wordList: "",
            BSSID: "",
            ESSID: "",
            keyFile: "",
            characters: "",
            customConfig: "",
            KoreK: "",
            quietMode: "",
            fudge: "",
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
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the aircrack-ng tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the CAP file path and wordList path.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Initialise the arguments for the aircrack-ng command based on form input
        const args = [values.capFile];
        if (values.keyFile) args.push(`-l`, values.keyFile);

        // WEP-specific options
        if (values.BSSID) args.push(`-b`, values.BSSID);

        // Advanced WEP options
        if (selectedcharacter === "Alpha-Numeric") args.push(`-c`);
        if (selectedcharacter === "Binary Coded Decimal") args.push(`-t`);
        if (KoreKMode) args.push(`-K`);
        if (quietMode) args.push(`-q`);
        if (fudgeMode) args.push(`-f`, values.fudge);

        // WPA-specific options
        if (values.wordList) args.push(`-w`, values.wordList);
        if (values.ESSID) args.push(`-e`, values.ESSID);

        // Custom Configuration section
        if (customMode) args.push(values.customConfig);

        // Execute the aircrack-ng command via helper method and handle its output or potential errors
        CommandHelper.runCommandGetPidAndOutput("aircrack-ng", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
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
    }, [setOutput]);

    const isWEP = selectedModeOption === "WEP";
    const isWPA = selectedModeOption === "WPA";

    // Resets the form whenever the mode changes (from WEP to WPA or vice versa)
    useEffect(() => {
        form.reset();
    }, [selectedModeOption]);

    // Resets all advanced mode toggles and entered values to their default state
    // Add any new advanced mode options here
    const resetModes = () => {
        setKoreKMode(false);
        setFudgeMode(false);
        setQuietMode(false);
        setCustomMode(false);

        form.setFieldValue("customConfig", "");
        form.setFieldValue("fudge", "");
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
                ></InstallationModal>
            )}
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, "", handleProcessData, handleProcessTermination)}
                    <NativeSelect
                        value={selectedModeOption}
                        onChange={(e) => {
                            setSelectedModeOption(e.target.value);
                            // Turns advanced options off when switching modes
                            setAdvancedMode(false);
                            resetModes();
                        }}
                        data={types}
                        required
                        label={"WEP or WPA-PSK"}
                    />
                    <Switch
                        size="md"
                        label="Advanced Mode"
                        checked={advancedMode}
                        onChange={(e) => {
                            const isChecked = e.currentTarget.checked;
                            setAdvancedMode(isChecked);
                            if (!isChecked) {
                                setSelectedCharacter("Default"); // Reset character selection when turning off Advanced Mode
                                // Resets advanced mode toggle options
                                resetModes();
                            }
                        }}
                    />
                    {isWPA && (
                        <TextInput
                            label={"Wordlist(s) filename(s) (Please supply file path and filename)"}
                            required
                            {...form.getInputProps("wordList")}
                        />
                    )}
                    <TextInput
                        label={"Set AP MAC address (BSSID)"}
                        placeholder={"eg: xx:xx:xx:xx:xx:xx"}
                        {...form.getInputProps("BSSID")}
                    />
                    <TextInput label={"Set AP identifier (ESSID)"} {...form.getInputProps("ESSID")} />
                    <TextInput
                        label={"Packet capture file (Please supply file path and filename)"}
                        placeholder={"eg: x/x/*.cap"}
                        required
                        {...form.getInputProps("capFile")}
                    />
                    <TextInput
                        label={"Save as key to output file (Please supply file path and filename)"}
                        {...form.getInputProps("keyFile")}
                    />
                    {advancedMode && isWEP && (
                        <NativeSelect
                            value={selectedcharacter}
                            onChange={(e) => setSelectedCharacter(e.target.value)}
                            data={characters}
                            label={"Alpha-numeric or binary-coded decimal or default"}
                        />
                    )}
                    {advancedMode && (
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <Switch
                                size="md"
                                label="Quiet Mode (Requires BSSID or ESSID)"
                                checked={quietMode}
                                onChange={(e) => {
                                    const isChecked = e.currentTarget.checked;
                                    setQuietMode(isChecked);
                                }}
                            />
                            {isWEP && (
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <Switch
                                        size="md"
                                        label="Enable KoreK"
                                        checked={KoreKMode}
                                        onChange={(e) => {
                                            const isChecked = e.currentTarget.checked;
                                            setKoreKMode(isChecked);
                                        }}
                                    />
                                    <Tooltip
                                        label="Only use KoreK with IVS files, as using it with other file types may cause the program to hang or break."
                                        position="top"
                                        withArrow
                                    >
                                        <ActionIcon style={{ marginLeft: "-15px", marginTop: "-3px" }}>
                                            <IconInfoCircle size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                </div>
                            )}
                            {isWEP && (
                                <Switch
                                    size="md"
                                    label="Set Fudge"
                                    checked={fudgeMode}
                                    onChange={(e) => {
                                        const isChecked = e.currentTarget.checked;
                                        setFudgeMode(isChecked);
                                        if (!isChecked) {
                                            setSelectedCharacter("Default");
                                        }
                                    }}
                                />
                            )}
                            <Switch
                                size="md"
                                label="Custom Mode"
                                checked={customMode}
                                onChange={(e) => {
                                    const isChecked = e.currentTarget.checked;
                                    setCustomMode(isChecked);
                                }}
                            />
                        </div>
                    )}
                    {fudgeMode && (
                        <TextInput
                            label={"Set Fudge value"}
                            placeholder={"2"}
                            required
                            {...form.getInputProps("fudge")}
                        />
                    )}
                    {customMode && (
                        <TextInput label={"Custom Parameters"} required {...form.getInputProps("customConfig")} />
                    )}
                    <Button type={"submit"}>Start {title}</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default AircrackNG;
