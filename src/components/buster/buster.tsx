import React, { useCallback, useState } from "react";
import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

export function Gobuster() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        url: "",
        wordlist: "",
        timeout: "10",
    });

    const runGobuster = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setOutput("Running Gobuster command...");

        const { url, wordlist, timeout } = formData;
        const command = `gobuster dir -u ${url} -w ${wordlist} -t ${timeout}`;

        try {
            setOutput(`Executing command: ${command}`);
            const response = await fetch("/run-gobuster", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ command }),
            });

            if (response.ok) {
                const stdout = await response.text();
                setOutput(stdout);
            } else {
                const errorMessage = await response.text();
                setOutput(`Error: ${errorMessage}`);
            }
        } catch (error) {
            let errorMessage = "An error occurred";
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === "string") {
                errorMessage = error;
            } else if (error && typeof error === "object") {
                errorMessage = JSON.stringify(error);
            }
            setOutput(`Error: ${errorMessage}`);
        }

        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setFormData({ url: "", wordlist: "", timeout: "10" });
    }, []);

    return (
        <form onSubmit={runGobuster}>
            <LoadingOverlay visible={loading} />
            <Stack>
                <Title>Gobuster</Title>
                <TextInput label="URL" required name="url" value={formData.url} onChange={handleChange} />
                <TextInput
                    label="Wordlist"
                    required
                    name="wordlist"
                    value={formData.wordlist}
                    onChange={handleChange}
                />
                <TextInput
                    label="Timeout (seconds)"
                    type="number"
                    min={1}
                    name="timeout"
                    value={formData.timeout}
                    onChange={handleChange}
                />
                <Button type="submit">Run</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}

export default Gobuster;
