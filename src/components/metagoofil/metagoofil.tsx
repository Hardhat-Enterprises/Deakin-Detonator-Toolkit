import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValues {
    webname: string;
    searchmax: string;
    filelimit: string;
    filetype: string;
}

export function Metagoofil() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            webname: "",
            searchmax: "",
            filelimit: "",
            filetype: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = ['-d', values.webname, '-l', values.searchmax, '-n', values.filelimit, '-t', values.filetype];
        const output = await CommandHelper.runCommand("metagoofil", args);

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
                <Title>Metagoofil</Title>
                <TextInput label={"Enter the website for search"} required {...form.getInputProps("webname")} />
                <TextInput label={"Enter number of results (default 100)"} required {...form.getInputProps("searchmax")} />
                <TextInput label={"Enter the value for Download file limit)"} required {...form.getInputProps("filelimit")} />
                <TextInput label={"Enter your file type"} required {...form.getInputProps("filetype")} />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};
export default Metagoofil
