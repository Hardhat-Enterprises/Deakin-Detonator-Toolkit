import { Button, LoadingOverlay, NumberInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile"; //v2

const title = "Find offset";
const description_userguide =
    "This attack vector acts to find the offset to the instruction pointer in a buffer overflow vulnerable binary.\n\n" +
    "Further information can be found at: https://cve.mitre.org/cgi-bin/cvekey.cgi?keyword=buffer+overflow\n\n" +
    "Using Find offset:\n" +
    "Step 1: Input a file directory pathway to the binary.\n" +
    "       Eg: home/binary\n\n" +
    "Step 2: Enter the number of chars to send.\n" +
    "       Eg: 200\n\n" +
    "Step 3: Click Find offset to commence the tools operation.\n\n" +
    "Step 4: View the Output block below to view the results of the attack vectors execution.";

interface FormValues {
    pathToBinary: string;
    count: number;
}

const FindOffset = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    let form = useForm({
        initialValues: {
            pathToBinary: "",
            count: 200,
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        const args = ["./exploits/find_offset.py", values.pathToBinary, "--count", values.count.toString()];
        const result = await CommandHelper.runCommand("python3", args);

        setOutput(result);
        setLoading(false);
        setAllowSave(true);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label={"Path to binary"} required {...form.getInputProps("pathToBinary")} />
                <NumberInput label={"Number of chars to send"} {...form.getInputProps("count")} />
                <Button type={"submit"}>Find offset</Button>
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default FindOffset;
