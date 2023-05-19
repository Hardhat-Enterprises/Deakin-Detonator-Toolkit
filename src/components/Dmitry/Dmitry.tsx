import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

interface FormValuesType {
    domain: string;
    delay: number;
}

const title = "Deepmagic Information Gathering Tool";
const description_userguide =
    "DMitry is a UNIX/(GNU) Linux command line application written in C. DMitry will scan to try and find " +
    "possible subdomains, email addresses and uptime information, and further perform tcp port scans, and " +
    "whois lookups.\n\nInformation on the tool can be found at: https://www.kali.org/tools/dmitry/\n\n" +
    "Using Dmitry:\n" +
    "Step 1: Enter a valid domain or IP address to be scanned.\n" +
    "       Eg: 192.168.0.1\n\n" +
    "Step 2: Enter a delay between requests. Default is 2 (milliseconds). Can be left blank.\n" +
    "       Eg: 2\n\n" +
    "Step 3: Click Start Scanning to commence Dmirty's operation.\n\n" +
    "Step 4: View the Output block below to view the results of the tools execution.";

const dmitry = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            domain: "",
            delay: 2,
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = [`${values.domain}`, "-winsep", "-t", `${values.delay}`];

        try {
            const output = await CommandHelper.runCommand("dmitry", args);
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
                <TextInput label={"Domain or IP"} required {...form.getInputProps("domain")} />
                <TextInput
                    label={"Set TTL in seconds when scanning a TCP port (default 2)"}
                    type="number"
                    {...form.getInputProps("delay")}
                />
                <Button type={"submit"}>Start Scanning</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default dmitry;
