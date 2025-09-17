// Import necessary hooks and components from React and other libraries
import { useState, useCallback, useEffect, useRef } from "react";
import { Stepper, Button, TextInput, NumberInput, Select, Switch, Stack, Grid, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";

/**
 * Represents the form values for the WhatWeb component.
 */
interface FormValuesType {
    target: string;
    inputFile: string;
    aggression: string;
    userAgent: string;
    followRedirect: string;
    user: string;
    cookie: string;
    plugins: string;
    verbose: boolean;
    logFormat: string;
    maxThreads: number;
}

/**
 * The WhatWeb component.
 * @returns The WhatWeb component.
 */
function WhatWeb() {
    // Declare state variables for component
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [active, setActive] = useState(0);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);

    // UI state
    const [basicOpened, setBasicOpened] = useState(true);
    const [advancedOpened, setAdvancedOpened] = useState(false);
    const [authOpened, setAuthOpened] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    // NEW: auto-cancel guard for long runs (10 minutes)
    const AUTO_CANCEL_MIN = 10;
    const autoCancelTimerRef = useRef<number | null>(null);

    // Declare constants
    const title = "WhatWeb";
    const description =
        "WhatWeb identifies websites. It recognises web technologies including content management systems, blogging platforms, statistic/analytics packages, JavaScript libraries, web servers, and embedded devices.";
    const steps =
        "Step 1: Enter the target URL or IP address.\n" +
        "Step 2: Configure scan options.\n" +
        "   - Aggression: Controls scan intensity (1=stealthy, 4=heavy).\n" +
        "   - Plugins: Specify WhatWeb plugins.\n" +
        "   - User Agent: Set custom browser identifier.\n" +
        "   - Max Threads: Adjust concurrency.\n" +
        "   - Redirects/Cookies/Auth: Control advanced behaviors.\n" +
        "Step 3: Run WhatWeb and review results. Output can be expanded to fullscreen and saved.";
    const sourceLink = "https://github.com/urbanadventurer/WhatWeb";
    const tutorial = "https://docs.google.com/document/d/1IUrB6sX_Ykk5hyrcelRSwi4l7QMqc_YxpyEPCmUarzc/edit?usp=sharing";
    const dependencies = ["whatweb"];

    // Form hook
    const form = useForm<FormValuesType>({
        initialValues: {
            target: "",
            inputFile: "",
            aggression: "",
            userAgent: "",
            followRedirect: "",
            user: "",
            cookie: "",
            plugins: "",
            verbose: false,
            logFormat: "",
            maxThreads: 0,
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

        return () => {
            if (autoCancelTimerRef.current) {
                clearTimeout(autoCancelTimerRef.current);
                autoCancelTimerRef.current = null;
            }
        };
    }, []);

    // Process handlers
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            // clear auto-cancel timer
            if (autoCancelTimerRef.current) {
                clearTimeout(autoCancelTimerRef.current);
                autoCancelTimerRef.current = null;
            }

            // Friendly mapping using the accumulated raw output
            const raw = (output || "").toLowerCase();
            const friendlyMsgs: string[] = [];
            if (/execution expired|timed out|timeout/.test(raw)) {
                friendlyMsgs.push("Target did not respond on HTTP within the timeout window.");
            }
            if (/no plugins selected/.test(raw)) {
                friendlyMsgs.push("No plugins selected. Please specify valid plugins or leave empty.");
            }
            if (/plugins? were not found|the following plugins were not found|plugin .* not found/.test(raw)) {
                friendlyMsgs.push("One or more specified plugins were not found.");
            }

            if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else if (code === 0 && friendlyMsgs.length === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (friendlyMsgs.length > 0) {
                handleProcessData("\n" + friendlyMsgs.join(" "));
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }

            setLoading(false);
            setAllowSave(true);
            setHasSaved(false);
            setPid(""); // NEW: clear pid at end
        },
        [handleProcessData, output]
    );

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    // Submit handler
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);
        setOutput("");

        // NEW: build args as separate tokens (fixes plugins/user-agent/cookie passing)
        const args: string[] = [];
        if (values.inputFile) args.push("-i", values.inputFile);
        if (values.aggression) args.push("-a", values.aggression);
        if (values.userAgent) args.push("-U", values.userAgent);
        if (values.followRedirect) args.push(`--follow-redirect=${values.followRedirect}`);
        if (values.user) args.push("-u", values.user);
        if (values.cookie) args.push("-c", values.cookie);
        if (values.plugins) args.push("-p", values.plugins); // comma-separated list is OK
        if (values.verbose) args.push("-v");
        if (values.logFormat) args.push(`--log-${values.logFormat}=-`);
        if (values.maxThreads > 0) args.push("-t", String(values.maxThreads));

        // NEW: default network timeout to reduce hangs
        args.push("--timeout=30");

        // Target at the end
        args.push(values.target);

        try {
            const { pid, output } = await CommandHelper.runCommandGetPidAndOutput(
                "whatweb",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(pid);
            setOutput(output);

            // NEW: schedule auto-cancel after 10 minutes to prevent indefinite hangs
            if (autoCancelTimerRef.current) clearTimeout(autoCancelTimerRef.current);
            autoCancelTimerRef.current = window.setTimeout(() => {
                if (pid) {
                    CommandHelper.runCommand("kill", ["-15", pid]);
                    handleProcessData("\nAuto-cancel: run exceeded 10 minutes and was terminated.");
                }
            }, AUTO_CANCEL_MIN * 60 * 1000);
        } catch (error: any) {
            setOutput(`Error: ${error.message}`);
            setLoading(false);
            setAllowSave(true);
        }
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, []);

    // Navigation
    const nextStep = () => setActive((c) => (c < 2 ? c + 1 : c));
    const prevStep = () => setActive((c) => (c > 0 ? c - 1 : c));

    // Simple structured output parsing
    const formatOutput = (text: string) => {
        if (!text) return "";
        const sections = ["Redirect", "Header", "Cookie", "Plugin"];
        return sections
            .map((s) => {
                const lines = text.split("\n").filter((l) => l.toLowerCase().includes(s.toLowerCase()));
                return lines.length ? `\n=== ${s}s ===\n${lines.join("\n")}` : "";
            })
            .join("\n");
    };

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
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <Stack>
                        <Stepper active={active} onStepClick={setActive} breakpoint="sm">
                            {/* Step 1 */}
                            <Stepper.Step label="Target">
                                <TextInput label="Target URL or IP" required {...form.getInputProps("target")} />
                                <TextInput label="Input File" {...form.getInputProps("inputFile")} />
                                <Group mt={20} position="right">
                                    <Button onClick={nextStep}>Next</Button>
                                </Group>
                            </Stepper.Step>

                            {/* Step 2 */}
                            <Stepper.Step label="Scan Options">
                                <Grid>
                                    <Grid.Col span={4}>
                                        <Button
                                            onClick={() => setBasicOpened(!basicOpened)}
                                            variant="outline"
                                            fullWidth
                                        >
                                            {basicOpened ? "Hide Basic Options" : "Show Basic Options"}
                                        </Button>
                                    </Grid.Col>
                                    <Grid.Col span={4}>
                                        <Button
                                            onClick={() => setAdvancedOpened(!advancedOpened)}
                                            variant="outline"
                                            fullWidth
                                        >
                                            {advancedOpened ? "Hide Advanced Options" : "Show Advanced Options"}
                                        </Button>
                                    </Grid.Col>
                                    <Grid.Col span={4}>
                                        <Button onClick={() => setAuthOpened(!authOpened)} variant="outline" fullWidth>
                                            {authOpened ? "Hide Authentication Options" : "Show Authentication Options"}
                                        </Button>
                                    </Grid.Col>
                                </Grid>

                                {basicOpened && (
                                    <Stack mt={10}>
                                        <Select
                                            label="Aggression Level"
                                            title="Controls scan intensity (1=stealthy, 4=heavy)"
                                            data={[
                                                { value: "", label: "Default" },
                                                { value: "1", label: "Stealthy" },
                                                { value: "3", label: "Aggressive" },
                                                { value: "4", label: "Heavy" },
                                            ]}
                                            {...form.getInputProps("aggression")}
                                        />
                                        <TextInput
                                            label="Plugins"
                                            title="Specify WhatWeb plugins"
                                            {...form.getInputProps("plugins")}
                                        />
                                        <Switch
                                            label="Verbose Output"
                                            title="Enable detailed results"
                                            {...form.getInputProps("verbose", { type: "checkbox" })}
                                        />
                                    </Stack>
                                )}

                                {advancedOpened && (
                                    <Stack mt={10}>
                                        <TextInput
                                            label="User Agent"
                                            title="Set custom browser identifier"
                                            {...form.getInputProps("userAgent")}
                                        />
                                        <Select
                                            label="Follow Redirect"
                                            title="Control how redirects are followed"
                                            data={[
                                                { value: "", label: "Default" },
                                                { value: "never", label: "Never" },
                                                { value: "http-only", label: "HTTP Only" },
                                                { value: "meta-only", label: "Meta Only" },
                                                { value: "same-site", label: "Same Site" },
                                                { value: "always", label: "Always" },
                                            ]}
                                            {...form.getInputProps("followRedirect")}
                                        />
                                        <NumberInput
                                            label="Max Threads"
                                            title="Adjust concurrency level"
                                            min={0}
                                            {...form.getInputProps("maxThreads")}
                                        />
                                        <Select
                                            label="Log Format"
                                            title="Choose output format"
                                            data={[
                                                { value: "", label: "Default" },
                                                { value: "brief", label: "Brief" },
                                                { value: "verbose", label: "Verbose" },
                                                { value: "xml", label: "XML" },
                                                { value: "json", label: "JSON" },
                                            ]}
                                            {...form.getInputProps("logFormat")}
                                        />
                                    </Stack>
                                )}

                                {authOpened && (
                                    <Stack mt={10}>
                                        <TextInput
                                            label="User (user:password)"
                                            title="Provide credentials for authenticated scans"
                                            {...form.getInputProps("user")}
                                        />
                                        <TextInput
                                            label="Cookie"
                                            title="Add cookies for session-based scanning"
                                            {...form.getInputProps("cookie")}
                                        />
                                    </Stack>
                                )}
                                <Group mt={20} position="apart">
                                    <Button variant="default" onClick={prevStep}>
                                        Back
                                    </Button>
                                    <Button onClick={nextStep}>Next</Button>
                                </Group>
                            </Stepper.Step>

                            {/* Step 3 */}
                            <Stepper.Step label="Run">
                                <Stack align="center" mt={20}>
                                    <Button type="submit" disabled={loading}>
                                        Run WhatWeb
                                    </Button>
                                </Stack>
                            </Stepper.Step>
                        </Stepper>

                        {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}

                        <Group position="right" mb={5}>
                            <Button size="xs" onClick={() => setFullscreen((f) => !f)}>
                                {fullscreen ? "Exit Fullscreen" : "Expand Results"}
                            </Button>
                        </Group>

                        <div style={{ height: fullscreen ? "80vh" : "300px" }}>
                            <ConsoleWrapper output={formatOutput(output)} clearOutputCallback={clearOutput} />
                        </div>
                    </Stack>
                </form>
            </RenderComponent>
        </>
    );
}

export default WhatWeb;
