import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Crackmapexec Tool";
const description_guide = "Crackmap exec tool description";

interface FormValues {
    ip: string;
    username: string;
    password: string;
}

const Crackmapexec = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            ip: "",
            username: "",
            password: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        const args = ["smb", `${values.ip}`, "-u", `${values.username}`, "-p", `${values.password}`];

        try {
            const output = await CommandHelper.runCommand("crackmapexec", args);
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
                <TextInput label={"IP"} required {...form.getInputProps("ip")} />
                <TextInput label={"Username"} required {...form.getInputProps("username")} />
                <TextInput label={"Password"} required {...form.getInputProps("password")} />
                <Button type={"submit"}>Start Searching!</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Crackmapexec;
