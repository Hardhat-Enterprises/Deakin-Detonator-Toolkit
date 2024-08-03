import { Button, LoadingOverlay, NumberInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile"; //v2

const title = "Find offset";
const description_userguide =
    "A buffer overflow is where a program writes data to a buffer beyond the buffer's allocated memory, overwriting adjacent memory locations.\n" +
    "This attack vector utilizes the pwntools CTF framework (https://docs.pwntools.com/en/stable/) to find the offset to the instruction pointer in a ELF file that has a buffer overflow vulnerability. The file must be an ELF file (with an ELF magic number) and have a buffer overflow vulnerability for the exploit to work.\n" +
    "Further information about known buffer overflow exploits can be found at: https://cve.mitre.org/cgi-bin/cvekey.cgi?keyword=buffer+overflow\n" +
    "If successful, the offset value is outputted. Any data written beyond this value would cause the buffer to overwrite the instruction pointer register.\n\n" +
    "Steps:\n" +
    "Step 1: Input a file directory pathway to the binary. The input file MUST be a ELF file AND have an ELF magic number for the exploit to work.\n" +
    "       Eg: /home/kali/Desktop/test-file\n\n" +
    "Step 2: Enter the number of characters to send.\n" +
    "       Eg: 200\n\n" +
    "Step 3: Click the 'Find offset' button to commence the tool's operation.\n\n" +
    "Step 4: View the output window to see if the exploit was successful and to view the offset value.\n\n" +
    "Note: Visit the Deakin Detonator Kit walkthroughs tab for a detailed guide on the definitions, explanations, dependencies, FAQs, and troubleshooting assistance for this attack vector.";

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
        const args = ["/usr/share/ddt/find_offset.py", values.pathToBinary, "--count", values.count.toString()];

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
