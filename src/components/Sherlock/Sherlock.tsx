import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Sherlock Tool";
const description_guide =
    "Sherlock is a tool used for searching social netowkrs for the certain username. \n\n" +
    "Steps to use Sherlock: \n" +
    "Note: For multiple username add a space in between. 'Sherlock John Billy'\n\n" +
    "Step 1: Input the username you need to search in the input box.\n" +
    "Step 2: Click Start Searching \n" +
    "Step 3: View results in the Output block below.";

interface FormValues {
    username: string;
}

const Sherlock = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            username: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        const args = [`${values.username}`];

        try {
            const output = await CommandHelper.runCommand("sherlock", args);
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
                {UserGuide(title, description_guide)}
                <TextInput label={"Username"} required {...form.getInputProps("username")} />
                <Button type={"submit"}>Start Searching!</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Sherlock;
