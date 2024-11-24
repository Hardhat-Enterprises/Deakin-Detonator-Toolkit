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
import { FilePicker } from "../FileHandler/FilePicker"; // Importing the FilePicker component

// ... (rest of the code)

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
    const [hashFile, setHashFile] = useState<string | null>(null); // State for selected hash file
    const [passwordFile, setPasswordFile] = useState<string | null>(null); // State for selected password file

    // ... (rest of the code)

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
        } else if (selectedInputOption === "File" && hashFile) {
            args.push(hashFile); // Use the selected hash file
        }

        // Add password file path if required by the selected attack mode
        if (selectedModeOption === "Straight" && passwordFile) {
            args.push(passwordFile); // Use the selected password file
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
                    {isFile && (
                        <FilePicker
                            fileNames={hashFile ? [hashFile] : []}
                            setFileNames={(files) => setHashFile(files[0] || null)}
                            multiple={false}
                            componentName="Hashcat"
                            labelText="Hash File"
                            placeholderText="Click to select hash file"
                        />
                    )}
                    {isPasswordFile && (
                        <FilePicker
                            fileNames={passwordFile ? [passwordFile] : []}
                            setFileNames={(files) => setPasswordFile(files[0] || null)}
                            multiple={false}
                            componentName="Hashcat"
                            labelText="Password File"
                            placeholderText="Click to select password file"
                        />
                    )}
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
