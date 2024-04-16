import { Button, NativeSelect, Select, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

// Component Constants
const title = "Aircrack-ng"; // Contains the title of the component.

// Contains the description of the component.
const description_userguide =
    "Aircrack-ng is a tool for cracking WEP and WPA/WPA2 passphrases using captured network traffic.\n\n" +
    "How to use Aircrack-ng:\n\n" +
    "Step 1: Type in the name of your packet capture file including the extension .cap. E.g. 'example.cap'.\n" +
    "Step 2: Type in the name of your password file including the extension. E.g 'password.txt'.\n" +
    "Step 3: Click 'Start Cracking' to begin the process.\n" +
    "Step 4: View the output block below to see the results.\n" +
    "Optionally you may select additional advanced options.";

/**
 * Represents the form values for the Aircrack-ng component.
 */
interface FormValuesType {
    capFile: string;
    wordlist: string;
    BSSID: string;
    ESSID: string;
    keyFile: string;
    securityType: string;
    characters: string;
    MACAddress: string;
    PMKID: string;
    customConfig: string;
}

const AircrackNG = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.

    // AirCrack-ng specific state variables.
    const [selectedtype, setSelectedType] = useState(""); // State variable to store the selected security type.
    const [AdvancedMode, setAdvancedMode] = useState(false); // State variable to store the selected mode.
    const [selectedcharacter, setSelectedCharacter] = useState(""); // State variable to store the selected character type.
    const [CustomConfig, setCustomConfig] = useState(false); // State variable to store the selected custom configuration.

    // Component Constants.
    const types = ["WPA", "WEP"]; // Security types supported by Aircrack-ng.
    const typesRequiringAdvancedWEPConfig = ["WEP"]; // Security types requiring advanced WEP configuration.
    const typesRequiringAdvancedWPAConfig = ["WPA"]; // Security types requiring advanced WPA configuration.
    const characters = ["Alpha-Numeric", "Binary Coded Decimal", "Default"]; // Character types supported by Aircrack-ng.

    // Form Hook to handle form input.
    const form = useForm({
        initialValues: {
            capFile: "",
            wordlist: "",
            BSSID: "",
            ESSID: "",
            keyFile: "",
            securityType: "",
            characters: "",
            MACAddress: "",
            PMKID: "",
            customConfig: "",
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

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the aircrack-ng tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the CAP file path and wordlist path.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Construct arguments for the aircrack-ng command based on form input
        const args = [values.capFile];

        values.wordlist ? args.push(`-w`, values.wordlist) : undefined;
        values.BSSID ? args.push(`-b`, values.BSSID) : undefined;
        values.ESSID ? args.push(`-e`, values.ESSID) : undefined;
        values.keyFile ? args.push(`-l`, values.keyFile) : undefined;

        if (selectedtype == "WEP") {
            selectedcharacter === "Alpha-Numeric" ? args.push(`-c`) : undefined;
            selectedcharacter === "Binary Coded Decimal" ? args.push(`-t`) : undefined;
            values.MACAddress ? args.push(`-m`, values.MACAddress) : undefined;
        } else {
            values.PMKID ? args.push(`-I`, values.PMKID) : undefined;
        }

        values.customConfig ? args.push(values.customConfig) : undefined;

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

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label={"CAP File Path"} required {...form.getInputProps("capFile")} />
                <TextInput label={"Path to worldlist"} {...form.getInputProps("wordlist")} />
                <Switch
                    size="md"
                    label="Advanced Mode"
                    checked={AdvancedMode}
                    onChange={(e) => setAdvancedMode(e.currentTarget.checked)}
                />
                <Switch
                    size="md"
                    label="Custom Configuration"
                    checked={CustomConfig}
                    onChange={(e) => setCustomConfig(e.currentTarget.checked)}
                />
                {AdvancedMode && (
                    <>
                        <TextInput label={"Access Point's MAC (BSSID)"} {...form.getInputProps("BSSID")} />
                        <TextInput label={"Network Identifier (ESSID)"} {...form.getInputProps("ESSID")} />
                        <TextInput label={"Key Output File"} {...form.getInputProps("keyFile")} />
                        <NativeSelect
                            value={selectedtype}
                            onChange={(e) => setSelectedType(e.target.value)}
                            title={"Security Type"}
                            data={types}
                            placeholder={"Security Type"}
                            description={"Please select the security type."}
                        />
                        {typesRequiringAdvancedWEPConfig.includes(selectedtype) && (
                            <>
                                <NativeSelect
                                    value={selectedcharacter}
                                    onChange={(e) => setSelectedCharacter(e.target.value)}
                                    title={"Characters"}
                                    data={characters}
                                    placeholder={"Characters"}
                                    description={"Please select the WiFi character types (if known)"}
                                />
                                <TextInput label={"MAC Address"} {...form.getInputProps("MACAddress")} />
                            </>
                        )}
                        {typesRequiringAdvancedWPAConfig.includes(selectedtype) && (
                            <>
                                <TextInput label={"PMKID"} {...form.getInputProps("PMKID")} />
                            </>
                        )}
                    </>
                )}
                {CustomConfig && <TextInput label={"Custom Configuration"} {...form.getInputProps("customConfig")} />}
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <Button type={"submit"}>Start Cracking</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default AircrackNG;
