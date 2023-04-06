import { Button, LoadingOverlay, NumberInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValues {
    url : string
}

const Parsero = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues:{
            url:"",
        },


    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = [`-u`,values.url];
        const output = await CommandHelper.runCommand("parsero", args);

        setOutput(output);
        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);


    return(
        <form onSubmit={form.onSubmit(onSubmit)}>
        <LoadingOverlay visible={loading} />
        <Stack>
            <Title>parsero</Title>
            <TextInput label={"url"} required {...form.getInputProps("url")} />
            <Button type={"submit"}>Start parsero</Button>
            <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
        </Stack>
    </form>
    )

}
export default Parsero;