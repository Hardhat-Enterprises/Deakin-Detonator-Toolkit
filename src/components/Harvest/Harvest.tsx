import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValues {
    domain: string;
    output: string;
}

export function Harvest() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            domain: "",
            output: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = [
            "/home/blank/Desktop/Deakin-Detonator-Toolkit/src-tauri/exploits/harvest.py",
            "-d",
            values.domain,
            "-o",
            values.output,
        ];
        const output = await CommandHelper.runCommand("python3", args);

        setOutput(output);
        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <LoadingOverlay visible={loading} />
            <Stack>
                <Title>Harvest</Title>
                <TextInput label={"Domain"} required {...form.getInputProps("domain")} />
                <TextInput label={"Output"} required {...form.getInputProps("output")} />
                <Button type={"submit"}>Run</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
export default Harvest;
