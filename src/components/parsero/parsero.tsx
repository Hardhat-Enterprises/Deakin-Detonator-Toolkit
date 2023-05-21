import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Parsero";
const description =
    "Parsero is a free script written in Python which reads the Robots.txt file of a web server and looks at the Disallow entries." +
    "The Disallow entries tell the search engines what directories or files hosted on a web server mustn’t be indexed. " +
    "\n\nParsero Reference Guide: https://www.kali.org/tools/parsero/ \n\n" +
    "How to use Parsero:\n\n" +
    "Step 1: Enter an URL.\n" +
    "       E.g. www.google.com\n\n" +
    "Step 2: Click Start Parsero" +
    "\n\n Step 3 : View Results";
interface FormValues {
    url: string;
}

const Parsero = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    let form = useForm({
        initialValues: {
            url: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = [`-u`, values.url];
        const output = await CommandHelper.runCommand("parsero", args);

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
                {UserGuide(title, description)}
                <TextInput label={"url"} required {...form.getInputProps("url")} />
                <Button type={"submit"}>Start parsero</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};
export default Parsero;
