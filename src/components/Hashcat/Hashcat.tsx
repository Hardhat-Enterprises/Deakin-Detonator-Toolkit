import { Button, LoadingOverlay, NativeSelect, NumberInput, Stack, TextInput, Grid } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
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

const title = "Hashcat";
const description_userguide = `
    Hashcat is an advanced password recovery tool that provides brute-force attacks that are conducted with the hash values of passwords that are either guessed or applied by the tool. DDT currently supports 3 attack modes including Straight, Brute-force, and Hybrid Wordlist + Mask.

    Step-by-Step Guide:
    1. Pick an attack mode.
    2. Input hash type and hash algorithm code.
    3. Input the hash value.
    4. Input the password file.
    5. Add additional commands as needed.
    6. Click Scan to commence.
    7. View the output below.
`;

const inputTypeOptions = ["Hash Value", "File"];
const attackModeOptions = ["Straight", "Brute-force", "Hybrid Wordlist + Mask"];

const Hashcat = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [selectedModeOption, setSelectedModeOption] = useState("");
    const [selectedInputOption, setSelectedInputOption] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

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
        if (pid) {
            const args = ["-15", pid];
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
    }, []);

    const isPasswordFile = selectedModeOption === "Straight" || selectedModeOption === "Hybrid Wordlist + Mask";
    const isCharset = selectedModeOption === "Brute-force" || selectedModeOption === "Hybrid Wordlist + Mask";
    const isFile = selectedInputOption === "File";

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    return (
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
                <NumberInput label="Hash Algorithm Code" {...form.getInputProps("hashAlgorithmCode")} required />
                {!isFile && <TextInput label="Hash Value" {...form.getInputProps("hashValue")} required />}
                {isFile && <TextInput label="Hash File Path" {...form.getInputProps("hashFilePath")} required />}
                {isPasswordFile && (
                    <TextInput label="Password File Path" {...form.getInputProps("passwordFilePath")} required />
                )}
                {isCharset && (
                    <>
                        <TextInput label="Mask Charset" placeholder="?l?d" {...form.getInputProps("maskCharsets")} />
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
                Scan
            </Button>
            <Button mt="md" onClick={clearOutput}>
                Clear Output
            </Button>

            <ConsoleWrapper output={output} />

            {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
        </form>
    );
};

export default Hashcat;
