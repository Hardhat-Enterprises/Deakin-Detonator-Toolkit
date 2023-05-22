import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Dnsrecon";
const description_userguide =
    "Dnsrecon is a Python script that has an extensive list of functionalities. This tool is primarily used for " +
    "DNS enumeration and scanning, where for example, it may enumerate DNS records, SRV records, and hosts and " +
    "domains using google.\n\nFurther usages for the tool can be found at: https://www.kali.org/tools/dnsrecon/\n\n" +
    "Using Dnsrecon:\n" +
    "Step 1: Enter a Target Domain URL.\n" +
    "       Eg: https://www.deakin.edu.au\n\n" +
    "Step 2: Click Scan to commence Dnsrecon's operation.\n\n" +
    "Step 3: View the Output block below to view the results of the tools execution.";

interface FormValues {
    url: string;
}

export function Dnsrecon() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            url: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = ["-d", values.url];
        const output = await CommandHelper.runCommand("dnsrecon", args);

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
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
export default Dnsrecon;
