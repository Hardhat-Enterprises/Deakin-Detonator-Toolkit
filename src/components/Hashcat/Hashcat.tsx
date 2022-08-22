import {
    Button,
    LoadingOverlay,
    NativeSelect,
    NumberInput,
    Stack,
    TextInput,
    Title,
    MultiSelect,
    Grid,
    Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { Command } from "@tauri-apps/api/shell";

interface FormValuesType {
    attackMode: string;
    inputType: string;
    maskCharsets: string;
    hashAlgorithmCode: number;
    hashValue: string;
    hashFilePath: string;
    passwordFilePath: string;
}

const inputType = ["Hash Value", "File"];
const attackMode = ["Straight/Combination", "Brute-force", "Hybride Wordlist + Mask"];
const maskCharsets = [
    "Lowercase letters",
    "Uppercase letters",
    "Numbers",
    "Special charactors",
    "All charactors on keyboard",
];

const Hashcat = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [selectedModeOption, setSelectedModeOption] = useState("");
    const [selectedInputOption, setSelectedInputOption] = useState("");

    let form = useForm({
        initialValues: {
            attackMode: "Straight/Combination",
            inputType: "Hash Value",
            maskCharsets: "Uppercase letters",
            hashAlgorithmCode: 0,
            hashValue: "",
            hashFilePath: "",
            passwordFilePath: "",
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = [`-a 0 -m ${values.hashAlgorithmCode} ${values.hashValue} ${values.passwordFilePath}`];

        try {
            const output = await CommandHelper.runCommand("hashcat", args);
            setOutput(output);
        } catch (e: any) {
            setOutput(e);
        }

        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    const isPasswordFile =
        selectedModeOption === "Straight/Combination" || selectedModeOption === "Hybride Wordlist + Mask";
    const isCharset = selectedModeOption === "Brute-force" || selectedModeOption === "Hybride Wordlist + Mask";
    const isFile = selectedInputOption == "File";

    return (
        <form
            onSubmit={form.onSubmit((values) =>
                onSubmit({ ...values, attackMode: selectedModeOption, inputType: selectedInputOption })
            )}
        >
            <LoadingOverlay visible={loading} />
            <Stack>
                <Title> Hashcat </Title>
                <NativeSelect
                    value={selectedModeOption}
                    onChange={(e) => setSelectedModeOption(e.target.value)}
                    title={"Attack mode"}
                    data={attackMode}
                    required
                    placeholder={"Pick a attack mode"}
                    label={"Attack mode, refer: https://hashcat.net/wiki/doku.php?id=hashcat"}
                />
                <Grid>
                    <Grid.Col span={3}>
                        <NativeSelect
                            value={selectedInputOption}
                            onChange={(e) => setSelectedInputOption(e.target.value)}
                            label={"Input Hash Type"}
                            data={inputType}
                            required
                        />
                    </Grid.Col>
                    <Grid.Col span={9}>
                        <NumberInput
                            label={"Hash Algorithm, refer: https://hashcat.net/wiki/doku.php?id=hashcat"}
                            placeholder={"Enter the Hash Algorithm code"}
                            required
                            {...form.getInputProps("hashAlgorithmCode")}
                        />
                    </Grid.Col>
                </Grid>
                {!isFile && <TextInput label={"Input hash value"} required {...form.getInputProps("hashValue")} />}
                {isFile && (
                    <TextInput
                        label={"Input hash file path"}
                        placeholder={" Hash file(s) path"}
                        required
                        {...form.getInputProps("hashFilePath")}
                    />
                )}
                {isPasswordFile && (
                    <TextInput
                        label={"Input password file"}
                        placeholder={"The password file path"}
                        required
                        {...form.getInputProps("passwordFilePath")}
                    />
                )}
                {isCharset && (
                    <Grid>
                        <Grid.Col span={6}>
                            <TextInput
                                label={"Minimum password length"}
                                placeholder={"Start from 1"}
                                required
                                {...form.getInputProps("minPwdLen")}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label={"Maximum password length"}
                                placeholder={"Recommend not bigger than 9"}
                                required
                                {...form.getInputProps("maxPwdLen")}
                            />
                        </Grid.Col>
                    </Grid>
                )}
                {isCharset && (
                    <MultiSelect
                        title={"Charsets"}
                        data={maskCharsets}
                        required
                        label={"Pick charsets (multiselect), refer: https://hashcat.net/wiki/doku.php?id=hashcat"}
                        {...form.getInputProps("selectedCharsets")}
                    />
                )}

                <Button type={"submit"}>Crack</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Hashcat;
