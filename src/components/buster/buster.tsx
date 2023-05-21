import React, { useCallback, useState } from "react";
import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { CommandHelper } from "../../utils/CommandHelper";

interface FormValues {
    url: string;
    wordlist: string;
    timeout: number;
    outputPath: string;
}

export function Gobuster() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const form = useForm<FormValues>({
        initialValues: {
            url: "",
            wordlist: "",
            timeout: 10,
            outputPath: "",
        },
    });

    const onSubmit = useCallback(async () => {
        setLoading(true);
        setOutput("Running Gobuster command...");

        const { url, wordlist, timeout, outputPath } = form.values;

        try {
            const args = ["gobuster", "dir", "-u", url, "-w", wordlist, "-t", timeout.toString(), "-o", outputPath];
            const output = await CommandHelper.runCommand("python3", args);
            setOutput(output);
        } catch (error) {
            setOutput(`Error: ${(error as Error).message}`);
        }

        setLoading(false);
    }, [form.values]);

    const clearOutput = useCallback(() => {
        setOutput("");
        form.reset();
    }, [form]);

    return (
        <form onSubmit={onSubmit}>
            <LoadingOverlay visible={loading} />
            <Stack spacing="md">
                <Title>Gobuster</Title>
                <TextInput label="URL" required {...form.getInputProps("url")} />
                <TextInput label="Wordlist" required {...form.getInputProps("wordlist")} />
                <TextInput label="Timeout (seconds)" type="number" min={1} {...form.getInputProps("timeout")} />
                <TextInput label="Output Path" required {...form.getInputProps("outputPath")} />
                <Button type="submit">Run Gobuster</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}

export default Gobuster;
