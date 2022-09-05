import { Button, LoadingOverlay, NativeSelect, NumberInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValues {
    dcName: string;
    targetIP: string;
    adminName: string;
    hashes: string;
}

export function ZeroLogon() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [selectedVersion, setSelectedVersion] = useState("2.4.49");

    let form = useForm({
        initialValues: {
            dcName: "",
            targetIP: "",
            adminName: "",
            hashes: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = ["/usr/share/ddt/zerologon_tester.py", values.dcName, values.targetIP];
        const output = await CommandHelper.runCommand("python3", args);

        setOutput(output);
        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit({ ...values }))}>
            <LoadingOverlay visible={loading} />
            <Stack>
                <Title>ZeroLogon</Title>
                <TextInput label={"DC Name"} required {...form.getInputProps("dcName")} />
                <TextInput label={"Target IP"} required {...form.getInputProps("targetIP")} />
                <TextInput label={"Administrative Name@DC-IP"} required {...form.getInputProps("adminName")} />
                <TextInput label={"Hashes"} required {...form.getInputProps("hashes")} />

                <Button type={"submit"}>Exploit</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
