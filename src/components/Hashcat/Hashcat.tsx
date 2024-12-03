import { Button, LoadingOverlay, NativeSelect, NumberInput, Stack, TextInput, Grid } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile"; // Renaming the component for clarity

/**
 * Interface to define the structure of form values for Hashcat.
 */
interface FormValuesType {
    attackMode: string;
    inputType: string;
    maskCharsets: string;
    hashAlgorithmCode: number;
    hashValue: string;
    hashFilePath: string;
    passwordFilePath: string;
    additionalCommand: string;
    minPwdLen: number;
    maxPwdLen: number;
}

/**
 * Hashcat component.
 * A tool for brute-forcing passwords with Hashcat. It includes form inputs for various attack modes,
 * input types, and other configurations required to run Hashcat.
 */
const Hashcat = () => {
    const [loading, setLoading] = useState(false); // Tracks if a command is currently running
    const [output, setOutput] = useState(""); // Stores command-line output
    const [selectedModeOption, setSelectedModeOption] = useState(""); // Tracks selected attack mode
    const [selectedInputOption, setSelectedInputOption] = useState(""); // Tracks selected input type
    const [pid, setPid] = useState(""); // Tracks the process ID of the running command
    const [allowSave, setAllowSave] = useState(false); // Controls whether the output can be saved
    const [hasSaved, setHasSaved] = useState(false); // Tracks if the output has already been saved
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // Checks if Hashcat is installed
    const [opened, setOpened] = useState(!isCommandAvailable); // Controls visibility of installation modal
    const [loadingModal, setLoadingModal] = useState(true); // Tracks if the modal is in loading state

    // Component metadata for rendering
    const title = "Hashcat";
    const description =
        "Hashcat is an advanced password recovery tool that provides brute-force attacks that are conducted with the hash values of passwords that are either guessed or applied by the tool. DDT currently supports 3 attack modes including Straight, Brute-force, and Hybrid Wordlist + Mask.";
    const steps =
        "Step-by-Step Guide: \n" +
        "Step 1: Pick an attack mode. \n" +
        "Step 2: Input hash type and hash algorithm code. \n" +
        "Step 3: Input the hash value. \n" +
        "Step 4: Input the password file. \n" +
        "Step 5: Add additional commands as needed. \n" +
        "Step 6: Click Start " +
        title +
        " to commence. \n" +
        "Step 7: View the output below. \n";
    const sourceLink = "https://www.kali.org/tools/hashcat/"; // Link to Hashcat's official site
    const tutorial = "https://docs.google.com/document/d/1m6bucq0EDFT0UMkOvcTEmWby1TT_qbeL14ohW1JXkSg/edit?usp=sharing"; // Link to the official documentation/tutorial.
    const dependencies = ["hashcat"]; // Contains the dependencies required by the component

    // Options for attack mode and input type
    const inputTypeOptions = ["Hash Value", "File"];
    const attackModeOptions = ["Straight", "Brute-force", "Hybrid Wordlist + Mask"];

    // Initialize the form state with default values
    const form = useForm<FormValuesType>({
        initialValues: {
            attackMode: "",
            inputType: "",
            maskCharsets: "",
            hashAlgorithmCode: 0,
            hashValue: "",
            hashFilePath: "",
            passwordFilePath: "",
            additionalCommand: "",
            minPwdLen: 1,
            maxPwdLen: 1,
        },
    });

    /**
     * useEffect hook to check if Hashcat is installed on the system.
     * It updates the modal state and command availability status.
     */
    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable); // Set command availability state
                setOpened(!isAvailable); // Open modal if the command is not available
                setLoadingModal(false); // Set loading state for modal to false
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false); // Set loading state for modal to false on error
            });
    }, []);

    /**
     * Handles appending data to the output when new data arrives from the running command.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    /**
     * Handles the termination of the Hashcat process and updates the output accordingly.
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
            setPid(""); // Clear the process ID
            setLoading(false); // Set loading to false when the process finishes
            setAllowSave(true); // Enable save option
            setHasSaved(false); // Reset save status
        },
        [handleProcessData]
    );

    /**
     * Sends a signal to kill the running Hashcat process by its process ID.
     */
    const handleCancel = () => {
        if (pid !== null) {
            const args = [`-15`, pid];
            CommandHelper.runCommand("kill", args);
        }
    };

    /**
     * Submits the form and starts the Hashcat process with the provided options.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true); // Show loading overlay
        setAllowSave(false); // Disable saving while the process is running

        const args = [`-m${values.hashAlgorithmCode}`]; // Add hash algorithm code to the arguments

        // Add attack mode argument based on the selected option
        if (selectedModeOption === "Straight") {
            args.push("-a0");
        } else if (selectedModeOption === "Brute-force") {
            args.push("-a3");
        } else if (selectedModeOption === "Hybrid Wordlist + Mask") {
            args.push("-a6");
        }

        // Add input type argument based on the selected option
        if (selectedInputOption === "Hash Value") {
            args.push(values.hashValue);
        } else if (selectedInputOption === "File") {
            args.push(values.hashFilePath);
        }

        // Add password file path if required by the selected attack mode
        if (selectedModeOption === "Straight") {
            args.push(values.passwordFilePath);
        } else if (selectedModeOption === "Brute-force" || selectedModeOption === "Hybrid Wordlist + Mask") {
            args.push(
                "--increment",
                "--increment-min",
                `${values.minPwdLen}`,
                "--increment-max",
                `${values.maxPwdLen}`
            );
            if (values.maskCharsets) {
                args.push(values.maskCharsets);
            }
        }

        // Add any additional commands
        if (values.additionalCommand) {
            args.push(values.additionalCommand);
        }

        try {
            // Run the Hashcat command and capture the output and PID
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "hashcat",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(result.pid); // Set the process ID
            setOutput(result.output); // Set the initial output
        } catch (e: any) {
            setOutput(e.message); // Capture any errors
            setAllowSave(true); // Enable save option after error
        }
    };

    /**
     * Clears the console output.
     */
    const clearOutput = useCallback(() => {
        setOutput(""); // Clear the output
        setHasSaved(false); // Reset save status
        setAllowSave(false); // Disable save until new output is generated
    }, [setOutput]);

    // Determine if password file or charset inputs are needed based on the attack mode
    const isPasswordFile = selectedModeOption === "Straight" || selectedModeOption === "Hybrid Wordlist + Mask";
    const isCharset = selectedModeOption === "Brute-force" || selectedModeOption === "Hybrid Wordlist + Mask";
    const isFile = selectedInputOption === "File";

    /**
     * Handles the save completion event.
     */
    const handleSaveComplete = () => {
        setHasSaved(true); // Mark the output as saved
        setAllowSave(false); // Disable save button until new output is generated
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

            <form
                onSubmit={form.onSubmit((values) =>
                    onSubmit({ ...values, attackMode: selectedModeOption, inputType: selectedInputOption })
                )}
            >
                <LoadingOverlay visible={loading} />
                {loading && (
                    <div>
                        <Button variant="outline" color="red" style={{ zIndex: 1001 }} onClick={handleCancel}>
                            Cancel
                        </Button>
                    </div>
                )}

                <Grid>
                    <Grid.Col span={6}>
                        <NativeSelect
                            data={attackModeOptions}
                            label="Attack Mode"
                            placeholder="Pick one"
                            value={selectedModeOption}
                            onChange={(event) => setSelectedModeOption(event.currentTarget.value)}
                            required
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <NativeSelect
                            data={inputTypeOptions}
                            label="Input Type"
                            placeholder="Pick one"
                            value={selectedInputOption}
                            onChange={(event) => setSelectedInputOption(event.currentTarget.value)}
                            required
                        />
                    </Grid.Col>
                </Grid>

                <Stack>
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, handleProcessData, handleProcessTermination)}
                    <NumberInput label="Hash Algorithm Code" {...form.getInputProps("hashAlgorithmCode")} required />
                    {!isFile && <TextInput label="Hash Value" {...form.getInputProps("hashValue")} required />}
                    {isFile && <TextInput label="Hash File Path" {...form.getInputProps("hashFilePath")} required />}
                    {isPasswordFile && (
                        <TextInput label="Password File Path" {...form.getInputProps("passwordFilePath")} required />
                    )}
                    {isCharset && (
                        <>
                            <TextInput
                                label="Mask Charset"
                                placeholder="?l?d"
                                {...form.getInputProps("maskCharsets")}
                            />
                            <Grid>
                                <Grid.Col span={6}>
                                    <NumberInput
                                        label="Minimum Password Length"
                                        {...form.getInputProps("minPwdLen")}
                                        required
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <NumberInput
                                        label="Maximum Password Length"
                                        {...form.getInputProps("maxPwdLen")}
                                        required
                                    />
                                </Grid.Col>
                            </Grid>
                        </>
                    )}
                    <TextInput
                        label="Additional Commands"
                        placeholder="e.g. --force"
                        {...form.getInputProps("additionalCommand")}
                    />
                </Stack>

                <Button type="submit" mt="md">
                    Start {title}
                </Button>
                <Button mt="md" onClick={clearOutput}>
                    Clear Output
                </Button>

                <ConsoleWrapper output={output} />

                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
            </form>
        </RenderComponent>
    );
};

export default Hashcat;
