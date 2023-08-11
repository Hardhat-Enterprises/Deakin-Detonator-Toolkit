import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "fcrackzip Password Cracker";
const description_userguide =
    "fcrackzip is a command-line tool used to crack password-protected zip files. It uses brute force and dictionary attacks to guess the password of a zip file. You can find more information about the tool, including usage instructions and examples, in its official documentation: https://www.unix-ag.uni-kl.de/~conrad/krypto/fcrackzip.html";

interface FormValuesType {
    zipFile: string;
    dictionaryFile: string;
    outputFile: string;
}

const FcrackzipTool = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            zipFile: "",
            dictionaryFile: "",
            outputFile: "fcrackzip-results.txt",
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = ["-b", "-D", "-p", values.dictionaryFile, values.zipFile, `>> ${values.outputFile}`];

        try {
            const output = await CommandHelper.runCommand("fcrackzip", args);
            setOutput(output);
        } catch (e: any) {
            setOutput(e);
        }

        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label={"Zip File"} required {...form.getInputProps("zipFile")} />
                <TextInput label={"Dictionary File"} required {...form.getInputProps("dictionaryFile")} />
                <TextInput label={"Output File (optional)"} {...form.getInputProps("outputFile")} />
                <Button type={"submit"}>Start Cracking</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default FcrackzipTool;
