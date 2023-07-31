import { Button, LoadingOverlay, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Urlsnarf";
const description_userguide =
    "Urlsnarf is a network traffic sniffing tool that works to output all URL's that are requested from HTTP " +
    "traffic in the from of CLF (Common Log Format) that is very commonly used within web servers. The tool " +
    "in the DDT provides two listener settings being through an interface or packet capture file.\n\nInformation " +
    "on the tool can be found at: https://linux.die.net/man/8/urlsnarf\n\n" +
    "Using the tool:\n" +
    "Step 1: Select the Listener settings.\n" +
    "       Eg: Interface\n\n" +
    "Step 2: Input the Interface.\n" +
    "       Eg: eth0\n\n" +
    "Step 3: Enter any Exclusion details within the sniff.\n" +
    "       Eg: POST (every packet besides POST will be shown)\n\n" +
    "Step 4: Click Sniff to commence Urlsnarf's operation.\n\n" +
    "Step 5: View the Output block below to view the results of the tools execution.";

interface FormValuesType {
    listenerInputType: string;
    listenerArgs: string;
    versusMode: string;
}

const listeners = ["Interface", "Packet capture file"];

const Urlsnarf = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [selectedListenerInput, setSelectedListenerInput] = useState("");

    let form = useForm({
        initialValues: {
            listenerInputType: "",
            listenerArgs: "",
            versusMode: "",
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);

        const args = [];
        if (selectedListenerInput === "Interface") {
            args.push(`-i`, `${values.listenerArgs}`);
        } else if (selectedListenerInput === "Packet capture file") {
            args.push(`-p`, `${values.listenerArgs}`);
        }
        args.push(`-v`, `${values.versusMode}`);

        try {
            const output = await CommandHelper.runCommand("urlsnarf", args);
            setOutput(output);
        } catch (e: any) {
            setOutput(e);
        }

        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    const isListenerInterface = selectedListenerInput === "Interface";
    const isListenerFile = selectedListenerInput === "Packet capture file";

    return (
        <form
            onSubmit={form.onSubmit((values) =>
                onSubmit({
                    ...values,
                    listenerInputType: selectedListenerInput,
                })
            )}
        >
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <NativeSelect
                    value={selectedListenerInput}
                    onChange={(e) => setSelectedListenerInput(e.target.value)}
                    label={"listener settings"}
                    data={listeners}
                    required
                    placeholder={"Interface or PCAP file"}
                />
                {isListenerInterface && (
                    <TextInput
                        {...form.getInputProps("listenerArgs")}
                        label={"Interface"}
                        placeholder={"eg: eth0"}
                        required
                    />
                )}
                {isListenerFile && (
                    <TextInput
                        {...form.getInputProps("listenerArgs")}
                        label={"File path"}
                        placeholder={"eg: /home/kali/Desktop/pcap.pcapng"}
                        required
                    />
                )}
                <TextInput
                    {...form.getInputProps("versusMode")}
                    label={"Exclusion details"}
                    placeholder={"eg: POST ; show every packet that excludes POST"}
                />
                <Button type={"submit"} color="cyan">
                    Sniff
                </Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Urlsnarf;
