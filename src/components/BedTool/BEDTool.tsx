import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

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
                <Title>BEDTool</Title>
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
