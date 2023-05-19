import { Button, LoadingOverlay, Stack, TextInput, Switch, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "DNS Enumeration Tool";
const description_userguide =
    "DNSenum is a command-line tool used for DNS enumeration." +
    "It is used to gather information about a domain, including subdomains, hosts, and IP addresses." +
    "The tool is useful for penetration testers and security researchers, " +
    "as it can help identify potential attack vectors and vulnerabilities in a network." +
    "DNSenum supports a variety of DNS record types, including A, MX, NS, and SOA records." +
    "You can find more information about the tool, including usage instructions and examples," +
    "in its official documentation: https://tools.kali.org/information-gathering/dnsenum";

//list of input values collected by the form
interface FormValuesType {
    domain: string;
    subdomains: string;
    threads: number;
    dnsServer: string;
    queryType: string;
    userAgents: string;
    blacklist: string;
    whitelist: string;
    bruteForce: boolean;
}

const DnsenumTool = () => {
    //sets the state of the tool; loading or not, what the output is
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [checkedAdvanced, setCheckedAdvanced] = useState(false);

    //intial form values
    let form = useForm({
        initialValues: {
            domain: "",
            subdomains: "",
            threads: 10,
            dnsServer: "",
            queryType: "",
            userAgents: "",
            blacklist: "",
            whitelist: "",
            bruteForce: false,
        },
    });

    //sets the loading state to True, provides arguments for the tool
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = ["--enum", "--threads", `${values.threads}`, `${values.domain}`];

        //pushes the subdomain argument if one is provided by user
        if (values.subdomains) {
            args.push(`-S ${values.subdomains}`);
        }

        if (values.dnsServer) {
            args.push(`-s ${values.dnsServer}`);
        }

        if (values.queryType) {
            args.push(`-t ${values.queryType}`);
        }

        if (values.userAgents) {
            args.push(`-u ${values.userAgents}`);
        }

        if (values.blacklist) {
            args.push(`-b ${values.blacklist}`);
        }

        if (values.whitelist) {
            args.push(`-w ${values.whitelist}`);
        }

        if (values.bruteForce) {
            args.push(`-B`);
        }
        //try the dnsenum command with provided arguments, show output if succesful or error message if not.
        try {
            const output = await CommandHelper.runCommand("dnsenum", args);
            setOutput(output);
        } catch (e: any) {
            setOutput(e);
        }

        setLoading(false);
    };

    //clears output without completely refreshing the tool
    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        //define user interface of the tool
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
                <TextInput label={"Domain"} required {...form.getInputProps("domain")} />
                <TextInput label={"Subdomains to include (comma-separated)"} {...form.getInputProps("subdomains")} />
                <TextInput label={"Threads"} type="number" min={1} {...form.getInputProps("threads")} />
                {checkedAdvanced && (
                    <>
                        <TextInput label={"DNS Server"} {...form.getInputProps("dnsServer")} />
                        <TextInput label={"Query Type"} {...form.getInputProps("queryType")} />
                        <TextInput
                            label={"User Agents"}
                            placeholder={"Comma-separated list"}
                            {...form.getInputProps("userAgents")}
                        />
                        <TextInput
                            label={"Blacklist"}
                            placeholder={"Comma-separated list"}
                            {...form.getInputProps("blacklist")}
                        />
                        <TextInput
                            label={"Whitelist"}
                            placeholder={"Comma-separated list"}
                            {...form.getInputProps("whitelist")}
                        />
                        <Checkbox
                            label={"Brute Force Mode"}
                            {...form.getInputProps("bruteForce" as keyof FormValuesType)}
                        />
                    </>
                )}
                <Button type={"submit"}>Start Enumeration</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default DnsenumTool;
