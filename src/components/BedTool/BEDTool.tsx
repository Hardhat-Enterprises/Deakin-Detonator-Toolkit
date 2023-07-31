import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "BEDTool";
const description_userguide =
    "BED is a tool created for checking daemons to identify any potential buffer overflows, format strings, " +
    "and other parameters.\n\nFurther information can be found at: https://www.kali.org/tools/bed/\n\n" +
    "Using BED:\n" +
    "Step 1: Enter a Plugin to be used for the scan.\n" +
    "       Eg: HTTP\n\n" +
    "Step 2: Enter a Target IP address.\n" +
    "       Eg: 192.168.0.1\n\n" +
    "Step 3: Enter a Port to connect to.\n" +
    "       Eg: 80\n\n" +
    "Step 4: Enter a Timeout value.\n" +
    "       Eg: 5\n\n" +
    "Step 5: Click Scan to commence BED's operation.\n\n" +
    "Step 6: View the Output block below to view the results of the tools execution.";

interface FormValues {
    plugin: string;
    target: string;
    port: string;
    timeout: string;
}

export function BEDTool() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            plugin: "",
            target: "",
            port: "",
            timeout: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = ["-s", values.plugin, "-t", values.target, "-p", values.port, "-o", values.timeout];
        const output = await CommandHelper.runCommand("bed", args);

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
                    label={"plugin Ex: FTP/SMTP/POP/HTTP/IRC/IMAP/PJL/LPD/FINGER/SOCKS4/SOCKS5"}
                    required
                    {...form.getInputProps("plugin")}
                />
                <TextInput
                    label={"Target -> Host to check (default: localhost)"}
                    required
                    {...form.getInputProps("target")}
                />
                <TextInput
                    label={"port -> Port to connect to (default: standard port)"}
                    required
                    {...form.getInputProps("port")}
                />
                <TextInput
                    label={"Timeout -> seconds to wait after each test (default: 2 seconds)"}
                    required
                    {...form.getInputProps("timeout")}
                />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
export default BEDTool;
