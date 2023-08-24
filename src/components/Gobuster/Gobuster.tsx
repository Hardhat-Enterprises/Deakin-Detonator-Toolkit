import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "GoBuster Directory and File Brute-Forcing Tool";
const description_userguide =
    "GoBuster is a tool used for directory and file brute-forcing on web servers. It can be used to discover hidden directories and files on a web server by trying different combinations of URLs. You can find more information about the tool, including usage instructions and examples, in its official documentation: https://github.com/OJ/gobuster";

interface FormValuesType {
    url: string;
    wordlist: string;
    outputFile: string;
}

const GoBusterTool = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            url: "",
            wordlist: "",
            outputFile: "gobuster-results.txt",
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = ["dir", "-u", values.url, "-w", values.wordlist, `-o ${values.outputFile}`];

        try {
            const output = await CommandHelper.runCommand("gobuster", args);
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
                {UserGuide(title, description_userguide)}
                <TextInput label={"Target URL"} required {...form.getInputProps("url")} />
                <TextInput label={"Wordlist File"} required {...form.getInputProps("wordlist")} />
                <TextInput label={"Output File (optional)"} {...form.getInputProps("outputFile")} />
                <Button type={"submit"}>Start Brute-Forcing</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default GoBusterTool;
