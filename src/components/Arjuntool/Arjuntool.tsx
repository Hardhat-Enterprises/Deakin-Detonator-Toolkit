import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Arjun";
const description_userguide =
    "Arjun is a command-line tool specifically designed to look for hidden HTTP parameters. " +
    "Arjun will try to discover parameters and give you new set of endpoints to test on. " +
    "It is a multi-threaded application, can handle rate limits and supports GET,POST,XML and JSON methods. " +
    " \n\nKali's Arjun Information Page: https://www.kali.org/tools/arjun/ \n\nHow to use Arjun:\n\nStep 1: Enter a valid URL.\n" +
    "       E.g. https://www.deakin.edu.au\n\nStep 2: Enter an Optional Json Output filename.\n        E.g. arjunoutput " +
    "\n\nStep 3: Click the scan option to commence scan. " +
    "\n\nStep 4: View the Output block below to view the results of the tool's execution.";

interface FormValues {
    url: string;
    output_filename: string;
}

export function Arjuntool() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            url: "",
            output_filename: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = ["-u", values.url];

        if (values.output_filename) {
            args.push("-o", values.output_filename);
        }

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
                {UserGuide(title, description_userguide)}
                <TextInput label={"URL"} required {...form.getInputProps("url")} />
                <TextInput
                    label={"Optional Json output file: provide file name if required"}
                    {...form.getInputProps("o")}
                />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}

export default Arjuntool;
