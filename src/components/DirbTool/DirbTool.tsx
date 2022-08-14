import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValues {
    url: string;
    wordlistPath: string;
}

export function DirbTool() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            url: "",
            wordlistPath: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = [values.url, values.wordlistPath];
        const output = await CommandHelper.runCommand("dirb", args);

        setOutput(output);
        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <LoadingOverlay visible={loading} />
            <Stack>
                <Title>Dirb</Title>
                <TextInput label={"URL"} required {...form.getInputProps("url")} />
                <TextInput label={"Path to wordlist"} required {...form.getInputProps("wordlistPath")} />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
