import { Button, LoadingOverlay, Stack, TextInput, Switch, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Nbtscan Tool";
const description_userguide =
    "Nbtscan is a command-line tool designed to scan for NetBIOS information on a network. " +
    "It can help identify devices, workgroups, and NetBIOS names on a network, providing valuable " +
    "information for network reconnaissance and security assessments. Nbtscan is particularly useful " +
    "for identifying legacy systems and applications that rely on NetBIOS. The tool is easy to use " +
    "and supports scanning for multiple IP addresses or IP address ranges.\n\nMore information on how " +
    "to use nbtscan, along with usage examples, can be found in its official documentation: " +
    "https://www.kali.org/tools/nbtscan/\n\n" +
    "Using Nbtscan Tool:\n" +
    "Step 1: Enter a Target Subnet to scan.\n" +
    "       Eg: 192.168.1.0/24\n\n" +
    "Step 2: Click Scan Subnet to commence the Nbtscan tools operation.\n\n" +
    "Step 3: View the Output block below to view the results of the tools execution.\n\n" +
    "Switch to Advanced Mode for further options.";

//list of input values collected by the form
interface FormValuesType {
    subnet: string;
    dumpPacket: boolean;
    scanRange: string;
    timeout: number;
    bandwidth: string;
    retransmits: number;
}

//sets the state of the tool; loading or not, what the output is
const NbtscanTool = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [checkedAdvanced, setCheckedAdvanced] = useState(false);

    let form = useForm({
        initialValues: {
            subnet: "",
            dumpPacket: false,
            scanRange: "",
            timeout: 1000,
            bandwidth: "",
            retransmits: 0,
        },
    });

    //sets the loading state to True, provides arguments for the tool
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = [`${values.subnet}`];

        if (values.dumpPacket) {
            args.push(`-d`);
        }

        if (values.scanRange) {
            args.push(`<scan_range> ${values.scanRange}`);
        }

        if (values.timeout) {
            args.push(`-t ${values.timeout}`);
        }

        if (values.bandwidth) {
            args.push(`-b ${values.bandwidth}`);
        }

        if (values.retransmits) {
            args.push(`-m ${values.retransmits}`);
        }

        try {
            const output = await CommandHelper.runCommand("nbtscan", args);
            setOutput(output);
        } catch (e: any) {
            setOutput(e);
        }

        setLoading(false);
    };

    //clears output without completely refreshing the tool
    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    //define user interface of the tool
    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <Switch
                    size="md"
                    label="Advanced Mode"
                    checked={checkedAdvanced}
                    onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                />
                <TextInput label={"Subnet"} required {...form.getInputProps("subnet")} />
                {checkedAdvanced && (
                    <>
                        <Checkbox
                            label={"Dump Packets Mode"}
                            {...form.getInputProps("dumpPackets" as keyof FormValuesType)}
                        />
                        <TextInput
                            label={"Range to Scan"}
                            placeholder={"Format of xxx.xxx.xxx.xxx/xx or xxx.xxx.xxx.xxx-xxx."}
                            {...form.getInputProps("scanRange")}
                        />
                        <TextInput
                            label={"Timeout Delay"}
                            placeholder={"in milliseconds; default is 1000"}
                            {...form.getInputProps("timeout")}
                        />
                        <TextInput
                            label={"Bandwidth"}
                            placeholder={"Kilobytes per second; default is 128"}
                            {...form.getInputProps("bandwidth")}
                        />
                        <TextInput
                            label={"Retransmits"}
                            placeholder={"number; default is 0"}
                            {...form.getInputProps("retransmits")}
                        />
                    </>
                )}
                <Button type={"submit"}>Scan Subnet</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default NbtscanTool;
