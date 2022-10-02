import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValues {
    ipAddress: string;
    argumentMain: string;
    paramMain: string;
    argumentAlt: string;
    paramAlt: string;
}

const Enum4Linux = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            ipAddress: "",
            argumentMain: "",
            paramMain: "",
            argumentAlt: "",
            paramAlt: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        let temp = "-";
        const options = temp + values.argumentMain;
        let args = [];
        if (values.argumentAlt != "") {
            const options2 = temp + values.argumentAlt;
            args = [options, values.paramMain, options2, values.paramAlt, values.ipAddress];
        } else {
            args = [options, values.paramMain, values.ipAddress];
        }

        const result = await CommandHelper.runCommand("enum4linux", args);

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
                <Title>Enum4Linux</Title>
                <TextInput label={"IP Address of Target"} required {...form.getInputProps("ipAddress")} />
                <TextInput label={"Option"} required {...form.getInputProps("argumentMain")} />
                <TextInput label={"Parameters"} {...form.getInputProps("paramMain")} />
                <TextInput label={"Additional Options"} {...form.getInputProps("argumentAlt")} />
                <TextInput label={"Additional Options Parameters"} {...form.getInputProps("paramAlt")} />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Enum4Linux;
