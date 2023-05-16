import { Button, LoadingOverlay, NumberInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = " SnmpCheck ";
const description_userguide =
    "The SNMP Check tool enables you to perform SNMP (Simple Network Management Protocol) checks on a specific IP address or hostname and port. SNMP is a widely used protocol for managing and monitoring network devices." +
    "\n\nTo perform a scan, follow these steps: \n Enter the IP address or hostname of the target device in the 'IP or Hostname' field. \n Optionally, specify a custom port number in the 'Port' field (default port: 161). \n Click the 'Scan' button to initiate the SNMP check." +
    "The tool will establish a connection to the specified device and retrieve SNMP-related information, such as system details, interfaces, and performance metrics. The results will be displayed in the console below." +
    "Please note that SNMP checks require appropriate permissions and credentials. Ensure that you have the necessary access rights before performing a scan.";

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
