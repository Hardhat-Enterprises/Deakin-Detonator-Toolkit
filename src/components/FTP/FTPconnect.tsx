import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "FTP Tool";
const description_userguide =
    "A quick guide on how to use the FTP on Deakin-Detonator-Toolkit:\n" +
    "- Type in FTP server's IP address on the box\n" +
    "- If it prompts you with a login, type your login details\n" +
    "- If it does not, type in user and then type in your login details\n" +
    "- Type lcd to change the current directory to the default directory. \n Example: /home/kali\n" +
    "- Enjoy using ftp with DDT tools :)";

//Variables
interface FormValuesType {
    IPaddress: string;
}

export function FTPconnect() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            IPaddress: "",
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(false);
        let args = ["/usr/share/ddt/Bash-Scripts/FTPterminal.sh"];
        args.push(`${values.IPaddress}`);

        const output = await CommandHelper.runCommand("bash", args);

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
                <TextInput label={"IP address"} required {...form.getInputProps("IPaddress")} />
                <Button type={"submit"}>Start FTP</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
