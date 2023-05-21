import React, { useCallback, useState } from "react";
import { Button, LoadingOverlay, Stack, Select, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { CommandHelper } from "../../utils/CommandHelper";

interface FormValues {
    payloadType: string;
    lhost: string;
    lport: string;
    outputFile: string;
}

const payloadTypes = [
    { label: "Windows Meterpreter Reverse TCP", value: "windows/meterpreter/reverse_tcp" },
    { label: "Linux Shell Reverse TCP", value: "linux/x86/shell_reverse_tcp" },
    { label: "Android Meterpreter Reverse TCP", value: "android/meterpreter/reverse_tcp" },
    { label: "PHP Meterpreter Reverse TCP", value: "php/meterpreter_reverse_tcp" },
];

export function Msfvenom() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const form = useForm<FormValues>({
        initialValues: {
            payloadType: "",
            lhost: "",
            lport: "",
            outputFile: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = [
            "/home/blank/Desktop/Deakin-Detonator-Toolkit/src-tauri/exploits/msfvenom.py",
            values.payloadType,
            values.lhost,
            values.lport,
            values.outputFile,
        ];

        const output = await CommandHelper.runCommand("python3", args);

        setOutput(output);
        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    const handlePayloadTypeChange = (value: string) => {
        form.setFieldValue("payloadType", value);
    };

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <LoadingOverlay visible={loading} />
            <Stack>
                <Title>Msfvenom Payload Generator</Title>
                <Select
                    label="Payload Type"
                    required
                    value={form.values.payloadType}
                    onChange={handlePayloadTypeChange}
                    data={payloadTypes}
                />
                <TextInput label="LHOST" required {...form.getInputProps("lhost")} />
                <TextInput label="LPORT" required {...form.getInputProps("lport")} />
                <TextInput
                    label="Output File"
                    required
                    {...form.getInputProps("outputFile")}
                    defaultValue="/path/to/output/file"
                />
                <Button type="submit">Generate Payload</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}

export default Msfvenom;
