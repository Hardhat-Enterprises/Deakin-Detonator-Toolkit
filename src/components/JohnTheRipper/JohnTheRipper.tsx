import { Button, LoadingOverlay, NativeSelect, NumberInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { writeTextFile, BaseDirectory } from "@tauri-apps/api/fs";

interface FormValuesType {
    filePath: string;
    hash: string;
    fileType: string;
}

const fileTypes = ["zip", "rar"];

const JohnTheRipper = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
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

        //if hash is not specified
        if (values.hash.length === 0) {
            const args = [`${values.filePath}`];

            try {
                const result = await CommandHelper.runCommand(`${values.fileType}2john`, args);
                await writeTextFile("hash.txt", result, { dir: BaseDirectory.Temp });
                setOutput(result);
            } catch (e: any) {
                console.log(e);
                setOutput(e);
            }

            try {
                const args = [`--format=${values.fileType}`, "/tmp/hash.txt"];
                const result = await CommandHelper.runCommand("john", args);
                console.log(result);
                setOutput(output + "\n" + result);
            } catch (e: any) {
                console.log(e);
                setOutput(e);
            }

            setLoading(false);
            //if hash is specified
        } else {
            const args = [`--format=${values.fileType}`, `${values.hash}`];
            try {
                const result = await CommandHelper.runCommand("john", args);
                console.log(result);
                setOutput(output + "\n" + result);
            } catch (e: any) {
                console.log(e);
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
