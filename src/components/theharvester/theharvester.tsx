import { Button, Stack, TextInput, Switch, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

/**
 * Represents the form values for the Harvester component.
 */
interface FormValuesType {
    domain: string;
    resultLimit: number;
    source: string;
    startresult: number;
    useshodan: boolean;
    dnslookup: boolean;
    dnsbrute: boolean;
    virtualHost: boolean;
    takeover: boolean;
}

/**
 * The Harvester component.
 * @returns The Harvester component.
 */
const TheHarvester = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [checkedAdvanced, setCheckedAdvanced] = useState(false);
    const [pid, setPid] = useState("");
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    // Component Constants.
    const title = "The Harvester";

    const description =
        "A tool for gathering subdomain names, e-mail addresses, virtual hosts, open ports/ banners, and employee names from different public sources (search engines, pgp key servers).";

    const steps =
        "Step 1: Enter a valid domain to be harvested.\n" +
        "       Eg: kali.org\n" +
        "Step 2: Enter a limit for the requests. Default is 500 results. Can be left blank.\n" +
        "       Eg: 500\n" +
        "Step 3: Select a source to search form. The list contains compatible search engines.\n" +
        "       Eg: baidu\n" +
        "Step 4: Click Start The Harvester to commence the tool's operation.\n" +
        "Step 5: View the Output block below to view the results of the tool's execution.\n" +
        "Switch to Advanced Mode for further options.";

    const sourceLink = "https://gitlab.com/kalilinux/packages/theharvester";

    const tutorial =
        "https://docs.google.com/document/d/1LPb5otKZQK-hx8dy2f_isR0iTcdjbqGS/edit?usp=sharing&ouid=110009021884912956761&rtpof=true&sd=true";

    const dependencies = ["theHarvester"];

    // Form hook to handle form input.
    const form = useForm<FormValuesType>({
        initialValues: {
            domain: "",
            resultLimit: 500,
            source: "baidu",
            startresult: 0,
            useshodan: false,
            dnslookup: false,
            dnsbrute: false,
            virtualHost: false,
            takeover: false,
        },
    });

    // Check if the command is available and set the state variables accordingly.
    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable);
                setOpened(!isAvailable);
                setLoadingModal(false);
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false);
            });
    }, []);

    /**
     * Handles and appends data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);

        if (!allowSave) {
            setAllowSave(true);
        }
    }, []);

    /**
     * Handles termination of the child process.
     */
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }

            setPid("");
            setLoading(false);
            setAllowSave(true);
        },
        [handleProcessData]
    );

    // Handles saving the output after the tool use.
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * Runs theHarvester using the submitted form values.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);

const args = ["-d", values.domain, "-b", values.source];

const limit = Number(values.resultLimit);
if (Number.isFinite(limit) && limit > 0) {
    args.push("-l", String(limit));
}

        if (checkedAdvanced) {
            if (values.startresult) {
                args.push("-S", String(values.startresult));
            }

            if (values.useshodan === true) {
                args.push("-s");
            }

            if (values.dnslookup === true) {
                args.push("-n");
            }

            if (values.dnsbrute === true) {
                args.push("-c");
            }

            if (values.virtualHost === true) {
                args.push("-v");
            }

            if (values.takeover === true) {
                args.push("-t");
            }
        }

        const filteredArgs = args.filter((arg) => arg !== "");

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "theHarvester",
                filteredArgs,
                handleProcessData,
                handleProcessTermination
            );

            setPid(result.pid);
            setOutput(result.output);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "theHarvester failed to run.";

            setOutput(message);
            setPid("");
        }

        setLoading(false);
    };

    // Clears the output state.
    const clearOutput = useCallback(() => {
        setOutput("");
        setAllowSave(false);
        setHasSaved(false);
    }, []);

    return (
        <>
            <RenderComponent
                title={title}
                description={description}
                steps={steps}
                tutorial={tutorial}
                sourceLink={sourceLink}
            >
                {!loadingModal && (
                    <InstallationModal
                        isOpen={opened}
                        setOpened={setOpened}
                        feature_description={description}
                        dependencies={dependencies}
                    />
                )}

                <form onSubmit={form.onSubmit(onSubmit)}>
                    <Stack>
                        {LoadingOverlayAndCancelButton(loading, pid)}

                        <Switch
                            size="md"
                            label="Advanced Mode"
                            checked={checkedAdvanced}
                            onChange={(event) => setCheckedAdvanced(event.currentTarget.checked)}
                        />

                        <TextInput label="Domain" required {...form.getInputProps("domain")} />

                        <TextInput
                            label="Limit of results searched/shown (default 500)"
                            type="number"
                            {...form.getInputProps("resultLimit")}
                        />

                        <label>Source</label>

                        <select {...form.getInputProps("source")}>
                            <option value="baidu">Baidu</option>
                            <option value="bevigil">BeVigil (API key required)</option>
                            <option value="brave">Brave</option>
                            <option value="bufferoverun">BufferOverRun</option>
                            <option value="censys">Censys (API key required)</option>
                            <option value="certspotter">Certspotter</option>
                            <option value="criminalip">Criminal IP (API key required)</option>
                            <option value="crtsh">crt.sh</option>
                            <option value="dehashed">DeHashed (API key required)</option>
                            <option value="dnsdumpster">DNSDumpster (API key required)</option>
                            <option value="duckduckgo">DuckDuckGo</option>
                            <option value="fullhunt">FullHunt (API key required)</option>
                            <option value="github-code">GitHub Code (API token required)</option>
                            <option value="hackertarget">HackerTarget</option>
                            <option value="hunter">Hunter (API key required)</option>
                            <option value="hunterhow">HunterHow (API key required)</option>
                            <option value="intelx">Intelx (API key required)</option>
                            <option value="netlas">Netlas (API key required)</option>
                            <option value="onyphe">Onyphe (API key required)</option>
                            <option value="otx">OTX</option>
                            <option value="pentesttools">PentestTools (API key required)</option>
                            <option value="projectdiscovery">ProjectDiscovery (invite-only access)</option>
                            <option value="rapiddns">RapidDNS</option>
                            <option value="rocketreach">RocketReach (API key required)</option>
                            <option value="securityTrails">SecurityTrails (API key required)</option>
                            <option value="subdomaincenter">Subdomain Center</option>
                            <option value="subdomainfinderc99">Subdomain Finder C99</option>
                            <option value="tomba">Tomba (API key required)</option>
                            <option value="urlscan">URLScan</option>
                            <option value="virustotal">VirusTotal (API key required)</option>
                            <option value="yahoo">Yahoo (may return no results)</option>
                            <option value="whoisxml">WhoisXML (API key required)</option>
                            <option value="zoomeye">ZoomEye (API key required)</option>
                            <option value="venacus">Venacus (API key required)</option>
                        </select>

                        {checkedAdvanced && (
                            <>
                                <TextInput
                                    label="Start with result number X. (default 0)"
                                    type="number"
                                    {...form.getInputProps("startresult")}
                                />

                                <Checkbox
                                    label="Use Shodan to query discovered hosts."
                                    {...form.getInputProps("useshodan", {
                                        type: "checkbox",
                                    })}
                                />

                                <Checkbox
                                    label="DNS Lookup (Enable DNS server lookup)"
                                    {...form.getInputProps("dnslookup", {
                                        type: "checkbox",
                                    })}
                                />

                                <Checkbox
                                    label="DNS Brute (Perform a DNS brute force on the domain.)"
                                    {...form.getInputProps("dnsbrute", {
                                        type: "checkbox",
                                    })}
                                />

                                <Checkbox
                                    label="Virtual Host (Verify host name via DNS resolution and search for virtual hosts.)"
                                    {...form.getInputProps("virtualHost", {
                                        type: "checkbox",
                                    })}
                                />

                                <Checkbox
                                    label="Takeover (Check for takeovers.)"
                                    {...form.getInputProps("takeover", {
                                        type: "checkbox",
                                    })}
                                />
                            </>
                        )}

                        <br />

                        <Button type="submit">Start {title}</Button>

                        {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}

                        <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                    </Stack>
                </form>
            </RenderComponent>
        </>
    );
};

export default TheHarvester;
