import { useState, useEffect, useCallback } from "react";
import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";
import AskChatGPT from "../AskChatGPT/AskChatGPT";
import ChatGPTOutput from "../AskChatGPT/ChatGPTOutput";

/**
 * Represents the form values for the Subjack component.
 */
interface FormValuesType {
    targetDomain: string;
    wordlist: string;
}

/**
 * Validates if the provided domain is in a valid format.
 */
const isValidDomain = (domain: string): boolean => {
    const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]+)+)$/;
    return domainRegex.test(domain);
};

/**
 * Validates if the main domain resolves via DNS using a browser-compatible fetch call.
 */
const isDomainResolvable = async (domain: string): Promise<boolean> => {
    try {
        const response = await fetch(`https://dns.google/resolve?name=${domain}`);
        const data = await response.json();

        if (data && data.Answer && data.Answer.length > 0) {
            console.log(`DNS lookup for ${domain}:`, data.Answer);
            return true;
        } else {
            console.error(`DNS lookup failed for ${domain}`);
            return false;
        }
    } catch (error) {
        console.error(`Error while resolving domain ${domain}:`, error);
        return false;
    }
};

/**
 * The Subjack component.
 */
function Subjack() {
    // State variables
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [chatGPTResponse, setChatGPTResponse] = useState("");
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);

    // Component details
    const title = "Subjack";
    const description =
        "Subjack is a tool to detect subdomain takeovers. It identifies vulnerable subdomains that could be hijacked.";
    const steps =
        "Step 1: Enter the target domain.\n" +
        "Step 2: Provide the path to a wordlist containing subdomains.\n" +
        "Step 3: Run the Subjack scan and review results.";
    const sourceLink = "https://github.com/haccer/subjack";
    const tutorial = "https://github.com/haccer/subjack";
    const dependencies = ["subjack"];

    // Form handling
    const form = useForm<FormValuesType>({
        initialValues: {
            targetDomain: "",
            wordlist: "",
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

    /**
     * Processes and updates scan output.
     */
    const handleProcessData = useCallback(
        (data: string) => {
            const targetDomain = form.values.targetDomain;
            const lines = data.split("\n").map((line) => {
                if (line.startsWith("[Not Vulnerable]") || line.startsWith("[Vulnerable]")) {
                    const parts = line.split(" ").filter(Boolean);
                    const status = parts[0];
                    const subdomain = parts.slice(1).join(" ").trim();

                    if (!subdomain.includes(".")) {
                        return `${status} ${subdomain}.${targetDomain}`;
                    }
                }
                return line;
            });

            setOutput((prevOutput) => prevOutput + "\n" + lines.join("\n"));
        },
        [form.values.targetDomain]
    );

    /**
     * Handles process termination.
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

            setTimeout(() => {
                setLoading(false);
            }, 5000);
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    /**
     * Acknowledges file save completion.
     */
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * Handles form submission and initiates Subjack scan.
     */
    const onSubmit = async (values: FormValuesType) => {
        if (!isValidDomain(values.targetDomain)) {
            setOutput("Error: Invalid domain format. Please enter a valid domain.");
            return;
        }

        const resolvable = await isDomainResolvable(values.targetDomain);
        if (!resolvable) {
            setOutput("Error: The main domain does not resolve to a valid IP address.");
            return;
        }

        setLoading(true);
        setAllowSave(false);

        const args: string[] = [];
        args.push("-d", values.targetDomain);
        args.push("-w", values.wordlist);
        args.push("-c", "/usr/share/subjack/fingerprints.json");
        args.push("-v");
        args.push("-ssl");

        try {
            const { pid, output } = await CommandHelper.runCommandGetPidAndOutput(
                "subjack",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(pid);
            setOutput(output);
        } catch (error: any) {
            setOutput(`Error: ${error.message}`);
            setLoading(false);
            setAllowSave(true);
        }
    };

    /**
     * Clears the output console.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
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
                    ></InstallationModal>
                )}
                <form onSubmit={form.onSubmit(onSubmit)}>
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <Stack>
                        <TextInput label="Target Domain" required {...form.getInputProps("targetDomain")} />
                        <TextInput label="Wordlist Path" required {...form.getInputProps("wordlist")} />
                        <Button type="submit" disabled={loading} style={{ alignSelf: "center" }}>
                            Start Subjack
                        </Button>
                        {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                        <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                        <AskChatGPT toolName={title} output={output} setChatGPTResponse={setChatGPTResponse} />
                        {chatGPTResponse && (
                            <div style={{ marginTop: "20px" }}>
                                <h3>ChatGPT Response:</h3>
                                <ChatGPTOutput output={chatGPTResponse} />
                            </div>
                        )}
                    </Stack>
                </form>
            </RenderComponent>
        </>
    );
}

export default Subjack;
