import { Button, LoadingOverlay, NativeSelect, NumberInput, Stack, TextInput, Grid, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Hashcat";
const description_userguide =
    "Hashcat is an advanced password recovery tool that provides brute-force " +
    "attacks that are conducted with the hash values of passwords that are either " +
    "guessed or applied by the tool. DDT currently supports 3 " +
    "attack modes including Straight, Brute-force and Hybrid Wordlist + Mask.\n\n" +
    "A list of the Hashing Algorithm codes can be found at: https://hashcat.net/hashcat\n\n" +
    "How to use Hashcat:\n\n" +
    "Step 1: Pick an attack mode\n" +
    "       E.g. Straight\n\n" +
    "Step 2: Input hash type and hash algorithm code\n" +
    "       E.g. Hash Value, 2\n\n" +
    "Step 3: Input the hash value\n" +
    "       E.g. ae71a4222ef1893879b442f14c40c370\n\n" +
    "Step 4: Input password file.\n" +
    "        E.g. /root/pwd.txt\n\n" +
    "Step 5: Add additional commands as required, refer to weblink above.\n" +
    "       E.g. --force\n\n" +
    "Step 6: Click Scan to commence the Hashcat operation.\n\n" +
    "Step 7: View the Output block below to view the results";

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

const inputType = ["Hash Value", "File"];
const attackMode = ["Straight", "Brute-force", "Hybride Wordlist + Mask"];

const Hashcat = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [selectedModeOption, setSelectedModeOption] = useState("");
    const [selectedInputOption, setSelectedInputOption] = useState("");

    let form = useForm({
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

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = [`-m${values.hashAlgorithmCode}`];
        if (selectedModeOption === "Straight") {
            args.push(`-a0`);
        } else if (selectedModeOption === "Brute-force") {
            args.push(`-a3`);
        } else if (selectedModeOption === "Hybride Wordlist + Mask") {
            args.push(`-a6`);
        }
        if (selectedInputOption === "Hash Value") {
            args.push(`${values.hashValue}`);
        } else if (selectedInputOption === "File") {
            args.push(`${values.hashFilePath}`);
        }
        if (selectedModeOption === "Straight") {
            args.push(`${values.passwordFilePath}`);
        } else if (selectedModeOption === "Brute-force") {
            args.push(`--increment`);
            args.push(
                `--increment`,
                `--increment-min`,
                `${values.minPwdLen}`,
                `--increment-max`,
                `${values.maxPwdLen}`
            );
            if (values.maskCharsets) {
                args.push(`${values.maskCharsets}`);
            }
        } else if (selectedModeOption === "Hybride Wordlist + Mask") {
            args.push(`${values.passwordFilePath}`);
            args.push(
                `--increment`,
                `--increment-min`,
                `${values.minPwdLen}`,
                `--increment-max`,
                `${values.maxPwdLen}`
            );
            if (values.maskCharsets) {
                args.push(`${values.maskCharsets}`);
            }
        }
        if (values.additionalCommand) {
            args.push(`${values.additionalCommand}`);
        }

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

    const isPasswordFile = selectedModeOption === "Straight" || selectedModeOption === "Hybride Wordlist + Mask";
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
                {UserGuide(title, description_userguide)}
                <NativeSelect
                    value={selectedModeOption}
                    onChange={(e) => setSelectedModeOption(e.target.value)}
                    title={"Attack mode"}
                    data={attackMode}
                    required
                    placeholder={"Pick a attack mode"}
                    label={"Attack mode, refer: https://hashcat.net/hashcat"}
                />
                <Grid>
                    <Grid.Col span={3}>
                        <NativeSelect
                            value={selectedInputOption}
                            onChange={(e) => setSelectedInputOption(e.target.value)}
                            label={"Input Hash Type"}
                            data={inputType}
                            required
                            placeholder={"Input type"}
                        />
                    </Grid.Col>
                    <Grid.Col span={9}>
                        <NumberInput
                            label={"Hash Algorithm, refer: https://hashcat.net/hashcat"}
                            placeholder={"Enter the Hash Algorithm code"}
                            required
                            {...form.getInputProps("hashAlgorithmCode")}
                        />
                    </Grid.Col>
                </Grid>
                {!isFile && (
                    <TextInput
                        label={"Input hash value"}
                        placeholder={"eg:ae71a4222ef1893879b442f14c40c370"}
                        required
                        {...form.getInputProps("hashValue")}
                    />
                )}
                {isFile && (
                    <TextInput
                        label={"Input hash file path"}
                        placeholder={" eg: /root/hash.txt"}
                        required
                        {...form.getInputProps("hashFilePath")}
                    />
                )}
                {isPasswordFile && (
                    <TextInput
                        label={"Input password file"}
                        placeholder={"eg: /root/pwd.txt"}
                        required
                        {...form.getInputProps("passwordFilePath")}
                    />
                )}
                {isCharset && (
                    <Grid>
                        <Grid.Col span={6}>
                            <NumberInput
                                label={"Minimum password length"}
                                placeholder={"Start from 1"}
                                required
                                {...form.getInputProps("minPwdLen")}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label={"Maximum password length"}
                                placeholder={"Recommend not bigger than 8"}
                                required
                                {...form.getInputProps("maxPwdLen")}
                            />
                        </Grid.Col>
                    </Grid>
                )}
                {isCharset && (
                    <TextInput
                        label={"Mask Charsets, refer: https://hashcat.net/hashcat"}
                        placeholder={"eg: ?d?d?d?d"}
                        {...form.getInputProps("maskCharsets")}
                    />
                )}
                <TextInput
                    label={"Additional command, refer: https://hashcat.net/hashcat"}
                    placeholder={"eg: --force"}
                    {...form.getInputProps("additionalCommand")}
                />
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    radius="md"
                    children={
                        "Please try with additional command '--force', otherwise you have to download OpenCL for hashcat. "
                    }
                ></Alert>
                <Button type={"submit"}>Crack</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Hashcat;
