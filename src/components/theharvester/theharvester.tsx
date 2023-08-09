import { Button, LoadingOverlay, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "The Harvester";
const description_userguide =
    "A tool for gathering subdomain names, e-mail addresses, virtual hosts, open ports/ banners, and employee names from different public sources (search engines, pgp key servers)." +
    "\n\nInformation on the tool can be found at: https://www.kali.org/tools/theharvester/\n\n" +
    "Step 1: Enter a valid domain to be harvested.\n" +
    "       Eg: kali.org\n\n" +
    "Step 2: Enter a limit for the requests. Default is 500 results. Can be left blank.\n" +
    "       Eg: 500\n\n" +
    "Step 3: Select a source to search form. The list contains compatible search engines.\n" +
    "       Eg: baidu\n\n" +
    "Step 4: Click Start Harvesting to commence tool's operation.\n\n" +
    "Step 5: View the Output block below to view the results of the tool's execution.\n\n" +
    "Switch to Advanced Mode for further options.";

interface FormValuesType {
    domain: string;
    resultlimit: number;
    source: string;
    startresult: number;
    useshodan: boolean;
    dnslookup: boolean;
    dnsbrute: boolean;
    virtualhost: boolean;
    takeover: boolean;
}

const TheHarvester = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [checkedAdvanced, setCheckedAdvanced] = useState(false);

    let form = useForm({
        initialValues: {
            domain: "",
            resultlimit: 500,
            source: "",
            startresult: 0,
            useshodan: false,
            dnslookup: false,
            dnsbrute: false,
            virtualhost: false,
            takeover: false,
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = ["-d", `${values.domain}`, "-l", `${values.resultlimit}`, "-b", `${values.source}`];

        if (values.startresult) {
            args.push(`-S ${values.startresult}`);
        }

        if (values.useshodan === true) {
            args.push(`-s`);
        }

        if (values.dnslookup === true) {
            args.push(`-n`);
        }

        if (values.dnsbrute === true) {
            args.push(`-c`);
        }

        if (values.virtualhost === true) {
            args.push(`-v`);
        }

        if (values.takeover === true) {
            args.push(`-t`);
        }

        const filteredArgs = args.filter((arg) => arg !== "");

        try {
            const output = await CommandHelper.runCommand("theHarvester", filteredArgs);
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
                <TextInput label={"Domain"} required {...form.getInputProps("domain")} />

                <TextInput
                    label={"Limit of results searched/shown (default 500)"}
                    type="number"
                    {...form.getInputProps("resultlimit")}
                />
                <label>Source</label>
                <select {...form.getInputProps("source")}>
                    <option value="baidu">Baidu</option>
                    <option value="bing">Bing</option>
                    <option value="censys">Censys</option>
                    <option value="certspotter">Certspotter</option>
                    <option value="crtsh">Crtsh</option>
                    <option value="dnsdumpster">DNSdumpster</option>
                    <option value="duckduckgo">DuckDuckGo</option>
                    <option value="exalead">Exalead</option>
                    <option value="google">Google</option>
                    <option value="hackertarget">Hackertarget</option>
                    <option value="hunter">Hunter</option>
                    <option value="intelx">Intelx</option>
                    <option value="linkedin">Linkedin</option>
                    <option value="linkedin_links">Linkedin Links</option>
                    <option value="netcraft">Netcraft</option>
                    <option value="otx">Otx</option>
                    <option value="securityTrails">SecurityTrails</option>
                    <option value="shodan">Shodan</option>
                    <option value="spyse">Spyse</option>
                    <option value="sublist3r">Sublist3r</option>
                    <option value="threatcrowd">Threatcrowd</option>
                    <option value="threatminer">Threatminer</option>
                    <option value="trello">Trello</option>
                    <option value="twitter">Twitter</option>
                    <option value="vhost">Vhost</option>
                    <option value="virustotal">Virustotal</option>
                    <option value="yahoo">Yahoo</option>
                </select>
                {checkedAdvanced && (
                    <>
                        <TextInput
                            label={"Start with result number X. (default 0)"}
                            type="number"
                            {...form.getInputProps("startresult")}
                        />
                        <input
                            label={"Use ShodanUse Shodan to query discovered hosts."}
                            type="checkbox"
                            {...form.getInputProps("useshodan")}
                        />
                        <input
                            label={"DNS Lookup (Enable DNS server lookup)"}
                            type="checkbox"
                            {...form.getInputProps("dnslookup")}
                        />
                        <input
                            label={"DNS Brute (Perform a DNS brute force on the domain.)"}
                            type="checkbox"
                            {...form.getInputProps("dnsbrute")}
                        />
                        <input
                            label={"Virtual Host (Verify host name via DNS resolution and search for virtual hosts.)"}
                            type="checkbox"
                            {...form.getInputProps("virtualhost")}
                        />
                        <input
                            label={"Takeover (Check for takeovers.)"}
                            type="checkbox"
                            {...form.getInputProps("takeover")}
                        />
                    </>
                )}
                <br></br>
                <Button type={"submit"}>Start Harvesting</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default TheHarvester;
