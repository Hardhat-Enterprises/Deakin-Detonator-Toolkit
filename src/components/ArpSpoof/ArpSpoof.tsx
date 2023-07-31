import { Button, Stack, TextInput, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "ARP Spoofing Tool";
const description_userguide =
    "ARP Spoofing is a Man in the Middle attack where an interception can be made on the communication between " +
    "devices on a network. The tool will send out forged ARP responses to the IP addresses of at least two devices, " +
    "where the devices will connect to the attackers MAC address due to confusion on the router and workstation. " +
    "These devices will further communicate with the attacker whilst being unknowing that an attack has even taken " +
    "place. \n\nFurther information can be found at: https://www.kali.org/tools/dsniff/#arpspoof\n\n" +
    "Using ARP Spoofing Tool:\n" +
    "Step 1: Enter the IP address of the 1st target.\n" +
    "       Eg: 192.168.1.1\n\n" +
    "Step 2: Enter the IP address of the 2nd target.\n" +
    "       Eg: 127.0.0.1\n\n" +
    "Step 3: Click Spoof to commence ARP Spoofing's operation.\n\n" +
    "Step 4: View the Output block below to view the results of the tools execution.";

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
                {UserGuide(title, description_userguide)}
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
