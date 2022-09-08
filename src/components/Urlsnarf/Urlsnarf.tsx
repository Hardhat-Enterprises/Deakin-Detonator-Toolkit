import { Button, LoadingOverlay, NativeSelect, Stack, TextInput, Title, Grid } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

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
                <Title>Urlsnarf</Title>
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
