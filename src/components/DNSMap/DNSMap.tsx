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

const title = "DNS Mapping for Subdomains (DNSMap)";
const description_userguide =
    "dnsmap scans a domain for common subdomains using a built-in or an external wordlist (if specified using -w option). " +
    "The internal wordlist has around 1000 words in English and Spanish as ns1, firewall servicios and smtp. " +
    "So itwill be possible search for smtp.example.com inside example.com automatically. \n\n" +
    "Step 1: Enter a valid domain to be mapped.\n" +
    "Step 2: Enter a delay between requests. Default is 10 (milliseconds). Can be left blank.\n" +
    "Step 3: Results will be shown below";

const DNSMap = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            domain: "",
            delay: 10,
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = [`${values.domain}`, "-d", `${values.delay}`];

        try {
            const output = await CommandHelper.runCommand("dnsmap", args);
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
                <TextInput label={"Domain"} required {...form.getInputProps("domain")} />
                <TextInput
                    label={"Random delay between requests (default 10)(milliseconds)"}
                    type="number"
                    {...form.getInputProps("threads")}
                />
                <Button type={"submit"}>Start Mapping</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default DNSMap;
