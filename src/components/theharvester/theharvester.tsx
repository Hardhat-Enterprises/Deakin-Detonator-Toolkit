import { Button, Checkbox, Stack, Switch, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useEffect, useState } from "react";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";

/**
 * Values submitted by the theHarvester form.
 *
 * Number inputs can temporarily contain an empty string while the user edits
 * them, so the two numeric fields accept both number and string values.
 */
interface FormValuesType {
    domain: string;
    resultLimit: number | string;
    source: string;
    startresult: number | string;
    useshodan: boolean;
    dnslookup: boolean;
    dnsbrute: boolean;
    virtualHost: boolean;
    takeover: boolean;
}

/**
 * The theHarvester interface.
 *
 * Fixes included for issue #1581 and PR #1674:
 * - Uses the correct resultLimit and virtualHost form field names.
 * - Passes -l and -S values as separate command arguments.
 * - Removes unsupported source entries and identifies sources needing keys.
 * - Keeps the running/cancel overlay visible until the child process exits.
 * - Avoids capturing stale allowSave state in the output callback.
 */
const TheHarvester = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [checkedAdvanced, setCheckedAdvanced] = useState(false);
    const [pid, setPid] = useState("");
    const [opened, setOpened] = useState(true);
    const [loadingModal, setLoadingModal] = useState(true);
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    const title = "The Harvester";
    const description =
        "A tool for gathering subdomain names, e-mail addresses, virtual hosts, open ports/banners, and employee names from different public sources.";
    const steps =
        "Step 1: Enter a valid domain to be harvested.\n" +
        "       Example: kali.org\n" +
        "Step 2: Enter the result limit. The default is 500.\n" +
        "Step 3: Select a supported source.\n" +
        "Step 4: Click Start The Harvester.\n" +
        "Step 5: Review or save the command output below.\n" +
        "Switch to Advanced Mode for additional options.";
    const sourceLink = "https://gitlab.com/kalilinux/packages/theharvester";
    const tutorial =
        "https://docs.google.com/document/d/1LPb5otKZQK-hx8dy2f_isR0iTcdjbqGS/edit?usp=sharing&ouid=110009021884912956761&rtpof=true&sd=true";
    const dependencies = ["theHarvester"];

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

    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setOpened(!isAvailable);
                setLoadingModal(false);
            })
            .catch((error) => {
                console.error("Unable to check theHarvester availability:", error);
                setLoadingModal(false);
            });
    }, []);

    /**
     * Appends each stdout or stderr chunk without reading allowSave from a
     * captured callback closure. Setting true repeatedly is safe because React
     * ignores state updates where the value has not changed.
     */
    const handleProcessData = useCallback((data: string) => {
        if (!data) {
            return;
        }

        setOutput((previousOutput) => (previousOutput ? `${previousOutput}\n${data}` : data));
        setAllowSave(true);
    }, []);

    /**
     * Ends the running state only when the child process actually closes.
     * runCommandGetPidAndOutput returns after spawning, not after completion.
     */
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("Process completed successfully.");
            } else if (signal === 15) {
                handleProcessData("Process was manually terminated.");
            } else {
                handleProcessData(`Process terminated with exit code ${code} and signal ${signal}.`);
            }

            setPid("");
            setLoading(false);
            setAllowSave(true);
        },
        [handleProcessData]
    );

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * Validates the form, builds the CLI argument array, and starts
     * theHarvester. Every flag and value is intentionally stored as its own
     * array item because Tauri passes the array directly to the command.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setPid("");
        setOutput("");
        setAllowSave(false);
        setHasSaved(false);

        const domain = values.domain.trim();
        const source = values.source.trim();

        // A blank limit uses the documented default instead of producing -l 0.
        const rawResultLimit = String(values.resultLimit).trim();
        const resultLimit = rawResultLimit === "" ? 500 : Number(rawResultLimit);

        if (!domain) {
            setOutput("Please enter a domain before starting theHarvester.");
            setLoading(false);
            setAllowSave(true);
            return;
        }

        if (!source) {
            setOutput("Please select a source before starting theHarvester.");
            setLoading(false);
            setAllowSave(true);
            return;
        }

        if (!Number.isFinite(resultLimit) || resultLimit <= 0) {
            setOutput("The result limit must be a number greater than zero.");
            setLoading(false);
            setAllowSave(true);
            return;
        }

        const args = ["-d", domain, "-l", String(Math.trunc(resultLimit)), "-b", source];

        if (checkedAdvanced) {
            const rawStartResult = String(values.startresult).trim();
            const startResult = rawStartResult === "" ? 0 : Number(rawStartResult);

            if (!Number.isFinite(startResult) || startResult < 0) {
                setOutput("The start-result value must be zero or a positive number.");
                setLoading(false);
                setAllowSave(true);
                return;
            }

            // Fix for #1581: -S and its value must be separate arguments.
            if (startResult > 0) {
                args.push("-S", String(Math.trunc(startResult)));
            }

            if (values.useshodan) {
                args.push("-s");
            }

            if (values.dnslookup) {
                args.push("-n");
            }

            if (values.dnsbrute) {
                args.push("-c");
            }

            if (values.virtualHost) {
                args.push("-v");
            }

            if (values.takeover) {
                args.push("-t");
            }
        }

        // Show the exact command immediately; streamed output is appended below it.
        setOutput(`$ theHarvester ${args.join(" ")}`);

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "theHarvester",
                args,
                handleProcessData,
                handleProcessTermination
            );

            setPid(result.pid);

            /*
             * Do not call setLoading(false) or replace output here.
             * The helper resolves as soon as the process is spawned, while the
             * termination callback handles the real end of the process.
             */
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "theHarvester failed to start.";

            setOutput((previousOutput) =>
                previousOutput ? `${previousOutput}\n\nError: ${message}` : `Error: ${message}`
            );
            setPid("");
            setLoading(false);
            setAllowSave(true);
        }
    };

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
                            min={1}
                            {...form.getInputProps("resultLimit")}
                        />

                        <label>Source</label>
                        <select required {...form.getInputProps("source")}>
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
                                    label="Start with result number X (default 0)"
                                    type="number"
                                    min={0}
                                    {...form.getInputProps("startresult")}
                                />

                                <Checkbox
                                    label="Use Shodan to query discovered hosts."
                                    {...form.getInputProps("useshodan", {
                                        type: "checkbox",
                                    })}
                                />

                                <Checkbox
                                    label="DNS Lookup (enable DNS server lookup)"
                                    {...form.getInputProps("dnslookup", {
                                        type: "checkbox",
                                    })}
                                />

                                <Checkbox
                                    label="DNS Brute (perform a DNS brute force on the domain)"
                                    {...form.getInputProps("dnsbrute", {
                                        type: "checkbox",
                                    })}
                                />

                                <Checkbox
                                    label="Virtual Host (verify host names through DNS resolution and search for virtual hosts)"
                                    {...form.getInputProps("virtualHost", {
                                        type: "checkbox",
                                    })}
                                />

                                <Checkbox
                                    label="Takeover (check for takeovers)"
                                    {...form.getInputProps("takeover", {
                                        type: "checkbox",
                                    })}
                                />
                            </>
                        )}

                        <br />

                        <Button type="submit" disabled={loading}>
                            Start {title}
                        </Button>

                        {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}

                        <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                    </Stack>
                </form>
            </RenderComponent>
        </>
    );
};

export default TheHarvester;
