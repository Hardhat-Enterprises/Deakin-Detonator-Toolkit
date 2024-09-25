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

const Hashcat = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [selectedModeOption, setSelectedModeOption] = useState("");
    const [selectedInputOption, setSelectedInputOption] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal

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
    const sourceLink = "https://www.kali.org/tools/hashcat/"; // Link to the source code
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["hashcat"]; // Contains the dependencies required by the component

    const inputTypeOptions = ["Hash Value", "File"];
    const attackModeOptions = ["Straight", "Brute-force", "Hybrid Wordlist + Mask"];

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

    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

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

    const handleCancel = () => {
        if (pid !== null) {
            const args = [`-15`, pid];
            CommandHelper.runCommand("kill", args);
        }
    };

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);

        const args = [`-m${values.hashAlgorithmCode}`];

        if (selectedModeOption === "Straight") {
            args.push("-a0");
        } else if (selectedModeOption === "Brute-force") {
            args.push("-a3");
        } else if (selectedModeOption === "Hybrid Wordlist + Mask") {
            args.push("-a6");
        }

        if (selectedInputOption === "Hash Value") {
            args.push(values.hashValue);
        } else if (selectedInputOption === "File") {
            args.push(values.hashFilePath);
        }

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

        if (values.additionalCommand) {
            args.push(values.additionalCommand);
        }

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "hashcat",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any) {
            setOutput(e.message);
            setAllowSave(true);
        }
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    const isPasswordFile = selectedModeOption === "Straight" || selectedModeOption === "Hybrid Wordlist + Mask";
    const isCharset = selectedModeOption === "Brute-force" || selectedModeOption === "Hybrid Wordlist + Mask";
    const isFile = selectedInputOption === "File";

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
