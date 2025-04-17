import { Button, NativeSelect, Stack, TextInput, Switch, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect, useRef } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

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
    MACAddress: string;
    PMKID: string;
    customConfig: string;
    fakeHost: string;
}

// Component Constants
const title = "Aircrack-ng";
const description =
    "Aircrack-ng is a tool for recovering Wi-Fi encryption keys. It supports both WEP and WPA/WPA2-PSK modes for decrypting captured network traffic.";
const steps =
    "=== Aircrack-ng User Guide ===\n\n" +
    "=== WEP Mode ===\n" +
    "1. WEP or WPA-PSK: Select 'WEP' from the dropdown menu.\n\n" +
    "2. Advanced Mode (Optional): Toggle 'Advanced Mode' to enable additional configuration for output format.\n\n" +
    "3. Set AP MAC Address (BSSID) (Optional): Provide the MAC address of the access point (e.g., XX:XX:XX:XX:XX:XX).\n\n" +
    "4. Packet Capture File: Specify the path and filename of the packet capture file containing intercepted packets (e.g., /path/to/file.cap).\n\n" +
    "5. Save Key to Output File (Optional): Provide the file path and name where the recovered key should be saved.\n\n" +
    "6. Alpha-numeric or Binary-coded Decimal or Default (Advanced Mode Only): If 'Advanced Mode' is enabled, choose the format for the key.\n\n" +
    "7. Start Aircrack-ng: Once all fields are configured, click 'Start Aircrack-ng' to begin the key recovery process.\n\n" +
    "=== WPA/WPA2-PSK Mode ===\n" +
    "1. WEP or WPA-PSK: Select 'WPA' from the dropdown menu.\n\n" +
    "2. Wordlist(s) Filename(s): Specify the file path(s) to the wordlist(s) that will be used for the dictionary attack (e.g., /path/to/wordlist.txt).\n\n" +
    "3. Set AP Identifier (Optional): Provide the identifier for the access point you are targeting.\n\n" +
    "4. Packet Capture File: Specify the path and filename of the packet capture file containing the WPA handshake (e.g., /path/to/file.cap).\n\n" +
    "5. Save Key to Output File (Optional): Provide a file path and name where the recovered key will be saved.\n\n" +
    "6. Start Aircrack-ng: Click 'Start Aircrack-ng' to initiate the dictionary attack.";
const sourceLink = "https://www.kali.org/tools/aircrack-ng/"; //link to the source component.
const tutorial = "https://docs.google.com/document/d/1uMAojanvI4lQkJ5q9lx4HOioNbYTPbfY59RCHvQn4ow/edit?usp=sharing";
const dependencies = "Aircrack-NG"; //contains the dependancies required for the component.

const AircrackNG = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable to check if the installation modal is open.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state for the installation modal.
    const [selectedModeOption, setSelectedModeOption] = useState("WEP");
    const [advanceMode, setAdvanceMode] = useState(false);
    const [customMode, setCustomMode] = useState(false);
    const [showAlert, setShowAlert] = useState(true); // Initial state is true
    const alertTimeout = useRef<NodeJS.Timeout | null>(null);

    // AirCrack-ng specific state variables.
    const [selectedtype, setSelectedType] = useState(""); // State variable to store the selected security type.
    const [selectedcharacter, setSelectedCharacter] = useState(""); // State variable to store the selected character type.

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

        // Set timeout to remove alert after 5 seconds on load.
        alertTimeout.current = setTimeout(() => {
            setShowAlert(false);
        }, 5000);

        return () => {
            if (alertTimeout.current) {
                clearTimeout(alertTimeout.current);
            }
        };
    }, []);

    const handleShowAlert = () => {
        setShowAlert(true);
        if (alertTimeout.current) {
            clearTimeout(alertTimeout.current);
        }
        alertTimeout.current = setTimeout(() => {
            setShowAlert(false);
        }, 5000);
    };

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

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the aircrack-ng tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the CAP file path and wordList path.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

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
        if (values.MACAddress) args.push(`-m`, values.MACAddress);

        // WPA-specific options
        if (values.wordList) args.push(`-w`, values.wordList);
        if (values.ESSID) args.push(`-e`, values.ESSID);

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
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    const isWEP = selectedModeOption === "WEP";
    const isWPA = selectedModeOption === "WPA";

    // Form Hook to handle form input.
    const form = useForm({
        initialValues: {
            capFile: "",
            wordList: "",
            BSSID: "",
            ESSID: "",
            keyFile: "",
            characters: "",
            MACAddress: "",
            PMKID: "",
            customConfig: "",
            fakeHost: "",
        },
    });

    // Resets the form whenever the mode changes (from WEP to WPA or vice versa)
    useEffect(() => {
        form.reset();
    }, [selectedModeOption]);

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
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, handleProcessData, handleProcessTermination)}

                    {showAlert && (
                        <Alert title="Warning: Potential Risks" color="red">
                            This tool is used to crack wifi passwords, use with caution and only on networks you own or have explicit permission to test.
                        </Alert>
                    )}

                    {!showAlert && (
                        <Button onClick={handleShowAlert}>Show Alert</Button>
                    )}

                    <NativeSelect
                        value={selectedModeOption}
                        onChange={(e) => setSelectedModeOption(e.target.value)}
                        data={types}
                        required
                        label={"WEP or WPA-PSK"}
                    />
                    {isWEP && (
                        <Switch
                            size="md"
                            label="Advanced Mode"
                            checked={advanceMode}
                            onChange={(e) => {
                                const isChecked = e.currentTarget.checked;
                                setAdvanceMode(isChecked);
                                if (!isChecked) {
                                    setSelectedCharacter("Default"); // Reset character selection when turning off Advanced Mode
                                }
                            }}
                        />
                    )}
                    {isWPA && (
                        <TextInput
                            label={"Wordlist(s) filename(s) (Please supply file path and filename)"}
                            required
                            {...form.getInputProps("wordList")}
                        />
                    )}
                    {isWEP && (
                        <TextInput
                            label={"Set AP MAC address (BSSID)"}
                            placeholder={"eg: xx:xx:xx:xx:xx:xx"}
                            {...form.getInputProps("BSSID")}
                        />
                    )}
                    {isWPA && <TextInput label={"Set AP identifier"} {...form.getInputProps("ESSID")} />}
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
                    {advanceMode && isWEP && (
                        <NativeSelect
                            value={selectedcharacter}
                            onChange={(e) => setSelectedCharacter(e.target.value)}
                            data={characters}
                            label={"Alpha-numeric or binary-coded decimal or default"}
                        />
                    )}
                    {customMode && <TextInput label={"Custom Configuration"} {...form.getInputProps("customConfig")} />}
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type={"submit"}>Start {title}</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};
export default AircrackNG;