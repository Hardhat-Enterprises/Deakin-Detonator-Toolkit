import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "ZeroLogon";
const description_userguide =
    "The ZeroLogon CVE allows an attacker that has unauthenticated access to a domain controller within their network " +
    "access to create a Netlogon session that can be exploited to grant domain administrative privileges. The vulnerability " +
    "here lays within an implementation flaw for AES-CFB8 where a cryptographic transformation takes place with use of a " +
    "session key.\n\nFurther information can be found at: https://www.crowdstrike.com/blog/cve-2020-1472-zerologon-" +
    "security-advisory/\n\n" +
    "Using ZeroLogon:\n\n" +
    "Step 1: Enter a Domain Controller name.\n" +
    "       Eg: TEST-AD\n" +
    "Step 2: Enter a Target IP address.\n" +
    "       Eg: 192.168.1.1\n" +
    "Step 3: Enter an Administrative name @ Domain Controller IP.\n" +
    "       Eg: Administrator\n" +
    "Step 4: Enter any relevant Hashes.\n" +
    "       Eg: Administrator:500:CEEB0FA9F240C200417EAF40CFAC29C3:D280553F0103F2E643406517296E7582:::\n" +
    "Step 5: Click Exploit to commence ZeroLogon’s operation.\n" +
    "Step 6: View the Output block below to view the results of the attack vectors execution.";

interface FormValues {
    dcName: string;
    targetIP: string;
    adminName: string;
    hashes: string;
}

export function ZeroLogon() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            dcName: "",
            targetIP: "",
            adminName: "",
            hashes: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = ["/usr/share/ddt/zerologon_tester.py", values.dcName, values.targetIP];
        const output = await CommandHelper.runCommand("python3", args);

        setOutput(output);
        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit({ ...values }))}>
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label={"DC Name"} required {...form.getInputProps("dcName")} />
                <TextInput label={"Target IP"} required {...form.getInputProps("targetIP")} />
                <TextInput label={"Administrative Name@DC-IP"} required {...form.getInputProps("adminName")} />
                <TextInput label={"Hashes"} required {...form.getInputProps("hashes")} />

                <Button type={"submit"}>Exploit</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
