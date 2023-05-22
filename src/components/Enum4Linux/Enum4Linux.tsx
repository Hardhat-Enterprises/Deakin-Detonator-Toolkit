import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Enum4Linux";
const description_userguide =
    "Enum4linux is a tool used for the enumeration of information from Windows and Samba operating systems. " +
    "It is particularly useful for identifying the remote OS of a system and providing a list of the users " +
    "and group memberships found within the system.\n\nOptions for the tool can be found at: " +
    "https://www.kali.org/tools/enum4linux/\n\n" +
    "Using Enum4Linux:\n" +
    "Step 1: Enter a Target IP address.\n" +
    "       Eg: 192.168.1.1\n\n" +
    "Step 2: Enter an Option for the Enumeration.\n" +
    "       Eg: U (get userlist)\n\n" +
    "Step 3: Enter any Parameters.\n" +
    "       Eg: example.txt\n\n" +
    "Step 4: Enter any Additional Options/Parameters.\n\n" +
    "Step 5: Click Scan to commence Enum4Linux's operation.\n\n" +
    "Step 6: View the Output block below to view the results of the tools execution.";

interface FormValues {
    ipAddress: string;
    argumentMain: string;
    paramMain: string;
    argumentAlt: string;
    paramAlt: string;
}

const Enum4Linux = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            ipAddress: "",
            argumentMain: "",
            paramMain: "",
            argumentAlt: "",
            paramAlt: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        let temp = "-";
        const options = temp + values.argumentMain;
        let args = [];
        if (values.argumentAlt != "") {
            const options2 = temp + values.argumentAlt;
            args = [options, values.paramMain, options2, values.paramAlt, values.ipAddress];
        } else {
            args = [options, values.paramMain, values.ipAddress];
        }

        const result = await CommandHelper.runCommand("enum4linux", args);

        setOutput(result);
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
                <TextInput
                    label={"IP Address of Target"}
                    placeholder={"Example: 192.168.1.200"}
                    required
                    {...form.getInputProps("ipAddress")}
                />
                <TextInput
                    label={"Option"}
                    placeholder={"Example: U"}
                    required
                    {...form.getInputProps("argumentMain")}
                />
                <TextInput label={"Parameters"} placeholder={"Example: o"} {...form.getInputProps("paramMain")} />
                <TextInput label={"Additional Options"} {...form.getInputProps("argumentAlt")} />
                <TextInput label={"Additional Options Parameters"} {...form.getInputProps("paramAlt")} />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Enum4Linux;
