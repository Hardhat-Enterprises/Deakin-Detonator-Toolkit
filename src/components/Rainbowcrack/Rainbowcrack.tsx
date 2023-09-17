import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import React from "react";

const title = "Rainbowcrack";
const description_userguide =
    "RainbowCrack is a computer program which generates rainbow tables to be used in password cracking . " +
    "This is a dictionary-based attack that takes place upon a web server and will analyse the PLACEHOLDER " +
    "results within this process.\n\nHow to use Dirb:\n\nStep 1: Enter a valid URL.\n PLACEHOLDER" +
    "       E.g. https://www.deakin.edu.au\n\nStep 2: Enter a file directory pathway to access PLACEHOLDER" +
    "a wordlist\n       E.g. home/wordlist/wordlist.txt\n\nStep 3: Click Scan to commence " +
    "the Dirb operation.\n\nStep 4: View the Output block below to view the results of the tool's execution.";

interface FormValues {
    hashcode: string;
}

export function rcrack() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            hashcode: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = ["."];
        args.push("-h", values.hashcode);

        const output = await CommandHelper.runCommand("rcrack", args);

        setOutput(output);
        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label={"Enter the Hash code"} required {...form.getInputProps("hashcode")} />
                <Button type={"submit"}>Crack</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
export default rcrack;
