import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Arjuntool";
const description_userguide =
    "Dirb is a Web Content Scanner that acts to seek out any existing or hidden Web Objects. " +
    "This is a dictionary-based attack that takes place upon a web server and will analyse the " +
    "results within this process.\n\nHow to use Dirb:\n\nStep 1: Enter a valid URL.\n" +
    "       E.g. https://www.deakin.edu.au\n\nStep 2: Enter a file directory pathway to access " +
    "a wordlist\n       E.g. home/wordlist/wordlist.txt\n\nStep 3: Click Scan to commence " +
    "the Dirb operation.\n\nStep 4: View the Output block below to view the results of the tool's execution.";

interface FormValues {
    url: string;
    oJ: string;
}

export function Arjuntool() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            url: "",
            oJ: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = ["-u", values.url, "-oJ", values.oJ];
        const output = await CommandHelper.runCommand("arjun", args);

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
                <title>Arjuntool</title>
                <TextInput label={"URL"} required {...form.getInputProps("url")} />
                <TextInput
                    label={"Please enter the parameters as -oT/-oJ/-oB/-d/-t"}
                    required
                    {...form.getInputProps("oJ")}
                />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}

export default Arjuntool;
