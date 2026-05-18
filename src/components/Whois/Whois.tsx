import { useState, useEffect, useCallback } from "react";
import { Button, Checkbox, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

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

    /** Append process output */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    /** Handle process termination */
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
        },
        [handleProcessData]
    );

    /**
     * Handles form submission for the Whois component.
     * ONLY runs when inputs are valid (form.onSubmit handles validation).
     */
    const onSubmit = async (values: FormValuesType) => {
        setAllowSave(false);
        setHasSaved(false);
        setOutput("");
        setLoading(true);

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
                setOutput(error.message);
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
    };

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
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}
export default Whois;
