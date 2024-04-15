import { Button, NativeSelect, Select, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

// Component Constants
const title = "WEP/WPA Cracking with Aircrack-ng"; // Contains the title of the component.

// Contains the description of the component.
const description_userguide =
    "Aircrack-ng is a tool for cracking WEP and WPA/WPA2 passphrases using captured network traffic.\n\n" +
    "How to use Aircrack-ng:\n\n"
    "Step 1: Type in the name of your packet capture file including the extension .cap. E.g. 'example.cap'.\n";
    "Step 2: Type in the name of your password file including the extension. E.g 'password.txt'.\n" +
    "Step 3: Click 'Start Cracking' to begin the process.\n" +
    "Step 4: View the output block below to see the results.\n" +
    "Optionally you may select additinoal advanced options.";

interface FormValuesType {
    capFile: string;
    wordlist: string;
    BSSID: string;
    ESSID: string;
    keyFile: string;
    securitytype: string;
    characters: string;
    MACAddress: string;
    PMKID: string;
    customconfig: string;
}

const AircrackNG = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [selectedtype, setSelectedType] = useState("");
    const [AdvancedMode, setAdvancedMode] = useState(false);
    const [selectedcharacter, setSelectedCharacter] = useState("");
    const [CustomConfig, setCustomConfig] = useState(false);

    const types = ["WPA", "WEP"];
    const typesRequiringAdvancedWEPConfig = ["WEP"];
    const typesRequiringAdvancedWPAConfig = ["WPA"];
    const characters = ["Alpha-Numeric", "Binary Coded Decimal", "Default"];

    const form = useForm({
        initialValues: {
            capFile: "",
            wordlist: "",
            BSSID: "",
            ESSID: "",
            keyFile: "",
            securitytype: "",
            characters: "",
            MACAddress: "",
            PMKID: "",
            customconfig: "",
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

        values.customconfig ? args.push(values.customconfig) : undefined;

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
                <TextInput label={"CAP File Path"} required {...form.getInputProps("capFile")} />
                <TextInput label={"Path to worldlist"} {...form.getInputProps("wordlist")} />

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
                            placeholder={"security type"}
                            description={"Please select the security type"}
                        />
                        {typesRequiringAdvancedWEPConfig.includes(selectedtype) && (
                            <>
                                <NativeSelect
                                    value={selectedcharacter}
                                    onChange={(e) => setSelectedCharacter(e.target.value)}
                                    title={"Characters"}
                                    data={characters}
                                    placeholder={"characters"}
                                    description={"Please select the wifi chracter types (if known)"}
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
                {CustomConfig && <TextInput label={"Custom Configuration"} {...form.getInputProps("customconfig")} />}

                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <Button type={"submit"}>Start Cracking</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default AircrackNG;
