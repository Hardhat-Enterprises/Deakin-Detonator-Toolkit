import { useState, useEffect, useCallback, useMemo } from "react";
import { Alert, Button, Card, Group, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

/** Parse common fields from raw whois */
function parseWhois(raw: string) {
    const lines = raw.split(/\r?\n/);
    const get = (rx: RegExp) => (lines.find((l) => rx.test(l)) || "").split(":").slice(1).join(":").trim();

    const data: Record<string, string | string[]> = {
        Domain: get(/^Domain(Name)?\s*:/i),
        Registrar: get(/^Registrar\s*:/i) || get(/^Sponsoring Registrar\s*:/i),
        Registrant: get(/^Registrant(?: Name)?\s*:/i),
        "Creation Date": get(/^(Creation Date|Registered On)\s*:/i),
        "Updated Date": get(/^(Updated Date|Last Updated On)\s*:/i),
        "Expiry Date": get(/^(Registry Expiry Date|Expiration Date|Expires On)\s*:/i),
        Status: lines.filter((l) => /Status\s*:/i.test(l)).map((l) => l.split(":").slice(1).join(":").trim()),
        "Name Servers": lines
            .filter((l) => /Name Server\s*:/i.test(l))
            .map((l) => l.split(":").slice(1).join(":").trim()),
        DNSSEC: get(/^DNSSEC\s*:/i),
        Country: get(/^Country\s*:/i),
    };

    const notFound = /no match|not found|status:\s*free|no entries found/i.test(raw);
    const invalid = /invalid|malformed|bad request/i.test(raw);
    return { data, notFound, invalid };
}

/**
 * Represents the form values for the Whois component.
 */
interface FormValuesType {
    targetURL: string;
}

/* --- Simple validators (no new deps) --- */
const hasSchemeOrPath = (s: string) => /^\s*[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(s) || /[\/?#]/.test(s);

const ipv4Re = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

const ipv6Re = /^(\[)?([0-9A-Fa-f]{0,4}:){2,7}[0-9A-Fa-f]{0,4}(\])?$/;

const fqdnRe = /^(?=.{1,253}$)(?!-)([A-Za-z0-9-]{1,63}\.)+[A-Za-z]{2,63}$/;

/**
 * The Whois component.
 * @returns The Whois component.
 */
function Whois() {
    // Component state variables
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [pid, setPid] = useState("");
    const [friendlyError, setFriendlyError] = useState<string | null>(null);

    // Component Constants
    const title = "Whois";
    const description =
        "Whois is a query and response protocol that is used for querying databases that store an internet resource's registered users or assignees.";
    const steps =
        "Step 1: Provide the domain name or IP address to look up (e.g., example.com or 93.184.216.34).\n" +
        "Step 2: Start the lookup to gather registration information.\n" +
        "Step 3: Review the output.\n";
    const sourceLink = "https://github.com/weppos/whois";
    const tutorial = "https://docs.google.com/document/d/1n-QxEXGDOdOlYZ13OGQPV7QdnOEsJF4vPtObGy0vYbs/edit?usp=sharing";
    const dependencies = ["whois"];

    // Form hook to handle form input — validation ONLY here
    const form = useForm<FormValuesType>({
        initialValues: { targetURL: "" },
        validate: {
            targetURL: (value) => {
                const raw = (value || "").trim();
                if (!raw) return "Please enter a domain or IP address.";
                if (hasSchemeOrPath(raw)) return "Enter only a domain or IP (no http/https, no paths/queries).";
                const stripped = raw.replace(/^\[|\]$/g, ""); // allow [IPv6]
                if (ipv4Re.test(stripped)) return null;
                if (ipv6Re.test(raw)) return null; // accepts bracketed or bare IPv6
                if (fqdnRe.test(stripped)) return null;
                return "Invalid domain or IP address.";
            },
        },
    });

    // Check command availability
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

    /** Append process data to output */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => (prevOutput ? prevOutput + "\n" : "") + data);
    }, []);

    /** Handle termination: friendly errors instead of codes */
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            let raw = output ?? "";
            const lowered = raw.toLowerCase();

            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
                setFriendlyError(null);
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
                setFriendlyError(null);
            } else {
                // Friendly mapping
                if (/no match|not found|status:\s*free|no entries found/.test(lowered)) {
                    setFriendlyError("Not found");
                } else if (/invalid|malformed|bad request/.test(lowered)) {
                    setFriendlyError("Invalid input");
                } else {
                    setFriendlyError("Lookup failed. Please try again.");
                }
            }

            setPid("");
            setLoading(false);
        },
        [handleProcessData, output]
    );

    /** Submit */
    const onSubmit = async (values: FormValuesType) => {
        setAllowSave()false;
        setHasSaved(false);
        setLoading(true);
        setOutput("");
        setFriendlyError(null);

        // Build args for whois
        const arg = values.targetURL.trim().replace(/^\[|\]$/g, ""); // strip [] for IPv6 when passing to whois
        const args = [arg];

        CommandHelper.runCommandGetPidAndOutput("whois", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
                setOutput(output);
                setPid(pid);
                setAllowSave(true);
            })
            .catch((error) => {
                // Friendly catch-all
                setFriendlyError("Lookup failed. Please try again.");
                setOutput(error?.message || "");
                setLoading(false);
            });
    };

    /** Handles the completion of output saving */
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /** Clears console output */
    const clearOutput = () => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
        setFriendlyError(null);
    };

    // Parse for clean summary
    const parsed = useMemo(() => parseWhois(output), [output]);

    // Render component
    return (
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
                    <TextInput
                        label="Domain or IP address"
                        placeholder="example.com or 93.184.216.34"
                        required
                        {...form.getInputProps("targetURL")}
                    />
                    <Button type={"submit"}>Start {title}</Button>

                    {/* Friendly error */}
                    {friendlyError && (
                        <Alert color="red" title="Whois">
                            {friendlyError}
                        </Alert>
                    )}

                    {/* Clean, structured summary (only if we have output and no error) */}
                    {!friendlyError && output && (
                        <Card withBorder padding="md" radius="md">
                            <Title order={5} mb="sm">
                                Summary
                            </Title>
                            <Table withTableBorder withColumnBorders>
                                <Table.Tbody>
                                    {Object.entries(parsed.data).map(([k, v]) => {
                                        const val = Array.isArray(v)
                                            ? (v as string[]).filter(Boolean).join("\n")
                                            : (v as string);
                                        if (!val) return null;
                                        return (
                                            <Table.Tr key={k}>
                                                <Table.Td width="30%">
                                                    <Text fw={600}>{k}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text style={{ whiteSpace: "pre-wrap" }}>{val}</Text>
                                                </Table.Td>
                                            </Table.Tr>
                                        );
                                    })}
                                </Table.Tbody>
                            </Table>
                        </Card>
                    )}

                    {/* Raw output (bigger, resizable, fullscreen; starts at top) */}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} title="Raw output" />

                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                </Stack>
            </form>
        </RenderComponent>
    );
}
export default Whois;
