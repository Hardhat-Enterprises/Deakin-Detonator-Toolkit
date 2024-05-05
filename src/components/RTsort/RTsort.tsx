import { Button, Checkbox, LoadingOverlay, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Rainbow Table Sort (rtsort)";
const description_userguide =
    "RTSort is a subfuntion of the Rainbow Crack tool. This function sorts created rainbow tables.";

interface FormValuesType {
    path: string;
}

// Funtion for implementing RTSort as GUI component
const rtsort = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");

    let form = useForm({
        initialValues: {
            path: "./",
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = [`${values.path}`];

        const filteredArgs = args.filter((arg) => arg !== "");

        // Please note this command should not be cancelled as this will cause the rainbow table to be corrupted
        try {
            const output = await CommandHelper.runCommand("rtsort", filteredArgs);
            setOutput(output);
        } catch (e: any) {
            setOutput(e);
        }

        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    // placeholder="/home/user/rainbowcrack/tables/ntlm_loweralpha-numeric#1-9_0_1000x1000_0.rt"
    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput
                    label={"Path"}
                    required
                    placeholder="/home/user/rainbowcrack/tables/ntlm_loweralpha-numeric#1-9_0_1000x1000_0.rt"
                    {...form.getInputProps("path")}
                />
                <br></br>
                <Button type={"submit"}>Start Sort</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default rtsort;
