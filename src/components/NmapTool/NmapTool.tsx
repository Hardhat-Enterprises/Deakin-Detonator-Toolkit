import { Button, LoadingOverlay, NativeSelect, NumberInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValuesType {
    ip: string;
    port: string;
    speed: string;
    scanOption: string;
    numTopPorts: number;
}

const speeds = ["T0", "T1", "T2", "T3", "T4", "T5"];

const scanOptions = [
    "All",
    "Operating System",
    "Firewall Status",
    "Services",
    "Stealth",
    "Device Discovery",
    "Top ports",
];

const NmapTool = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            ip: "",
            port: "",
            speed: "T3",
            scanOption: "All",
            numTopPorts: 100,
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = [`-${values.speed}`];

        if (values.port) {
            args.push(`-p ${values.port}`);
        }

        if (values.scanOption === "All") {
            args.push("-A");
        } else if (values.scanOption === "Operating System") {
            args.push("-O");
        } else if (values.scanOption === "Firewall Status") {
            args.push("-sA");
        } else if (values.scanOption === "Services") {
            args.push("-sV");
        } else if (values.scanOption === "Stealth") {
            args.push("-sN");
        } else if (values.scanOption === "Device Discovery") {
            args.push("-sn");
        } else if (values.scanOption === "Top ports") {
            args.push("--top-ports", `${values.numTopPorts}`);
        }

        args.push(values.ip);

        const output = await CommandHelper.runCommand("nmap", args);
        setOutput(output);

        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    // Determine if the current scan options are for the top ports.
    const isTopPortScan = form.values.scanOption === "Top ports";

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <LoadingOverlay visible={loading} />
            <Stack>
                <Title>Network port scanner (NMAP)</Title>
                <TextInput label={"IP or Hostname"} required {...form.getInputProps("ip")} />
                {!isTopPortScan && <TextInput label={"Port"} {...form.getInputProps("port")} />}
                {isTopPortScan && <NumberInput label={"Number of top ports"} {...form.getInputProps("numTopPorts")} />}
                <NativeSelect
                    title={"Scan speed"}
                    data={speeds}
                    required
                    placeholder={"Pick a scan speed"}
                    description={"Speed of the scan, refer: https://nmap.org/book/performance-timing-templates.html"}
                    {...form.getInputProps("speed")}
                />
                <NativeSelect
                    title={"Scan option"}
                    data={scanOptions}
                    required
                    placeholder={"Pick a scan option"}
                    description={"Type of scan to perform"}
                    {...form.getInputProps("scanOption")}
                />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default NmapTool;
