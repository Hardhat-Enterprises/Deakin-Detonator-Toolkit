import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";

interface FormValues {
    filepath: string;
    directory: string;
    timeout: string;
}

export function Eyewitness() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            filepath: "",
            directory: "",
            timeout: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = [`-f`, `${values.filepath}`];

        args.push(`--web`);

        args.push(`-d`, `${values.directory}`);

        args.push(`--timeout`, `${values.timeout}`);

        args.push(`--no-prompt`);

        const output = await CommandHelper.runCommand("eyewitness", args);

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
                <Title>Eyewitness</Title>
                <TextInput
                    label={"Enter the file name or path containing URLs:"}
                    placeholder={"Example: /home/kali/Desktop/filename"}
                    required
                    {...form.getInputProps("filepath")}
                />
                <TextInput
                    label={"Enter the directory name where you want to save screenshots or define path of directory:"}
                    placeholder={"Example: /home/kali/Directory name"}
                    required
                    {...form.getInputProps("directory")}
                />
                <TextInput label={"Enter the timeout time"} required {...form.getInputProps("timeout")} />
                <Button type={"submit"}>Scan</Button>
                {SaveOutputToTextFile(output)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
export default Eyewitness;
