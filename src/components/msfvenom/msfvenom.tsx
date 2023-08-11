import { Button, LoadingOverlay, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Payload Generator (msfvenom)";
const description_userguide =
    "Msfvenom is a payload generator and encoder that comes with the Metasploit Framework. " +
    "It allows you to create various types of payloads for exploitation. " +
    "Select the architecture, payload, and other options, then click Generate to create the payload.";

interface FormValuesType {
    lhost: string;
    lport: string;
    rhost: string;
    user: string;
    pass: string;
    message: string;
    outputPath: string;
}

const architectures = ["windows/x86", "windows/x64", "linux/x86", "Mac/x64", "Android ARM"];
const payloadOptions = [
    [
        "windows/meterpreter/reverse_tcp",
        "windows/shell_reverse_tcp",
        "windows/exec",
        "windows/adduser",
        "windows/messagebox",
    ],
    [
        "windows/x64/meterpreter/reverse_tcp",
        "windows/x64/shell_reverse_tcp",
        "windows/x64/exec",
        "windows/x64/adduser",
        "windows/x64/persistence",
    ],
    [
        "linux/x86/meterpreter/reverse_tcp",
        "linux/x86/shell_bind_tcp",
        "linux/x86/exec",
        "linux/x86/shell_find_tag",
        "linux/x86/say",
    ],
    ["osx/x64/meterpreter/reverse_https", "osx/x64/shell_bind_tcp", "osx/x64/exec", "osx/x64/say", "osx/x64/open_url"],
    [
        "android/meterpreter/reverse_http",
        "android/shell_reverse_tcp",
        "android/exec",
        "android/shell_dos",
        "android/shell_hide",
    ],
];

const payloadFormats = ["exe", "elf", "raw", "psh", "asp", "aspx", "jsp", "war", "jar"];

const payloadRequiredVariables = [
    // windows x86 payload variables
    [
        ["LHOST", "LPORT"],
        ["LHOST", "LPORT"],
        [], // No additional variables
        ["USER", "PASS"],
        [], // No additional variables
    ],
    //windows x64 payload variables
    [
        ["LHOST", "LPORT"],
        ["LHOST", "LPORT"],
        [], // No additional variables
        ["USER", "PASS"],
        ["LHOST", "LPORT"],
    ],
    //linux x86 payload variables
    [
        ["LHOST", "LPORT"],
        ["LPORT"],
        [], // No additional variables
        ["LHOST", "LPORT"],
        ["MESSAGE"],
    ],
    //MAC x64 payload variables
    [
        ["LHOST", "LPORT"],
        ["LPORT"],
        [], // No additional variables
        ["MESSAGE"],
        ["URL"],
    ],
    //Android ARM payload variables
    [
        ["LHOST", "LPORT"],
        ["LHOST", "LPORT"],
        [], // No additional variables
        ["LHOST", "LPORT"],
        [], // No additional variables
    ],
];

const PayloadGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [selectedArchitecture, setSelectedArchitecture] = useState("");
    const [selectedPayload, setSelectedPayload] = useState("");
    const [selectedFormat, setSelectedFormat] = useState("");

    const form = useForm<FormValuesType>({
        initialValues: {
            lhost: "",
            lport: "",
            rhost: "",
            user: "",
            pass: "",
            message: "",
            outputPath: "",
        },
    });

    const onSubmit = async () => {
        setLoading(true);
        const args = ["-p", selectedPayload];

        if (form.values.lhost) {
            args.push(`LHOST=${form.values.lhost}`);
        }

        if (form.values.lport) {
            args.push(`LPORT=${form.values.lport}`);
        }

        if (form.values.rhost) {
            args.push(`RHOST=${form.values.rhost}`);
        }

        if (form.values.user) {
            args.push(`USER=${form.values.user}`);
        }

        if (form.values.pass) {
            args.push(`PASS=${form.values.pass}`);
        }

        if (form.values.message) {
            args.push(`MESSAGE=${form.values.message}`);
        }

        args.push("-f", selectedFormat, "-o", form.values.outputPath);

        try {
            const output = await CommandHelper.runCommand("msfvenom", args);
            setOutput(output);
        } catch (e: any) {
            setOutput(e);
        }

        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    const architectureIndex = architectures.indexOf(selectedArchitecture);
    const payloadIndex = payloadOptions[architectureIndex].indexOf(selectedPayload);
    const requiredVariables = payloadRequiredVariables[architectureIndex][payloadIndex] || [];

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <LoadingOverlay visible={loading} />
            <Stack>
                <div>
                    <h2>{title}</h2>
                    <p>{description_userguide}</p>
                </div>
                <NativeSelect
                    value={selectedArchitecture}
                    onChange={(e) => {
                        setSelectedArchitecture(e.target.value);
                        setSelectedPayload("");
                    }}
                    title="Select Architecture"
                    data={architectures}
                    required
                    placeholder="Select Architecture"
                />
                <NativeSelect
                    value={selectedPayload}
                    onChange={(e) => setSelectedPayload(e.target.value)}
                    title="Select Payload"
                    data={payloadOptions[architectureIndex] || []}
                    required
                    placeholder="Select Payload"
                />
                {requiredVariables.includes("LHOST") && (
                    <TextInput label="LHOST" placeholder="Enter LHOST" {...form.getInputProps("lhost")} />
                )}
                {requiredVariables.includes("LPORT") && (
                    <TextInput label="LPORT" placeholder="Enter LPORT" {...form.getInputProps("lport")} />
                )}
                {requiredVariables.includes("RHOST") && (
                    <TextInput label="RHOST" placeholder="Enter RHOST" {...form.getInputProps("rhost")} />
                )}
                {requiredVariables.includes("USER") && (
                    <TextInput label="USER" placeholder="Enter USERNAME" {...form.getInputProps("user")} />
                )}
                {requiredVariables.includes("PASS") && (
                    <TextInput label="PASS" placeholder="Enter PASSWORD" {...form.getInputProps("pass")} />
                )}
                {requiredVariables.includes("MESSAGE") && (
                    <TextInput label="MESSAGE" placeholder="Enter MESSAGE" {...form.getInputProps("message")} />
                )}
                <NativeSelect
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    title="Select Format"
                    data={payloadFormats}
                    required
                    placeholder="Select Format"
                />
                <TextInput
                    label="Output Path"
                    placeholder="Enter output path/filename (no path defaults to src-tauri folder of DDT)"
                    {...form.getInputProps("outputPath")}
                />
                <Button type="submit">Generate</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default PayloadGenerator;
