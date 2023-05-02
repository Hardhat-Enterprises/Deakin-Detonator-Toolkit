import { Button, LoadingOverlay, Stack, TextInput, Title, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { IconAlertCircle } from "@tabler/icons";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "SNMP Enumeration Tool";
const description_userguide =
    "SMG-Ghost Scanner is a tool used to scan a target to see if they are vulnerable to the attack vector\n" +
    "CVE2020-0796. This vulnerability fell within Microsoft's SMB 3.1.1 protocol stack implementation where\n" +
    "due to the failure of handling particular requests and response messages, an attacker could perform\n" +
    "remote code execution to act as the systems user. \n\nUsing the tool: \nStep 1: Enter a Target IP address." +
    "\n               Eg: 192.168.1.1 \n\nStep 2:Click scan to commence SMG-Ghost Scanners operation.\n\n" +
    "Step 3: View the Output block below to view the results of the tools execution.";

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
                {UserGuide(title, description_userguide)}
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
