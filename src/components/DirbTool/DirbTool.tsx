import { Button, Checkbox, LoadingOverlay, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Dirb";
const description_userguide =
    "Dirb is a Web Content Scanner that acts to seek out any existing or hidden Web Objects. " +
    "This is a dictionary-based attack that takes place upon a web server and will analyse the " +
    "results within this process.\n\nHow to use Dirb:\n\nStep 1: Enter a valid URL.\n" +
    "       E.g. https://www.deakin.edu.au\n\nStep 2: Enter a file directory pathway to access " +
    "a wordlist\n       E.g. home/wordlist/wordlist.txt\n\nStep 3: Click Scan to commence " +
    "the Dirb operation.\n\nStep 4: View the Output block below to view the results of the tool's execution.";

interface FormValues {
    url: string;
    wordlistPath: string;
    caseInsensitive: boolean;
    printLocation: boolean;
    ignoreHttpCode: number;
}

export function DirbTool() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [checkedAdvanced, setCheckedAdvanced] = useState(false);

    let form = useForm({
        initialValues: {
            url: "",
            wordlistPath: "",
            caseInsensitive: false,
            printLocation: false,
            ignoreHttpCode: 0,
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = [values.url, values.wordlistPath];

        if (values.caseInsensitive) {
            args.push(`-S ${values.caseInsensitive}`);
        }

        if (values.printLocation) {
            args.push(`-s ${values.printLocation}`);
        }

        if (values.ignoreHttpCode) {
            args.push(`-t ${values.ignoreHttpCode}`);
        }

        try {
            const output = await CommandHelper.runCommand("dirb", args);
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
                {UserGuide(title, description_userguide)}
                <Switch
                    size="md"
                    label="Advanced Mode"
                    checked={checkedAdvanced}
                    onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                />
                <TextInput label={"URL"} required {...form.getInputProps("url")} />
                <TextInput label={"Path to wordlist"} required {...form.getInputProps("wordlistPath")} />
                {checkedAdvanced && (
                    <>
                        <Checkbox label={"Use case-insensitive search"} {...form.getInputProps("caseInsensitive")} />
                        <Checkbox
                            label={"Print 'Location' header when found"}
                            {...form.getInputProps("printLocation")}
                        />
                        <TextInput
                            label={"Ignore responses with this HTTP code"}
                            type="number"
                            {...form.getInputProps("ignoreHttpCode")}
                        />
                        <Button type={"submit"}>Scan</Button>
                        <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                    </>
                )}
            </Stack>
        </form>
    );
}
