import { Button, Stack, TextInput, Title, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";

interface FormValues {
    ip1: string;
    ip2: string;
}

const ARPSpoofing = () => {
    const [isSpoofing, setIsSpoofing] = useState(false);
    const [pid, setPid] = useState("");

    let form = useForm({
        initialValues: {
            ip1: "",
            ip2: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        const args = [`-t`, values.ip1, `-r`, values.ip2];
        const handle = await CommandHelper.getCommandHandle("arpspoof", args);
        setPid(handle.pid.toString());
        setIsSpoofing(true);
    };
    const close = async () => {
        const args = [`-2`, pid];
        await CommandHelper.runCommand("kill", args);
        setIsSpoofing(false);
    };

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <Stack>
                <Title>ARP Spoofing tool</Title>
                <TextInput label={"Target one IP address"} required {...form.getInputProps("ip1")} />
                <TextInput label={"Target two IP address"} required {...form.getInputProps("ip2")} />
                {!isSpoofing && <Button type={"submit"}>Spoof</Button>}
                {isSpoofing && (
                    <Alert
                        radius="md"
                        children={"ARP spoofing between " + form.values.ip1 + " and " + form.values.ip2 + "..."}
                    ></Alert>
                )}
                {isSpoofing && <Button onClick={close}>Stop</Button>}
            </Stack>
        </form>
    );
};

export default ARPSpoofing;
