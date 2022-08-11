import { Button, LoadingOverlay, NumberInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValues {
    pathToBinary: string;
    count: number;
}

const FindOffset = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            pathToBinary: "",
            count: 200,
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = ["/usr/share/ddt/find_offset.py", values.pathToBinary, "--count", values.count.toString()];
        const result = await CommandHelper.runCommand("python3", args);

        setOutput(result);
        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <LoadingOverlay visible={loading} />
            <Stack>
                <Title>Find offset</Title>
                <TextInput label={"Path to binary"} required {...form.getInputProps("pathToBinary")} />
                <NumberInput label={"Number of chars to send"} {...form.getInputProps("count")} />
                <Button type={"submit"}>Find offset</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default FindOffset;
