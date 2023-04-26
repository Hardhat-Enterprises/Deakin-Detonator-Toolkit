import { Button, LoadingOverlay, Stack, TextInput, Title, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { IconAlertCircle } from "@tabler/icons";
interface FormValues {
    ip: string;
}

const SMGGhostScanner = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            ip: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = [`/usr/share/ddt/SMGGhostScanner.py`, values.ip];
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
                <Title>SMGGhost Scanner</Title>
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    radius="md"
                    children={
                        "Please turn off the firewall on target system, otherwise the detect packet might be dropped. "
                    }
                ></Alert>
                <TextInput label={"Target IP address"} required {...form.getInputProps("ip")} />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default SMGGhostScanner;
