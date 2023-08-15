import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";

const title = "Shodan API Tool";
const description_userguide =
    "The Shodan API is a powerful tool that allows external network scans to be performed with " +
    "use of a valid API key. This key is obtained through account creation within Shodan; see the " +
    "below link to create an account:\n\nShodan Account Creation: " +
    "https://developer.shodan.io/api/requirements\n\nHow to use Shodan API:\n\n" +
    "Step 1: Enter a Valid API Key - Note; See above for account creation to " +
    "receive API Key.\n       E.g. PLACEHOLDER\n\nStep 2: Enter a Host IP.\n       " +
    "E.g. 127.0.0.1\n\n" +
    "Step 3: Click Scan to commence the Shodan API operation.\n\n" +
    "Step 4: View the Output block below to view the results of the tool's execution.";

interface FormValues {
    hostIP: string;
    shodanKey: string;
}

export function ShodanAPITool() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            hostIP: "",
            shodanKey: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = ["./exploits/shodkey.py", "-i", values.hostIP, "-k", values.shodanKey];
        const output = await CommandHelper.runCommand("python3", args);

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
                <TextInput label={"Valid API Key"} required {...form.getInputProps("shodanKey")} />
                <TextInput label={"Host IP"} required {...form.getInputProps("hostIP")} />
                <Button type={"submit"}>Scan</Button>
                {SaveOutputToTextFile(output)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
