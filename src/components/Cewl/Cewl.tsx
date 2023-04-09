import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValuesType {
    depth: string;
    minLength: string;
    url: string;
}

const Cewl = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            depth: "",
            minLength: "",
            url: "",
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);

        const args = [`-d ${values.depth}`];
        args.push(`-m ${values.minLength}`);
        args.push(values.url);

        try {
            const output = await CommandHelper.runCommand("cewl", args);
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
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <LoadingOverlay visible={loading} />
            <Stack>
                <Title>cewl</Title>
                <TextInput label={"Max depth"} placeholder={"Example: 2"} required {...form.getInputProps("depth")} />
                <TextInput label={"minimum word length"} placeholder={"Example: 5"} required {...form.getInputProps("minLength")} />
                <TextInput label={"Target URL"} required {...form.getInputProps("url")} />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Cewl;
