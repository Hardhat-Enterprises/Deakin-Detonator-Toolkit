import { useState, useEffect, useCallback, useRef } from "react";
import { Alert, Button, Group, Modal, Radio, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import AskChatGPT from "../AskChatGPT/AskChatGPT";
import ChatGPTOutput from "../AskChatGPT/ChatGPTOutput";
import AskCohere from "../AskCohere/AskCohere";
import CohereOutput from "../AskCohere/CohereOutput";
import ArpanameInstallationModal from "./ArpanameInstallationModal";
import {
    ArpanameProcessError,
    checkArpanameAvailability,
    RunningArpanameProcess,
    startArpanameLookup,
} from "./arpanameProcess";

/**
 * Represents the form values for the Arpaname component.
 */
interface FormValuesType {
    ipAddress: string;
    ipType: "IPv4" | "IPv6";
}

const processErrorMessage = (error: unknown) => {
    if (error instanceof ArpanameProcessError && error.kind === "timeout") {
        return "Arpaname timed out and was terminated.";
    }
    if (error instanceof Error) return error.message;
    return String(error);
};

/**
 * ArpanameTool component for performing reverse DNS lookups on IP addresses.
 * This component provides a user interface for entering an IP address and
 * displaying the results of the arpaname command.
 * @returns JSX.Element The rendered ArpanameTool component
 */
const ArpanameTool = () => {
    const title = "Arpaname"; // Title of the tool displayed in the UI
    const description = "Perform reverse DNS lookups for IP addresses."; // Brief description of the tool's functionality
    const [loading, setLoading] = useState(false); // State variable to track if the process is currently loading
    const [output, setOutput] = useState(""); // State variable to store the output of the process
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(false); // State variable that indicates if the modal is opened.
    const [checkingAvailability, setCheckingAvailability] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string>(""); // State variable to store the error message
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [chatGPTResponse, setChatGPTResponse] = useState(""); //ChatGPT response
    const [cohereResponse, setCohereResponse] = useState(""); // Cohere response
    const [showAlert, setShowAlert] = useState(true);
    const [canCancel, setCanCancel] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const alertTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeLookup = useRef<RunningArpanameProcess | null>(null);
    const activeAvailabilityCheck = useRef<RunningArpanameProcess | null>(null);
    const lookupInProgress = useRef(false);
    const cancelRequested = useRef(false);
    const mounted = useRef(true);

    // Component Constants.
    const steps =
        "Step 1: Type in the target IP address\n" +
        "Step 2: Click lookup to run Arpaname.\n" +
        "Step 3: View the output block to see the results. ";
    const sourceLink = "https://www.kali.org/tools/bind9/#arpaname"; // Link to the source code (or Kali Tools).
    const tutorial = "https://hackmd.io/@zee-10/BkFVqUdHbe"; // Link to the official documentation/tutorial.

    // Check for the executable (not the package name) on component mount.
    useEffect(() => {
        mounted.current = true;
        let effectActive = true;
        let availabilityProcess: RunningArpanameProcess | null = null;

        void checkArpanameAvailability((process) => {
            availabilityProcess = process;
            if (!effectActive) {
                process.dispose();
                return;
            }
            activeAvailabilityCheck.current = process;
        })
            .then((isAvailable) => {
                if (!effectActive) return;
                setIsCommandAvailable(isAvailable);
                setOpened(!isAvailable);
            })
            .catch((error) => {
                if (!effectActive) return;
                console.error("Unable to check arpaname availability:", error);
                setIsCommandAvailable(false);
                setOpened(true);
            })
            .finally(() => {
                if (activeAvailabilityCheck.current === availabilityProcess) {
                    activeAvailabilityCheck.current = null;
                }
                if (effectActive) setCheckingAvailability(false);
            });

        // Set timeout to remove alert after 5 seconds on load.
        alertTimeout.current = setTimeout(() => {
            if (effectActive) setShowAlert(false);
        }, 5000);

        return () => {
            effectActive = false;
            mounted.current = false;
            if (alertTimeout.current) clearTimeout(alertTimeout.current);

            const availabilityCheck = activeAvailabilityCheck.current;
            activeAvailabilityCheck.current = null;
            availabilityCheck?.dispose();

            const lookup = activeLookup.current;
            activeLookup.current = null;
            lookup?.dispose();
            lookupInProgress.current = false;
            cancelRequested.current = false;
        };
    }, []);

    const handleShowAlert = () => {
        setShowAlert(true);
        if (alertTimeout.current) {
            clearTimeout(alertTimeout.current);
        }
        alertTimeout.current = setTimeout(() => {
            if (mounted.current) setShowAlert(false);
        }, 5000);
    };

    const form = useForm<FormValuesType>({
        initialValues: {
            ipAddress: "",
            ipType: "IPv4", //Default type used is IPv4
        },
    });

    /** Append new child-process data to the output. */
    const handleProcessData = useCallback((data: string) => {
        if (mounted.current) setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    /**
     * Handles the completion of the save operation.
     * Updates state to reflect that the output has been saved and disables further saving.
     */
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * Validates if the given input string is a valid IPv4 or IPv6 address.
     * @param {string} ip - The IP address string to be validated.
     * @returns {boolean} True if the input is a valid IP address, false otherwise.
     */
    const validateIPAddress = (ip: string, type: "IPv4" | "IPv6") => {
        const ipv4Pattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Pattern =
            /^(([0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}|(([0-9a-fA-F]{1,4}:){0,6}:([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})|::)$/;
        return type === "IPv4" ? ipv4Pattern.test(ip) : ipv6Pattern.test(ip);
    };

    /** Execute arpaname and wait for its actual close event. */
    const onSubmit = async (values: FormValuesType) => {
        if (lookupInProgress.current) return;
        if (!isCommandAvailable) {
            setErrorMessage("Arpaname is not installed.");
            setOpened(true);
            return;
        }
        if (!validateIPAddress(values.ipAddress, values.ipType)) {
            setErrorMessage(`Please enter a valid ${values.ipType} address.`);
            return;
        }

        lookupInProgress.current = true;
        setAllowSave(false);
        setHasSaved(false);
        setErrorMessage("");
        setLoading(true);
        setCanCancel(false);
        setCancelling(false);
        cancelRequested.current = false;

        let process: RunningArpanameProcess | null = null;
        try {
            process = startArpanameLookup(values.ipAddress, handleProcessData);
            activeLookup.current = process;
            setCanCancel(true);

            if (!mounted.current) {
                process.dispose();
                return;
            }

            const result = await process.completion;

            if (result.cancelled) {
                handleProcessData("\nProcess was manually terminated.");
            } else if (result.code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else {
                handleProcessData(
                    `\nProcess terminated with exit code: ${String(result.code)} and signal code: ${String(
                        result.signal
                    )}`
                );
            }
        } catch (error) {
            if (mounted.current) {
                handleProcessData(`\nError: ${processErrorMessage(error)}`);
                if (error instanceof ArpanameProcessError && error.kind === "spawn") {
                    setIsCommandAvailable(false);
                    setOpened(true);
                }
            }
        } finally {
            if (activeLookup.current === process) activeLookup.current = null;
            process?.dispose();
            lookupInProgress.current = false;
            cancelRequested.current = false;
            if (mounted.current) {
                setLoading(false);
                setCanCancel(false);
                setCancelling(false);
                setAllowSave(true);
                setHasSaved(false);
            }
        }
    };

    const cancelLookup = async () => {
        const process = activeLookup.current;
        if (!process || cancelRequested.current) return;
        cancelRequested.current = true;
        setCancelling(true);
        await process.cancel();
    };

    const handleAvailabilityChange = useCallback((isAvailable: boolean) => {
        if (!mounted.current) return;
        setIsCommandAvailable(isAvailable);
        if (isAvailable) setOpened(false);
    }, []);

    /** Clear command output and save state. */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, []);

    const lookupDisabled = checkingAvailability || !isCommandAvailable || loading;

    return (
        <RenderComponent
            title={title}
            description={description}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
            {!checkingAvailability && (
                <ArpanameInstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    onAvailabilityChange={handleAvailabilityChange}
                />
            )}
            <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                <Stack>
                    <Group position="right">
                        {!showAlert && (
                            <Button type="button" onClick={handleShowAlert} size="xs" variant="outline" color="gray">
                                Show Disclaimer
                            </Button>
                        )}
                    </Group>
                    {loading && (
                        <Modal
                            opened={loading}
                            onClose={() => {}}
                            centered
                            withCloseButton={false}
                            overlayOpacity={0.5}
                            overlayBlur={3}
                            zIndex={2000}
                            size="lg"
                        >
                            <p style={{ fontSize: "18px", textAlign: "center" }}>
                                The process is running. You can cancel it below:
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                color="red"
                                onClick={cancelLookup}
                                disabled={!canCancel || cancelling}
                                size="xl"
                                fullWidth
                                style={{ marginTop: "20px" }}
                            >
                                {cancelling ? "Cancelling..." : "Cancel Process"}
                            </Button>
                        </Modal>
                    )}
                    {showAlert && (
                        <Alert title="Warning: Potential Risks" color="red">
                            This tool is used to perform reverse DNS lookups, use with caution and only on networks you
                            own or have explicit permission to test.
                        </Alert>
                    )}
                    <TextInput label="IP address" required {...form.getInputProps("ipAddress")} />
                    {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
                    <Radio.Group
                        value={form.values.ipType}
                        onChange={(value) => form.setFieldValue("ipType", value as "IPv4" | "IPv6")}
                        label="Select IP Type"
                        required
                    >
                        <Radio value="IPv4" label="IPv4" />
                        <Radio value="IPv6" label="IPv6" />
                    </Radio.Group>
                    {!checkingAvailability && !isCommandAvailable && !opened && (
                        <Button type="button" variant="outline" onClick={() => setOpened(true)} disabled={loading}>
                            Install Component
                        </Button>
                    )}
                    <Button type="submit" disabled={lookupDisabled}>
                        Lookup
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
                    <AskCohere toolName={title} output={output} setCohereResponse={setCohereResponse} />
                    {cohereResponse && (
                        <div style={{ marginTop: "20px" }}>
                            <h3>Cohere Response:</h3>
                            <CohereOutput output={cohereResponse} />
                        </div>
                    )}
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default ArpanameTool;
