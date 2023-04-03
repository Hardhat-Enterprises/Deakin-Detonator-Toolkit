import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValuesType {
    domain: string;
    subdomains: string;
    threads: number;
}

const DnsenumTool = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            domain: "",
            subdomains: "",
            threads: 10,
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = [
            "--enum",
            "--threads",
            `${values.threads}`,
            `${values.domain}`,
            "-o",
            "dnsenum.txt",
        ];

        if (values.subdomains) {
            args.push(`-S ${values.subdomains}`);
        }

        try {
            const output = await CommandHelper.runCommand("dnsenum", args);
            setOutput(output);
        } catch (e: any) {
            setOutput(e);
        }

        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <LoadingOverlay visible={loading} />
            <Stack>
                <Title>DNS Enumeration (dnsenum)</Title>
                <TextInput label={"Domain"} required {...form.getInputProps("domain")} />
                <TextInput label={"Subdomains to include (comma-separated)"} {...form.getInputProps("subdomains")} />
                <TextInput label={"Threads"} type="number" min={1} {...form.getInputProps("threads")} />
                <Button type={"submit"}>Start Enumeration</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default DnsenumTool;
