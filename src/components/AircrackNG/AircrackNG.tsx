import { Button, NativeSelect, Stack, TextInput, Switch } from "@mantine/core";
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
    // securityType: string;
    // New channel: string;
    // New replayInterface: string;
    // New
}

// Component Constants
const title = "Aircrack-ng"; // Contains the title of the component.
const description = "Aircrack-ng is a tool for cracking WEP and WPA/WPA2 passphrases using captured network traffic.";
const steps =
    "How to use Aircrack-ng:\n\n" +
    "Step 1: Type in the path to wordlist(s) filename(s) including the extension .txt. e.g. 'example.txt'.\n" +
    "For files containing hexadecimal values, you must put a “h:” in front of the file name.\n";
"Step 2: Select the target network based on the access point's MAC address.\n" +
    "Step 3: Type in the name of your text file including the extension .txt. e.g. 'example.txt'.\n" +
    "Step 4: Click 'Start " +
    title +
    "' to begin the process.\n" +
    "Step 5: View the output block below to see the results.\n" +
    "Optionally you may select additional advanced options.";
const sourceLink = "https://www.kali.org/tools/aircrack-ng/"; //link to the source component.
const tutorial = "";
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

    // AirCrack-ng specific state variables.
    const [selectedtype, setSelectedType] = useState(""); // State variable to store the selected security type.
    //const [AdvancedMode, setAdvancedMode] = useState(false); // State variable to store the selected mode.
    const [selectedcharacter, setSelectedCharacter] = useState(""); // State variable to store the selected character type.
    const [CustomConfig, setCustomConfig] = useState(false); // State variable to store the selected custom configuration.

    // Component Constants.
    const types = ["WEP", "WPA"]; // Security types supported by Aircrack-ng.
    //const typesRequiringAdvancedWEPConfig = ["WEP"]; // Security types requiring advanced WEP configuration.
    //const typesRequiringAdvancedWPAConfig = ["WPA"]; // Security types requiring advanced WPA configuration.
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
            MACAddress: "",
            PMKID: "",
            customConfig: "",
            fakeHost: "",
            // securityType: "",
            // New channel: "",
            // New replayInterface: "",
            // New
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
        //if (selectedtype == "WEP") {
        //if (values.securityType) args.push(`-a 1`, values.securityType);
        if (values.BSSID) args.push(`-b`, values.BSSID);

        // Advanced WEP options
        if (selectedcharacter === "Alpha-Numeric") args.push(`-c`);
        if (selectedcharacter === "Binary Coded Decimal") args.push(`-t`);
        if (values.MACAddress) args.push(`-m`, values.MACAddress);
        //}

        // WPA-specific options
        //if (selectedtype == "WPA") {
        //if (values.securityType) args.push(`-a 2`, values.securityType);
        if (values.wordList) args.push(`-w`, values.wordList);
        if (values.ESSID) args.push(`-e`, values.ESSID);

        // Advanced WPA options
        //if (values.PMKID) args.push(`-I`, values.PMKID);
        //}

        // Custom Configuration section
        //if (values.customConfig) args.push(values.customConfig);

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
