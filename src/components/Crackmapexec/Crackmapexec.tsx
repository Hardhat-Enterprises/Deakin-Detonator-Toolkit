import { Button, LoadingOverlay, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Crackmapexec Tool";
const description_userguide =
    "The Crackmapexec tool withholds a package which is a swiss army knife used for penetration testing Windows or " +
    "Active Directory environments. The tool is capable of enumerating information from logged on users, perform psexec " +
    "styled attacks through SMB spidering, auto-injecting Shellcode into memory through Powershell, and dumping NTDS.nit. " +
    "Any used or dumped credentials will be stored to a database.\n\nFurther information can be found at: https://www. " +
    "kali.org/tools/crackmapexec/\n\n" +
    "Using Crackmapexec:\n" +
    "Step 1: Enter a Target IP address.\n" +
    "       Eg: 192.168.0.1\n\n" +
    "Step 2: Enter a Username.\n" +
    "       Eg: admin\n\n" +
    "Step 3: Enter a Password.\n" +
    "       Eg: admin\n\n" +
    "Step 4: Click Start Searching to commence Crackmapexec's operation.\n\n" +
    "Step 5: View the Output block below to view the results of the tools execution.";

interface FormValues {
    ip: string;
    username: string;
    password: string;
    timeout: number;
}

const Crackmapexec = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [checkedAdvanced, setCheckedAdvanced] = useState(false);

    let form = useForm({
        initialValues: {
            ip: "",
            username: "",
            password: "",
            timeout: 60,
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        const args = [];

        if (values.timeout) {
            args.push(`--timeout ${values.timeout}`);
        }

        args.push("smb", `${values.ip}`, "-u", `${values.username}`, "-p", `${values.password}`);
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
                {UserGuide(title, description_userguide)}
                <Switch
                    size="md"
                    label="Advanced Mode"
                    checked={checkedAdvanced}
                    onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                />

                <TextInput label={"IP"} required {...form.getInputProps("ip")} />
                <TextInput label={"Username"} required {...form.getInputProps("username")} />
                <TextInput label={"Password"} required {...form.getInputProps("password")} />
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

export default Crackmapexec;
