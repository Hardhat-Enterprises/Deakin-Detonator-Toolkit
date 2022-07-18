import { Button, Center, Code, LoadingOverlay, NativeSelect, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Prism } from "@mantine/prism";
import { IconScan } from "@tabler/icons";
import { Command } from "@tauri-apps/api/shell";
import { useState } from "react";

interface FormValuesType {
    ip: string;
    port: string;
    speed: string;
}

const speeds = ["T0", "T1", "T2", "T3", "T4", "T5"];

const NmapTool = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            ip: "",
            port: "",
            speed: "T3",
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = [values.speed];

        if (values.port) {
            args.push(`-p ${values.port}`);
        }

        args.push(values.ip);

        const command = new Command("nmap", args);
        const handle = await command.execute();

        setLoading(false);
        setOutput(handle.stdout);
    };

    const getConsoleOutputElement = () => {
        const clearOutput = () => {
            setOutput("");
        };

        if (output) {
            return (
                <>
                    <Title>Output</Title>
                    <Prism language={"bash"}>{output}</Prism>
                    <Button color={"red"} onClick={clearOutput}>
                        Clear output
                    </Button>
                </>
            );
        }
    };

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <LoadingOverlay visible={loading} />
            <Stack>
                <Title>Network port scanner (NMAP)</Title>
                <TextInput label={"IP or Hostname"} required {...form.getInputProps("ip")} />
                <TextInput label={"Port"} {...form.getInputProps("port")} />
                <NativeSelect
                    title={"Scan speed"}
                    data={speeds}
                    required
                    placeholder={"Pick a scan speed"}
                    description={"Speed of the scan, refer: https://nmap.org/book/performance-timing-templates.html"}
                    {...form.getInputProps("speed")}
                />
                <Button type={"submit"}>Scan</Button>
                {getConsoleOutputElement()}
            </Stack>
        </form>
    );
};

export default NmapTool;
