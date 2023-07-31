import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Cewl";
const description_userguide =
    "The tool Cewl, renown for being a Custom Word List Generator, is a ruby app which spiders given URLs to " +
    "a specified depth to return a list of words that are able to be used within password crackers including " +
    " JohnTheRipper (which can be found within the DDT). This tool is particularly useful for security testing and " +
    "forensic investigation.\n\nOptions for the tool can be found at:  https://www.kali.org/tools/cewl/#:~:text=CeWL" +
    "%20(Custom%20Word%20List%20generator,\nCeWL%20can%20follow%20external%20links.\n\n" +
    "Using Cewl\n" +
    "Step 1: Enter the Maximum depth to spider to.\n" +
    "       Eg: 2\n\n" +
    "Step 2: Enter a Minimum word length.\n" +
    "       Eg: 3\n\n" +
    "Step 3: Enter a Target URL.\n" +
    "       Eg: google.com\n\n" +
    "Step 4: Click Scan to commence Cewl's operation.\n\n" +
    "Step 5: View the Output block below to view the results of the tools execution.";

interface FormValuesType {
    depth: string;
    minLength: string;
    url: string;
}

const Cewl = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            depth: "",
            minLength: "",
            url: "",
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);

        const args = [`-d ${values.depth}`];
        args.push(`-m ${values.minLength}`);
        args.push(values.url);

        try {
            const output = await CommandHelper.runCommand("cewl", args);
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
                <TextInput label={"Max depth"} placeholder={"Example: 2"} required {...form.getInputProps("depth")} />
                <TextInput
                    label={"minimum word length"}
                    placeholder={"Example: 5"}
                    required
                    {...form.getInputProps("minLength")}
                />
                <TextInput label={"Target URL"} required {...form.getInputProps("url")} />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Cewl;
