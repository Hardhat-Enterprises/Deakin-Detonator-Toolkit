import React, { useState } from 'react';
import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Nikto";
const description_userguide =
    "Nikto is a powerful web server scanner that can perform comprehensive tests against web servers for multiple items.\n" +
    "How to use this Nikto tool:\n" +
    "- Provide the target URL or IP address to scan.\n" +
    "- Start the scan to gather information about potential vulnerabilities and misconfigurations.\n" +
    "- Review the scan output to identify any security issues.\n";

interface FormValuesType {
    TargetURL: string;
}

const Nikto = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    let form = useForm({
        initialValues: {
            TargetURL: "",
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);

        try {
            const args = ['-h', values.TargetURL];
            const commandOutput = await CommandHelper.runCommand("nikto", args);
            setOutput(commandOutput);
        } catch (error: any) {
            setOutput(`Error: ${error.message}`);
        } finally {
            setLoading(false);
            setAllowSave(true);
        }
    };

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    const clearOutput = () => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    };

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label="Target URL" required {...form.getInputProps("TargetURL")} />
                <Button type="submit" disabled={loading}>Start Nikto Scan</Button>
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Nikto;
