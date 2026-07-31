import { useState, useCallback, useEffect } from "react";
import { Stepper, Button, TextInput, Select, Switch, Stack, Grid, Alert } from "@mantine/core";
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
import PentestGPT from "../PentestGPT/PentestGPT";

/**
 * Represents the form values for the Nmap component.
 */
interface FormValuesType {
    target: string;
    ports: string;
    scanType: string;
    timing: string;
    osDetection: boolean;
    versionDetection: boolean;
    scriptScan: string;
    aggressive: boolean;
    verbose: boolean;
    noPortScan: boolean;
    enableIPv6: boolean;
}

/**
 * Validation components.
 */

// Normalize target value.
function normalizeTarget(value: unknown): string {
    return String(value ?? "").trim();
}

// IPv4 validation.
function isValidIPv4(ip: string): boolean {
    const parts = ip.split(".");
    if (parts.length !== 4) return false;
    for (const p of parts) {
        if (p === "") return false;
        if (!/^\d+$/.test(p)) return false;
        const n = Number(p);
        if (n < 0 || n > 255) return false;
    }
    return true;
}

// IPv6 Validation.
function isValidIPv6(ipRaw: string): boolean {
    if (!ipRaw) return false;

    // Remove optional zone index.
    let ip = ipRaw.split("%")[0];

    // Strips surrounding brackets if included.
    if (ip.startsWith("[") && ip.endsWith("]")) {
        ip = ip.slice(1, -1);
    }

    // Checks the input for invalid characters.
    if (!/^[0-9A-Fa-f:\.]+$/.test(ip)) return false;

    // Checks whether the IPv6 address can be constructed.
    try {
        new URL(`http://[${ip}]`);
        return true;
    } catch {
        return false;
    }
}

// Hostname validation patterns.
const hostnameLabel = /^[a-zA-Z0-9-]{1,63}$/;
const hostnameFqdn = /^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/;

// Hostname validation.
function isValidHostname(name: string): boolean {
    return hostnameLabel.test(name) || hostnameFqdn.test(name);
}

// Validate ports string.
// Allows for empty, or comma-separated list of ports or ranges.
function validatePortsString(portsValue: string): string | null {
    const val = String(portsValue ?? "").trim();
    if (val === "") return null;

    // Split by commas.
    const tokens = val.split(",");
    for (const tok of tokens) {
        const t = tok.trim();
        if (t === "") return "Ports string contains an empty token!";

        const rangeMatch = /^(\d+)-(\d+)$/.exec(t);
        if (rangeMatch) {
            const start = Number(rangeMatch[1]);
            const end = Number(rangeMatch[2]);
            if (!Number.isFinite(start) || !Number.isFinite(end)) return "Invalid port range!";
            if (start < 1 || start > 65535 || end < 1 || end > 65535) return "Port numbers must be in range 1-65535!";
            if (start > end) return "Port range start must be <= end!";
            continue;
        }

        // Single port.
        if (!/^\d+$/.test(t)) return "Ports must be numbers or ranges!";
        const p = Number(t);
        if (p < 1 || p > 65535) return "Port numbers must be in range 1-65535!";
    }

    return null;
}

/***
 * The Nmap component.
 * @returns The Nmap component.
 */

function Nmap() {
    // Component state.
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [chatGPTResponse, setChatGPTResponse] = useState("");
    const [pentestAdvice, setPentestAdvice] = useState("");
    const [hasSaved, setHasSaved] = useState(false);
    const [active, setActive] = useState(0);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);

    // Additional state variables for section visibility.
    const [basicOpened, setBasicOpened] = useState(true);
    const [advancedOpened, setAdvancedOpened] = useState(false);

    // Declare constants for the component.
    const title = "Nmap";
    const description =
        "Nmap is a powerful network scanning and discovery tool used to explore networks, detect open ports, identify services, and gather information about target systems.";
    const steps =
        "Step 1: Enter the target IP or hostname.\n" +
        "Step 2: Configure scan options.\n" +
        "Step 3: Run the Nmap scan and review results.";
    const sourceLink = "https://nmap.org/book/man.html";
    const tutorial = "https://docs.google.com/document/d/1F2hVxspkDsGRWWSTYzRuZD4EW_KeIdFem4cspHaMovo/edit?usp=sharing";
    const dependencies = ["nmap"];

    // Form hook with validation for target and ports.
    const form = useForm<FormValuesType>({
        initialValues: {
            target: "",
            ports: "",
            scanType: "sT",
            timing: "T3",
            osDetection: false,
            versionDetection: false,
            scriptScan: "",
            aggressive: false,
            verbose: false,
            noPortScan: false,
            enableIPv6: false,
        },

        // Provides live validation feedback to the user.
        validateInputOnChange: true,
        validateInputOnBlur: true,
        validate: {
            target: (value) => {
                const norm = normalizeTarget(value);

                // Checks for internal whitespace.
                if (/\s/.test(norm)) return "Error: Target contains spaces. Remove spaces and try again!";

                // Verifies IPv4 validity.
                if (isValidIPv4(norm)) return null;

                // Verifies IPv6 validity.
                if (isValidIPv6(norm)) return null;

                // Verifies hostname validity.
                if (isValidHostname(norm)) return null;

                return "Error: Invalid target! Enter a valid IPv4 address or hostname!";
            },
            ports: (value) => {
                const norm = String(value ?? "").trim();

                // internal whitespace
                if (/\s/.test(norm)) return "Error: Ports contain whitespace! Use commas 80,443 and or ranges 1-1000!";

                const err = validatePortsString(norm);
                if (err) return err;

                return null;
            },
        },
    });

    // Check the availability of commands in the dependencies array.
    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable);
                setOpened(!isAvailable);
                setLoadingModal(false);
            })
            .catch((err) => {
                console.error("Error checking commands:", err);
                setLoadingModal(false);
            });
    }, []);

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data received to the existing output.
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prev) => prev + "\n" + data);
    }, []);

    /**
     * handleProcessTermination: Callback to handle the termination of the child process.
     * Once the process termination is handled, it deactivates the loading overlay.
     * @param {object} param - An object containing information about the process termination.
     * @param {number} param.code - The exit code of the terminated process.
     * @param {number} param.signal - The signal code indicating how the process was terminated.
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
            setLoading(false);
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    /**
     * handleSaveComplete: Recognises that the output file has been saved.
     * Passes the saved status back to SaveOutputToTextFile_v2.
     */
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the Nmap tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Normalize submitted values.
        const target = normalizeTarget(values.target);
        const ports = String(values.ports ?? "").trim();
        const scanType = String(values.scanType ?? "");
        const timing = String(values.timing ?? "");
        const scriptScan = String(values.scriptScan ?? "");
        const noPortScan = Boolean(values.noPortScan);
        const enableIPv6 = Boolean(form.values.enableIPv6);

        // Verifies target validity.
        const targetIsValid = isValidIPv4(target) || (enableIPv6 && isValidIPv6(target)) || isValidHostname(target);

        if (!targetIsValid) {
            setOutput(
                enableIPv6
                    ? "Error: Invalid target! Enter an IPv4 address, IPv6 address, or hostname!"
                    : "Error: Invalid target! Enter an IPv4 address or hostname or enable IPv6 in advanced options!"
            );
            return;
        }

        // Verifies validity of port number and/or ranges.
        const portErr = validatePortsString(ports);
        if (portErr) {
            setOutput(`Error: ${portErr}`);
            return;
        }

        // Build nmap args.
        const args: string[] = [];

        if (scanType) args.push(`-${scanType}`);
        if (timing) args.push(`-${timing}`);
        if (values.osDetection) args.push("-O");
        if (values.versionDetection) args.push("-sV");
        if (scriptScan) args.push(`--script=${scriptScan}`);
        if (values.aggressive) args.push("-A");
        if (values.verbose) args.push("-v");
        if (noPortScan) args.push("-sn");
        if (!noPortScan && ports !== "") args.push("-p", ports);
        if (enableIPv6) args.push("-6");

        args.push(target);

        setLoading(true);
        setAllowSave(false);

        try {
            const { pid: startedPid, output: initialOutput } = await CommandHelper.runCommandGetPidAndOutput(
                "nmap",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(startedPid);
            setOutput(initialOutput);
        } catch (err: any) {
            setLoading(false);
            setAllowSave(true);
            setOutput(`Error: ${err?.message ?? String(err)}`);
        }
    };

    /**
     * clearOutput: Callback function to clear the console output.
     * It resets the state variable holding the output, thereby clearing the display.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, []);

    // Quick scan component.
    const runQuickScan = () => {
        // Executes a barebones Nmap scan.
        const quickValues: FormValuesType = {
            target: form.values.target,
            ports: "",
            scanType: "sT",
            timing: "T3",
        };

        setActive(2);
        void onSubmit(quickValues);
    };

    return (
        <>
            {/* Render the component with its title, description, steps, and tutorial */}
            <RenderComponent
                title={title}
                description={description}
                steps={steps}
                tutorial={tutorial}
                sourceLink={sourceLink}
            >
                {/* Render the installation modal if commands are not available */}
                {!loadingModal && (
                    <InstallationModal
                        isOpen={opened}
                        setOpened={setOpened}
                        feature_description={description}
                        dependencies={dependencies}
                    />
                )}

                <form onSubmit={form.onSubmit(onSubmit)}>
                    {/* Render the loading overlay and cancel button */}
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <Stack>
                        {/* Render the Stepper component with steps */}
                        <Stepper active={active} onStepClick={setActive} breakpoint="sm">
                            <Stepper.Step label="Target">
                                <TextInput label="Target IP or Hostname" required {...form.getInputProps("target")} />
                                <Stack align="center" mt="sm">
                                    <Button type="button" disabled={loading} onClick={() => runQuickScan()}>
                                        Run Nmap (Quick)
                                    </Button>
                                </Stack>
                            </Stepper.Step>

                            {/* Step 2: Scan Options */}
                            <Stepper.Step label="Scan Options">
                                <Grid>
                                    <Grid.Col span={6}>
                                        <Button
                                            onClick={() => setBasicOpened(!basicOpened)}
                                            variant="outline"
                                            fullWidth
                                        >
                                            {basicOpened ? "Hide Basic Options" : "Show Basic Options"}
                                        </Button>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Button
                                            onClick={() => setAdvancedOpened(!advancedOpened)}
                                            variant="outline"
                                            fullWidth
                                        >
                                            {advancedOpened ? "Hide Advanced Options" : "Show Advanced Options"}
                                        </Button>
                                    </Grid.Col>
                                </Grid>

                                {/* Render Basic Options */}
                                {basicOpened && (
                                    <Stack mt={10}>
                                        <TextInput
                                            label="Ports"
                                            placeholder="e.g., 80,443,8080 or 1-1000"
                                            {...form.getInputProps("ports")}
                                        />
                                        <Select
                                            label="Scan Type"
                                            data={[
                                                { value: "sT", label: "TCP Connect Scan" },
                                                { value: "sU", label: "UDP Scan" },
                                                { value: "sA", label: "ACK Scan" },
                                            ]}
                                            {...form.getInputProps("scanType")}
                                        />
                                        <Select
                                            label="Timing Template"
                                            data={[
                                                { value: "T0", label: "Paranoid" },
                                                { value: "T1", label: "Sneaky" },
                                                { value: "T2", label: "Polite" },
                                                { value: "T3", label: "Normal" },
                                                { value: "T4", label: "Aggressive" },
                                                { value: "T5", label: "Insane" },
                                            ]}
                                            {...form.getInputProps("timing")}
                                        />
                                    </Stack>
                                )}

                                {/* Render Advanced Options */}
                                {advancedOpened && (
                                    <Stack mt={10}>
                                        <Switch
                                            label="OS Detection"
                                            {...form.getInputProps("osDetection", { type: "checkbox" })}
                                        />
                                        <Switch
                                            label="Version Detection"
                                            {...form.getInputProps("versionDetection", { type: "checkbox" })}
                                        />
                                        <TextInput
                                            label="Script Scan"
                                            placeholder="e.g., default,safe,vuln"
                                            {...form.getInputProps("scriptScan")}
                                        />
                                        <Switch
                                            label="Enable IPv6 Targets"
                                            {...form.getInputProps("enableIPv6", { type: "checkbox" })}
                                        />
                                        <Switch
                                            label="Aggressive Scan"
                                            {...form.getInputProps("aggressive", { type: "checkbox" })}
                                        />
                                        <Switch
                                            label="Verbose Output"
                                            {...form.getInputProps("verbose", { type: "checkbox" })}
                                        />
                                        <Switch
                                            label="No Port Scan (Host Discovery)"
                                            {...form.getInputProps("noPortScan", { type: "checkbox" })}
                                        />
                                    </Stack>
                                )}
                            </Stepper.Step>

                            {/* Step 3: Run */}
                            <Stepper.Step label="Run">
                                <Stack align="center" mt={20}>
                                    <Button type="submit" disabled={loading} style={{ alignSelf: "center" }}>
                                        Run Nmap
                                    </Button>
                                </Stack>
                            </Stepper.Step>
                        </Stepper>

                        {/* Render the SaveOutputToTextFile component */}
                        {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                        {/* Render the ConsoleWrapper component */}
                        <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                        {/* Add Ask ChatGPT Component */}
                        <AskChatGPT toolName={title} output={output} setChatGPTResponse={setChatGPTResponse} />
                        {chatGPTResponse && (
                            <div style={{ marginTop: "20px" }}>
                                <h3>ChatGPT Response:</h3>
                                <ChatGPTOutput output={chatGPTResponse} />
                            </div>
                        )}

                        <PentestGPT toolName={title} output={output} setAdvice={setPentestAdvice} />
                        {pentestAdvice && (
                            <div style={{ marginTop: "20px" }}>
                                <h3>Next Step Adviser Response:</h3>
                                <ChatGPTOutput output={pentestAdvice} />
                            </div>
                        )}
                    </Stack>
                </form>
            </RenderComponent>
        </>
    );
}

export default Nmap;
