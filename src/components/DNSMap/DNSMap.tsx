import { Button, Stack, TextInput, Switch, Alert, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect, useRef } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the DNSMap component.
 */
interface FormValuesType {
    domain: string;
    delay: number;
    wordlistPath: string;
    csvResultsFile: string;
    ipsToIgnore: string;
}

/**
 * The DNSMap component.
 * @returns The DNSMap component.
 */
const DNSMap = () => {
    // Components state variables
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [checkedAdvanced, setCheckedAdvanced] = useState(false);
    const [Pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [showAlert, setShowAlert] = useState(true);

    // Validation/correction messages
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [correctionMsg, setCorrectionMsg] = useState<string | null>(null);

    const alertTimeout = useRef<NodeJS.Timeout | null>(null);

    // Components Constant Variables
    const title = "Dnsmap";
    const description_userguide =
        "DNSMap scans a domain for common subdomains using a built-in or an external wordlist (if specified using -w option). " +
        "The internal wordlist has around 1000 words in English and Spanish as ns1, firewall services and smtp. " +
        "So it will be possible to search for smtp.example.com inside example.com automatically.\n\n";

    const steps =
        "Step 1: Enter a valid domain to be mapped.\n" +
        " Eg: google.com\n\n" +
        "Step 2: Enter a delay between requests. Default is 10 (milliseconds). Can be left blank.\n" +
        " Eg: 10\n\n" +
        "Step 3: Click 'Start Mapping' to commence the DNSMap tool's operation.\n\n" +
        "Step 4: View the Output block below to view the results of the tool's execution.\n\n" +
        "Switch to Advanced Mode for further options.";

    const sourceLink = "https://www.kali.org/tools/dnsmap/";
    const tutorial = "https://docs.google.com/document/d/15iZ-USnXOVe-zLBLC_ROp0OTqXO_Nh7WtGO6YHfqQsc/edit?usp=sharing";
    const dependencies = ["dnsmap"];

    // ---------- Domain sanitising / validation / correction ----------
    const COMMON_TLDS = [
        "com",
        "net",
        "org",
        "edu",
        "gov",
        "io",
        "co",
        "au",
        "uk",
        "de",
        "fr",
        "in",
        "us",
        "ca",
        "nz",
        "info",
        "biz",
        "dev",
        "app",
        "ai",
        "me",
        "tv",
        "xyz",
        "site",
        "online",
        "shop",
        "store",
        "tech",
        "cloud",
        "systems",
        "solutions",
    ];

    const TLD_FIXES: Record<string, string> = {
        con: "com",
        cpm: "com",
        ocm: "com",
        cim: "com",
        comm: "com",
        coom: "com",
        xom: "com",
    };

    const KNOWN_DOMAINS = [
        "google.com",
        "youtube.com",
        "facebook.com",
        "github.com",
        "kali.org",
        "wikipedia.org",
        "reddit.com",
        "instagram.com",
        "linkedin.com",
        "amazon.com",
        "apple.com",
        "microsoft.com",
        "netflix.com",
        "deakin.edu.au",
        "twitter.com",
        "x.com",
    ];

    const sanitiseDomain = (raw: string): string => {
        let d = raw.trim().toLowerCase();
        d = d.replace(/^https?:\/\//, ""); // remove protocol
        d = d.split("/")[0]; // drop path/query
        d = d.replace(/[\s\u200B-\u200D\uFEFF]/g, ""); // strip zero-width/whitespace
        return d;
    };

    const isValidDomainSyntax = (domain: string): boolean => {
        if (!domain || domain.length > 253) return false;
        const parts = domain.split(".");
        if (parts.length < 2) return false;

        const tld = parts[parts.length - 1];
        if (!/^[a-z]{2,24}$/.test(tld)) return false;

        for (const label of parts) {
            if (label.length < 1 || label.length > 63) return false;
            if (!/^[a-z0-9-]+$/.test(label)) return false;
            if (label.startsWith("-") || label.endsWith("-")) return false;
        }
        return true;
    };

    const levenshtein = (a: string, b: string): number => {
        const m = a.length,
            n = b.length;
        const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
            }
        }
        return dp[m][n];
    };

    const correctDomainIfObvious = (domain: string): { corrected?: string; reason?: string } => {
        let d = domain;
        const parts = d.split(".");

        // Fix obvious TLD mistakes
        if (parts.length >= 2) {
            const tld = parts[parts.length - 1];
            if (TLD_FIXES[tld]) {
                const fixed = [...parts.slice(0, -1), TLD_FIXES[tld]].join(".");
                return { corrected: fixed, reason: `Replaced ".${tld}" with ".${TLD_FIXES[tld]}"` };
            }
            if (tld.endsWith(",")) {
                const fixed = [...parts.slice(0, -1), tld.replace(/,+$/, "")].join(".");
                if (isValidDomainSyntax(fixed)) {
                    return { corrected: fixed, reason: "Removed trailing comma from TLD" };
                }
            }
        }

        // If TLD is one edit away from a common TLD, fix
        if (parts.length >= 2) {
            const tld = parts[parts.length - 1];
            let bestTld = tld;
            let bestDist = 99;
            for (const ct of COMMON_TLDS) {
                const dist = levenshtein(tld, ct);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestTld = ct;
                }
            }
            if (bestDist > 0 && bestDist <= 1) {
                const fixed = [...parts.slice(0, -1), bestTld].join(".");
                return { corrected: fixed, reason: `Did you mean ".${bestTld}"?` };
            }
        }

        // Known popular domains by distance (<=2 edits)
        let best = d;
        let bestDist = 99;
        for (const kd of KNOWN_DOMAINS) {
            const dist = levenshtein(d, kd);
            if (dist < bestDist) {
                bestDist = dist;
                best = kd;
            }
        }
        if (bestDist <= 2 && best !== d) {
            return { corrected: best, reason: `Corrected to popular domain "${best}"` };
        }

        return {};
    };

    // Form Hook with validation
    const form = useForm<FormValuesType>({
        initialValues: {
            domain: "",
            delay: 10,
            wordlistPath: "",
            csvResultsFile: "",
            ipsToIgnore: "",
        },
        validate: {
            domain: (value) => {
                const raw = value ?? "";
                const s = sanitiseDomain(raw);

                if (!s) return "Please enter a domain (e.g., example.com).";

                if (!isValidDomainSyntax(s)) {
                    const { corrected } = correctDomainIfObvious(s);
                    if (corrected && isValidDomainSyntax(corrected)) {
                        return null; // soft-pass; we'll set corrected on submit and stop
                    }
                    return "That doesn't look like a valid domain (e.g., deakin.edu.au, google.com).";
                }
                return null;
            },
            delay: (v) => (v !== undefined && v !== null && v < 0 ? "Delay must be 0 or greater." : null),
            ipsToIgnore: (v) => {
                if (!v) return null;
                const ips = v
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean);
                if (ips.length > 5) return "Maximum 5 IPs allowed.";
                const ipRegex = /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/;
                for (const ip of ips) {
                    if (!ipRegex.test(ip)) return `Invalid IP address: ${ip}`;
                }
                return null;
            },
        },
    });

    // Command availability + disclaimer timer
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

        alertTimeout.current = setTimeout(() => {
            setShowAlert(false);
        }, 5000);

        return () => {
            if (alertTimeout.current) {
                clearTimeout(alertTimeout.current);
            }
        };
    }, []);

    const handleShowAlert = () => {
        setShowAlert(true);
        if (alertTimeout.current) {
            clearTimeout(alertTimeout.current);
        }
        alertTimeout.current = setTimeout(() => {
            setShowAlert(false);
        }, 5000);
    };

    // Append new data to output
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => (prevOutput ? prevOutput + "\n" + data : data));
    }, []);

    // Process termination handler
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
            setHasSaved(false);
        },
        [handleProcessData]
    );

    // Saving complete
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, []);

    /**
     * onSubmit with "stop after autocorrect":
     * - If we autocorrect, we set the corrected value, show yellow note, and RETURN (no run).
     * - Only run dnsmap when no correction occurred in this submit.
     */
    const onSubmit = async (values: FormValuesType) => {
        setErrorMsg(null);
        setCorrectionMsg(null);

        const rawDomain = values.domain ?? "";
        const sanitised = sanitiseDomain(rawDomain);

        const tryAutocorrect = () => {
            const { corrected, reason } = correctDomainIfObvious(sanitised);
            if (corrected && isValidDomainSyntax(corrected)) {
                form.setFieldValue("domain", corrected);
                setCorrectionMsg(`Auto-corrected domain: "${sanitised}" → "${corrected}". ${reason ?? ""}`);
                return true;
            }
            return false;
        };

        // Invalid syntax → attempt correction then stop; else error
        if (!isValidDomainSyntax(sanitised)) {
            if (tryAutocorrect()) return;
            setErrorMsg(
                `Invalid domain "${rawDomain}". Please enter a valid domain like "example.com" or "deakin.edu.au".`
            );
            return;
        }

        // Valid syntax → maybe fix trivial typo; if corrected, stop this submit
        {
            const { corrected, reason } = correctDomainIfObvious(sanitised);
            if (corrected && corrected !== sanitised && isValidDomainSyntax(corrected)) {
                form.setFieldValue("domain", corrected);
                setCorrectionMsg(`Auto-corrected domain: "${sanitised}" → "${corrected}". ${reason ?? ""}`);
                return;
            } else if (sanitised !== rawDomain) {
                // normalise (strip protocol/paths). This isn't a semantic correction; allow run.
                form.setFieldValue("domain", sanitised);
            }
        }

        // Final guard
        const finalDomain = sanitiseDomain(form.values.domain);
        if (!isValidDomainSyntax(finalDomain)) {
            setErrorMsg(`Invalid domain "${form.values.domain}". Please enter a valid domain like "example.com".`);
            return;
        }

        // Build args & run
        setAllowSave(false);
        setLoading(true);
        setOutput("");

        const args: string[] = [finalDomain, "-d", String(values.delay ?? 10)];
        if (values.wordlistPath) args.push("-w", values.wordlistPath);
        if (values.csvResultsFile) args.push("-c", values.csvResultsFile);
        if (values.ipsToIgnore) {
            const ips = values.ipsToIgnore
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean)
                .slice(0, 5);
            if (ips.length > 0) args.push("-i", ips.join(","));
        }

        const filteredArgs = args.filter((a) => a !== "");

        CommandHelper.runCommandGetPidAndOutput("dnsmap", filteredArgs, handleProcessData, handleProcessTermination)
            .then(({ pid, output }) => {
                setPid(pid);
                if (output) setOutput(output);
            })
            .catch((error: any) => {
                setLoading(false);
                setOutput(`Error: ${error?.message ?? String(error)}`);
            });
    };

    return (
        <RenderComponent
            title={title}
            description={description_userguide}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description_userguide}
                    dependencies={dependencies}
                />
            )}

            <form onSubmit={form.onSubmit(onSubmit)}>
                {LoadingOverlayAndCancelButton(loading, Pid)}

                <Stack>
                    <Group position="right">
                        {!showAlert && (
                            <Button onClick={handleShowAlert} size="xs" variant="outline" color="gray">
                                Show Disclaimer
                            </Button>
                        )}
                    </Group>

                    {showAlert && (
                        <Alert title="Warning: Potential Risks" color="red">
                            This tool is used to perform DNS enumeration, use with caution and only on targets you own
                            or have explicit permission to test.
                        </Alert>
                    )}

                    {correctionMsg && (
                        <Alert title="Note" color="yellow">
                            {correctionMsg}
                        </Alert>
                    )}

                    {errorMsg && (
                        <Alert title="Invalid domain" color="red">
                            {errorMsg}
                        </Alert>
                    )}

                    <Switch
                        size="md"
                        label="Advanced Mode"
                        checked={checkedAdvanced}
                        onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                    />

                    <TextInput
                        label={"Domain"}
                        required
                        placeholder="example.com"
                        {...form.getInputProps("domain")}
                        onBlur={(e) => {
                            const s = sanitiseDomain(e.currentTarget.value || "");
                            if (s && s !== e.currentTarget.value) form.setFieldValue("domain", s);
                        }}
                    />

                    <TextInput
                        label={"Random delay between requests (default 10) (milliseconds)"}
                        type="number"
                        {...form.getInputProps("delay")}
                    />

                    {checkedAdvanced && (
                        <>
                            <TextInput
                                label={"Path to external wordlist file"}
                                placeholder="/usr/share/wordlists/dnsmap.txt"
                                {...form.getInputProps("wordlistPath")}
                            />
                            <TextInput
                                label={"CSV results file name (optional)"}
                                placeholder="results.csv"
                                {...form.getInputProps("csvResultsFile")}
                            />
                            <TextInput
                                label={"IP addresses to ignore (comma-separated, up to 5 IPs)"}
                                placeholder="1.2.3.4, 5.6.7.8"
                                {...form.getInputProps("ipsToIgnore")}
                            />
                        </>
                    )}

                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}

                    <Button type={"submit"}>Start Mapping</Button>

                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default DNSMap;
