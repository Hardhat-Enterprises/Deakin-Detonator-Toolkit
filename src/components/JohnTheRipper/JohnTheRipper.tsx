import { Button, LoadingOverlay, NativeSelect, NumberInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValuesType {
    filePath: string;
    hash: string;
    fileType: string;
}

const fileTypes = ["zip", "rar"];

const scanOptions = [
    "All",
    "Operating System",
    "Firewall Status",
    "Services",
    "Stealth",
    "Device Discovery",
    "Top ports",
];

const JohnTheRipper = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [selectedScanOption, setSelectedScanOption] = useState("");
    const [selectedFileTypeOption, setSelectedFileTypeOption] = useState("");

    let form = useForm({
        initialValues: {
            filePath: "",
            hash: "",
            fileType: "",
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);

        if (values.hash.length == 0) {
            const args = [` "${values.fileType}2john ${values.filePath} > /tmp/hashoutput.txt"`];
            //const command = values.fileType + "2john";
            const command = "bash -c";
            console.log(command + args);
            try {
                const output = await CommandHelper.runCommand(command, args);
                setOutput(output);
            } catch (e: any) {
                setOutput(e);
            }

            try {
                const args = [`--format=${values.fileType} /tmp/hash.txt`];
                const output = await CommandHelper.runCommand("john", args);
                setOutput(output);
            } catch (e: any) {
                setOutput(e);
            }

            setLoading(false);
        } else {
            const args = [`--format=${values.fileType} ${values.hash}`];
            try {
                const output = await CommandHelper.runCommand("john", args);
                setOutput(output);
            } catch (e: any) {
                setOutput(e);
            }

            setLoading(false);
        }
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit({ ...values, fileType: selectedFileTypeOption }))}>
            <LoadingOverlay visible={loading} />
            <Stack>
                <Title>John The Ripper</Title>
                <TextInput label={"Filepath"} required {...form.getInputProps("filePath")} />
                <TextInput label={"Hash (if known)"} {...form.getInputProps("hash")} />
                <NativeSelect
                    value={selectedFileTypeOption}
                    onChange={(e) => setSelectedFileTypeOption(e.target.value)}
                    title={"File Type"}
                    data={fileTypes}
                    required
                    placeholder={"File Type"}
                    description={"Please select the type of file you want to crack"}
                />
                <Button type={"submit"}>Crack</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default JohnTheRipper;
