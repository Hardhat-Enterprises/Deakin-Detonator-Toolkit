import { Button, LoadingOverlay, NumberInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = " SnmpCheck ";
const description_userguide =
    "This tool allows you to perform SNMP checks on a specified IP or hostname and port. Enter the IP or hostname and port number, then click the 'Scan' button to initiate the scan.";

interface FormValues {
    ip: string;
    port: number;
}

const SnmpCheck = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            ip: "",
            port: 161,
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = [values.ip, "-p", `${values.port}`];
        const output = await CommandHelper.runCommand("snmp-check", args);

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
                <TextInput label={"IP or Hostname"} required {...form.getInputProps("ip")} />
                <NumberInput label={"Port"} {...form.getInputProps("port")} />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default SnmpCheck;
