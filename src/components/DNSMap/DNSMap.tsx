import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValuesType {
    domain: string;
    delay: number;
}

const DNSMap = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            domain: "",
            delay: 10,
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = [`${values.domain}`, "-d", `${values.delay}`];

        try {
            const output = await CommandHelper.runCommand("dnsmap", args);
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
                <Title>DNS Mapping for Subdomains (DNSMap)</Title>
                <TextInput label={"Domain"} required {...form.getInputProps("domain")} />
                <TextInput
                    label={"Random delay between requests (default 10)(milliseconds)"}
                    type="number"
                    {...form.getInputProps("threads")}
                />
                <Button type={"submit"}>Start Mapping</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default DNSMap;
