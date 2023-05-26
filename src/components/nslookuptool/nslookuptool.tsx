import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "NSLookUP tool";
const description_userguide =
"The nslookup command is a tool used to query Domain Name System (DNS) servers and retrieve information about a specific domain or IP address." +
"This command is an essential tool for network administrators and system engineers as it can be used to troubleshoot DNS issues and gather information about DNS configurations." +
"How to use NSLookUp.\n\n" +
"Step 1: Enter an IP or Web URL.\n" +
"       E.g. 127.0.0.1\n\n" +
"Step 2: View the Output block below to view the results of the Scan.";

interface FormValues {
    ipaddress: string;
}

const NSLookupTool = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            ipaddress: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = ["-s", values.ipaddress];
        const output = await CommandHelper.runCommand("nslookup", args);

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
                <TextInput
                    label={"Please enter the IP Address for nslookup"}
                    required
                    {...form.getInputProps("ipaddress")}
                />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
export default NSLookupTool
