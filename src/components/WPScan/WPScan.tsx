import { Button, Stack, TextInput, Switch, NativeSelect, NumberInput, Grid } from "@mantine/core";
import { useForm } from "@mantine/form";
import { RenderComponent } from "../UserGuide/UserGuide";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import InstallationModal from "../InstallationModal/InstallationModal";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";

/**
 * Represents the form values for the wpscan component.
 */
interface FormValuesType {
    url: string;
    lowBound: number;
    upBound: number;
    customEnum: string;
    verbose: boolean;
    output: string;
    format: string;
    passwords: string;
    usernames: string;
    stealthy: boolean;
    custom: string;
}

/**
 * The WPScan component.
 * @returns The WPScan component.
 */
const WPScan = () => {
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [checkedAdvanced, setCheckedAdvanced] = useState(false); // State variable to check if advanced mode is enabled.
    const [checkedCustom, setCheckedCustom] = useState(false); // State variable to check if custom mode is enabled.
    const [selectedEnumerationType, setselectedEnumerationType] = useState(""); // State variable to store selected enumeration type
    const [selectedDetectionMode, setSelectedDetectionMode] = useState(""); // State variable to store selected detection mode.
    const [selectedOutputFormat, setSelectedOutputFormat] = useState(""); // State variable to store selected output format.
    const [verboseChecked, setVerboseChecked] = useState(false); // State variable to check if verbose mode is enabled.
    const [stealthyChecked, setStealthyChecked] = useState(false); // State variable to check if verbose mode is enabled.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [loadingModal, setLoadingModal] = useState(true); // State variable that indicates if the modal is opened.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable to indicate loading state of the modal.
    const [allowSave, setAllowSave] = useState(false); // State variable to indicate if saving is allowed
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved

    // Component Constants.
    const title = "WPScan"; // Title of the component.
    const description = "WPScan scans remote WordPress installations to find security issues"; // Description of the component.
    const steps =
        "Step 1: Enter a WordPress URL.\n" +
        "Step 2: Enter any additional options for the scan.\n" +
        "Step 3: Enter any additional parameters for the scan.\n" +
        "Step 4: Click Scan to commence WPScan's operation.\n" +
        "Step 5: View the Output block below to view the results of the tool's execution.\n"; //Steps to run the component
    const sourceLink = "https://www.kali.org/tools/wpscan/"; // Link to the source code (or Kali Tools).
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["wpscan"]; // Contains the dependencies required by the component.
    const enumerationtypes = [
        "Vulnerable plugins",
        "All Plugins",
        "Popular Plugins",
        "Vulnerable themes",
        "All themes",
        "Popular themes",
        "Timthumbs",
        "Config Backups",
        "Db exports",
        "UID range",
        "MID range",
        "Custom",
    ]; // Contains types of enumeration available.
    const enumerationRequiringRange = ["UID range", "MID range"]; // Contains the enumeration types that requires specification of ranges.
    const detectionModes = ["mixed", "passive", "aggressive"]; // Contains detection modes available.
    const outputFormats = ["cli-no-colour", "cli-no-color", "json", "cli"]; // Contains the output formats available.

    // Form hook to handle form input.
    let form = useForm({
        initialValues: {
            url: "",
            lowBound: 0,
            upBound: 0,
            customEnum: "",
            verbose: false,
            output: "",
            format: "",
            stealthy: false,
            passwords: "",
            usernames: "",
            custom: "",
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

            // Allow Saving as the output is finalised
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    /**
     * handleSaveComplete: handle state changes when saves are completed
     * Once the output is saved, prevent duplicate saves
     */
    const handleSaveComplete = () => {
        //Disallow saving once the output is saved
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the wpscan tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the url, lowBound, upBound, customEnum, verbose, output, format, stealthy, passwords, usernames, custom
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Construct arguments for the wpscan command based on form input
        const args = [`--url`, values.url];
        if (selectedEnumerationType != "" && checkedAdvanced) {
            selectedEnumerationType === "Vulnerable plugins" ? args.push(`-e`, `vp`) : undefined;
            selectedEnumerationType === "All Plugins" ? args.push(`-e`, `ap`) : undefined;
            selectedEnumerationType === "Popular Plugins" ? args.push(`-e`, `p`) : undefined;
            selectedEnumerationType === "Vulnerable themes" ? args.push(`-e`, `vt`) : undefined;
            selectedEnumerationType === "All themes" ? args.push(`-e`, `at`) : undefined;
            selectedEnumerationType === "Popular themes" ? args.push(`-e`, `t`) : undefined;
            selectedEnumerationType === "Timthumbs" ? args.push(`-e`, `tt`) : undefined;
            selectedEnumerationType === "Config Backups" ? args.push(`-e`, `cb`) : undefined;
            selectedEnumerationType === "Db exports" ? args.push(`-e`, `dbe`) : undefined;
            selectedEnumerationType === "UID range"
                ? args.push(`-e`, `u${values.lowBound}-${values.upBound}`)
                : undefined;
            selectedEnumerationType === "MID range"
                ? args.push(`-e`, `m${values.lowBound}-${values.upBound}`)
                : undefined;
            selectedEnumerationType === "Custom" ? args.push(`-e`, `${values.customEnum}`) : undefined;
        }

        if (selectedDetectionMode) {
            args.push(`detection-mode`, `${selectedDetectionMode}`);
        }

        if (verboseChecked) {
            args.push(`-v`);
        }

        if (selectedOutputFormat) {
            args.push(`-f`, `${selectedOutputFormat}`);
        }
        if (stealthyChecked) {
            args.push(`--stealthy`);
        }

        if (values.passwords) {
            args.push(`--passwords`, `${values.passwords}`);
        }
        if (values.usernames) {
            args.push(`--usernames`, `${values.usernames}`);
        }
        if (values.output) {
            args.push(`-o`, `${values.output}`);
        }

        if (checkedCustom) {
            args.push(`${values.custom}`);
        }

        try {
            // Execute the wpscan command via helper method and handle its output or potential errors
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "wpscan",
                args,
                handleProcessData,
                handleProcessTermination
            );

            // Update the UI with the results from the executed command
            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any) {
            // Display any errors encountered during command execution
            setOutput(e.message);
            // Deactivate loading state
            setLoading(false);
        }
    };

    /**
     * Clears the output state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");

        //Disallow saving when output is cleared
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

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
            <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                {LoadingOverlayAndCancelButton(loading, pid)}
                <Stack>
                    <TextInput
                        label={"URL of target wordpress site"}
                        placeholder={"Example: http://www.wordpress.com/sample"}
                        required
                        {...form.getInputProps("url")}
                    />
                    <Switch
                        size="md"
                        label="Advanced Mode"
                        checked={checkedAdvanced}
                        onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                    />
                    {checkedAdvanced && (
                        <>
                            <Switch
                                size="md"
                                label="Stealthy"
                                checked={stealthyChecked}
                                onChange={(e) => setStealthyChecked(e.currentTarget.checked)}
                            />
                            <Switch
                                size="md"
                                label="Verbose"
                                checked={verboseChecked}
                                onChange={(e) => setVerboseChecked(e.currentTarget.checked)}
                            />
                            <NativeSelect
                                value={selectedEnumerationType}
                                onChange={(e) => setselectedEnumerationType(e.target.value)}
                                title={"Enumeration Options"}
                                data={enumerationtypes}
                                placeholder={"Types"}
                                description={"Please select an enumeration type"}
                            />
                            {enumerationRequiringRange.includes(selectedEnumerationType) && (
                                <>
                                    <Grid>
                                        <Grid.Col span={6}>
                                            <NumberInput
                                                label={"Lower Range"}
                                                placeholder={"e.g. 1"}
                                                {...form.getInputProps("lowbound")}
                                            />
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <NumberInput
                                                label={"Upper Range"}
                                                placeholder={"e.g. 5"}
                                                {...form.getInputProps("upbound")}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </>
                            )}
                            {selectedEnumerationType === "Custom" && (
                                <TextInput
                                    label={"Custom Enumeration"}
                                    placeholder={"e.g. vp ap u1-5"}
                                    {...form.getInputProps("customenum")}
                                />
                            )}
                            <NativeSelect
                                value={selectedDetectionMode}
                                onChange={(e) => setSelectedDetectionMode(e.target.value)}
                                title={"Detectionmode"}
                                data={detectionModes}
                                placeholder={"Detection Modes"}
                                description={"Please select a detection type"}
                            />
                            <TextInput
                                label={"Ouput to file"}
                                placeholder={"File Name"}
                                {...form.getInputProps("output")}
                            />
                            <NativeSelect
                                value={selectedOutputFormat}
                                onChange={(e) => setSelectedOutputFormat(e.target.value)}
                                title={"Output Format"}
                                data={outputFormats}
                                placeholder={"Output Format"}
                                description={"Please select an output format"}
                            />
                            <TextInput
                                label={" List of passwords to use during the password attack."}
                                placeholder={"Input Filepath"}
                                {...form.getInputProps("passwords")}
                            />
                            <TextInput
                                label={"List of usernames to use during the password attack."}
                                placeholder={"Input Filepath"}
                                {...form.getInputProps("usernames")}
                            />
                        </>
                    )}
                    <Switch
                        size="md"
                        label="Custom Mode"
                        checked={checkedCustom}
                        onChange={(e) => setCheckedCustom(e.currentTarget.checked)}
                    />
                    {checkedCustom && <TextInput label={"Custom Configuration"} {...form.getInputProps("custom")} />}

                    <Button type={"submit"}>Scan</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default WPScan;
