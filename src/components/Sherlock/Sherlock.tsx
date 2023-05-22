import { Button, LoadingOverlay, Stack, TextInput, Title, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Sherlock Tool";
const description_guide =
    "Sherlock is a tool used for searching social networks for the certain username.\n\n" +
    "Further information can be found at: https://www.kali.org/tools/sherlock/\n\n" +
    "Using Sherlock:\n" +
    "*Note: For multiple usernames, add a space in between. 'Sherlock John Billy'*\n" +
    "Step 1: Input the username you need to search in the input box.\n" +
    "       Eg: John Billy\n\n" +
    "Step 2: Click Start Searching to commence Sherlock's operation.\n\n" +
    "Step 3: View the Output block below to view the results of the tools execution.";

interface FormValuesType {
    username: string;
    timeout: number;
}

const Sherlock = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [checkedAdvanced, setCheckedAdvanced] = useState(false);

    let form = useForm({
        initialValues: {
            username: "",
            timeout: 60,
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = [`${values.username}`];

        if (values.timeout) {
            args.push(`--timeout ${values.timeout}`);
        }

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
                <Switch
                    size="md"
                    label="Advanced Mode"
                    checked={checkedAdvanced}
                    onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                />
                <TextInput label={"Username"} required {...form.getInputProps("username")} />
                {checkedAdvanced && (
                    <>
                        <TextInput
                            label={"Timeout"}
                            placeholder={"Time (in seconds) to wait for response to requests. Default is 60"}
                            {...form.getInputProps("timeout")}
                        />
                    </>
                )}
                <Button type={"submit"}>Start Searching!</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Sherlock;
