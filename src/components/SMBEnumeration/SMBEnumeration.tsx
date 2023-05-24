import { Button, LoadingOverlay, NativeSelect, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

import { UserGuide } from "../UserGuide/UserGuide";

const title = "SMB Enumeration";
const description_userguide =
    "SMB (Server Message Block) represents a network protocol widely used to " +
    "provide shared access across files, printers, and serial ports within a network. " +
    "This tool acts to enumerate an SMB server in order for potential vulnerabilities " +
    "or misconfigurations tobe identified. \n\n" +
    "How to use SMB Enumeration:\n\n" +
    "Step 1: Enter an IP or Hostname.\n" +
    "       E.g. 127.0.0.1\n\n" +
    "Step 2: Enter a port number\n" +
    "       E.g. 445\n\n" +
    "Step 3: Pick a scan speed -Note; Higher speeds require a faster host network.\n" +
    "T0 -Paranoid / T1 -Sneaky / T2 -Polite / T3 -Normal / T4 -Aggressive / T5 -Insane\n" +
    "       E.g. T3\n\n" +
    "Step 4: Select an SMB Enumeration Script to run against the target\n" +
    "       E.g smb-flood.nse";
"\n\nStep 5: Click Scan to commence the SMB Enumeration operation.\n\n" +
    "Step 6: View the Output block below to view the results of the Scan.";

interface FormValuesType {
    ip: string;
    port: string;
    speed: string;
    scripts: string;
}

const speeds = ["T0", "T1", "T2", "T3", "T4", "T5"];

const scripts = [
    "smb2-capabilities.nse",
    "smb2-security-mode.nse",
    "smb2-time.nse",
    "smb2-vuln-uptime.nse",
    "smb-brute.nse",
    "smb-double-pulsar-backdoor.nse",
    "smb-enum-domains.nse",
    "smb-enum-groups.nse",
    "smb-enum-processes.nse",
    "smb-enum-services.nse",
    "smb-enum-sessions.nse",
    "smb-enum-shares.nse",
    "smb-enum-users.nse",
    "smb-flood.nse",
    "smb-ls.nse",
    "smb-mbenum.nse",
    "smb-os-discovery.nse",
    "smb-print-text.nse",
    "smb-protocols.nse",
    "smb-psexec.nse",
    "smb-security-mode.nse",
    "smb-server-stats.nse",
    "smb-system-info.nse",
    "smb-vuln-conficker.nse",
    "smb-vuln-cve2009-3103.nse",
    "smb-vuln-cve-2017-7494.nse",
    "smb-vuln-ms06-025.nse",
    "smb-vuln-ms07-029.nse",
    "smb-vuln-ms08-067.nse",
    "smb-vuln-ms10-054.nse",
    "smb-vuln-ms10-061.nse",
    "smb-vuln-ms17-010.nse",
    "smb-vuln-regsvc-dos.nse",
    "smb-vuln-webexec.nse",
    "smb-webexec-exploit.nse",
];

const SMBEnumeration = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [selectedSpeedOption, setSelectedSpeedOption] = useState("");
    const [selectedScriptOption, setSelectedScriptOption] = useState("");

    let form = useForm({
        initialValues: {
            ip: "",
            port: "",
            speed: "T3",
            script: "smb-enum-users",
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);

        const args = [`-${values.speed}`, `--script=${values.scripts}`];

        if (values.port) {
            args.push(`-p ${values.port}`);
        }

        args.push(values.ip);

        try {
            const output = await CommandHelper.runCommand("nmap", args);
            setOutput(output);
        } catch (e: any) {
            setOutput(e);
        }

        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form
            onSubmit={form.onSubmit((values) =>
                onSubmit({ ...values, speed: selectedSpeedOption, scripts: selectedScriptOption })
            )}
        >
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label={"Target IP or Hostname"} required {...form.getInputProps("ip")} />
                <TextInput label={"Port"} required {...form.getInputProps("port")} placeholder={"Example: 445"} />

                <NativeSelect
                    label={"Scan Speed"}
                    value={selectedSpeedOption}
                    onChange={(e) => setSelectedSpeedOption(e.target.value)}
                    title={"Scan speed"}
                    data={speeds}
                    placeholder={"Select a scan speed. Default set to T3"}
                    description={"Speed of the scan, refer: https://nmap.org/book/performance-timing-templates.html"}
                />

                <NativeSelect
                    label={"SMB Script"}
                    value={selectedScriptOption}
                    onChange={(e) => setSelectedScriptOption(e.target.value)}
                    title={"SMB Enumeration Script"}
                    data={scripts}
                    required
                    placeholder={"Select an SMB Enumeration Script to run against the target"}
                    description={"NSE Scripts, refer: https://nmap.org/nsedoc/scripts/"}
                />

                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default SMBEnumeration;
