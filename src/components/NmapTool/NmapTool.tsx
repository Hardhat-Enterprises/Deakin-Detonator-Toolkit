import { Button, Center, NativeSelect, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Command } from "@tauri-apps/api/shell";
import { useState } from "react";

interface FormValuesType {
    ip: string;
    port: string;
    speed: string;
}

const speeds = ["T0", "T1", "T2", "T3", "T4", "T5"];

const NmapTool = () => {
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            ip: "",
            port: "",
            speed: "T3",
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        const args = `-s${values.speed} -p${values.port} ${values.ip}`;
        const command = new Command("nmap", args.split(" "));
        const handle = await command.execute();
        setOutput(handle.stdout);
    };

    return (
        <>
            <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                <Stack>
                    <Text>Network map scanning tool</Text>
                    <TextInput label={"IP or Hostname"} required {...form.getInputProps("ip")} />
                    <TextInput label={"Port"} {...form.getInputProps("port")} />
                    <NativeSelect
                        title={"Scan speed"}
                        data={speeds}
                        required
                        placeholder={"Pick a scan speed"}
                        description={
                            "Speed of the scan, refer: https://nmap.org/book/performance-timing-templates.html"
                        }
                        {...form.getInputProps("speed")}
                    />
                    <Button type={"submit"}>Scan</Button>
                </Stack>
            </form>

            <Text>{output}</Text>
        </>
    );
};

export default NmapTool;
