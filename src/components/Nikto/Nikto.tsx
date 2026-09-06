import { useState, useCallback, useEffect, useRef } from "react";
import {
    Stepper,
    Button,
    TextInput,
    Alert,
    Group,
    NumberInput,
    Select,
    Switch,
    Stack,
    Grid,
    Collapse,
    ActionIcon,
    Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";

/**
 * Represents the form values for the Nikto component.
 */
interface FormValuesType {
    host: string;
    port: number;
    ssl: boolean;
    noSsl: boolean;
    output: string;
    format: string;
    tuning: string;
    plugins: string;
    dbcheck: boolean;
    evasion: string;
    id: string;
    pause: number;
    userAgent: string;
    vhost: string;
    display: string;
    timeout: number;
    maxTime: string;
    noLookup: boolean;
    followRedirects: boolean;
}

/**
 * The Nikto component.
 * @returns The Nikto component.
 */
function Nikto() {
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
    const [showAlert, setShowAlert] = useState(true);
    const alertTimeout = useRef<NodeJS.Timeout | null>(null);

    // Additional state variables for section visibility
    const [basicOpened, setBasicOpened] = useState(true);
    const [advancedOpened, setAdvancedOpened] = useState(false);
    const [authOpened, setAuthOpened] = useState(false);
    const [additionalOpened, setAdditionalOpened] = useState(false);
    const [tuningCodesOpened, setTuningCodesOpened] = useState(false);
    const [evasionCodesOpened, setEvasionCodesOpened] = useState(false);

    // Declare constants for the component
    const title = "Nikto";
    const description =
        "Nikto is a powerful web server scanner that performs comprehensive tests against web servers for multiple items, including dangerous files/CGIs, outdated software, and other problems.";
    const steps =
        "=== Nikto User Guide ===\n" +
        "=== Basic Scan ===\n" +
        "Step 1. Target Host/URL and Port: Enter the address to scan, e.g., scanme.nmap.org or 45.33.32.156 and the port the scan is targeting.\n" +
        "Step 2. Basic Options (Optional): Set SSL mode (required for HTTPS services), output file name, and output format under 'Show Basic Options'.\n" +
        "Step 3. Start Nikto: Click 'Run Nikto' to begin scanning.\n" +
        "Step 4. Review Output: Check the console and output for vulnerabilities and misconfigurations found.\n" +
        "=== Advanced Options ===\n" +
        "Tuning: Focus the scan on one category of tests instead of everything, e.g., '9' for SQL injection only, or 'x6' to skip denial-of-service checks.\n" +
        "Plugins: Choose which plugin script to run, separate from test categories. Find all available plugins by running 'nikto -list-plugins'.\n" +
        "Database Check: Enable if you've edited the scan database and want syntax errors caught before scanning starts. With this enabled, Nikto will NOT scan. Only use for diagnostic  and maintenance purposes. Safe to run offline.\n" +
        "Evasion: Use to deploy evasion techniques against IDS/IPS-protected targets to reduce the chance the scan is detected or blocked.\n" +
        "Pause: Delay between HTTP requests. Use to go slower on a rate-limited target, increasing scan time.\n" +
        "=== Authentication ===\n" +
        "Authentication: Only needed for targets behind HTTP Basic/NTLM login. Enter 'id:pass', or 'id:pass:realm' if a realm is required.\n" +
        "=== Additional Options ===\n" +
        "User Agent: Set if the target blocks or behaves differently for Nikto's default agent, or to mimic a specific browser.\n" +
        "Virtual Host: Required when the target shares an IP with other domains. Use the hostname you want tested.\n" +
        "Display Options: Adds console detail, e.g. 'V' verbose, 'P' live progress, 'S' scrub IPs/hostnames before sharing results.\n" +
        "Timeout (seconds): Determines how long Nikto waits for a response before moving on.\n" +
        "Max Time: Caps total time on a host, so the scan moves on rather than running indefinitely. Suffix 'h' for hours, 'm' for minutes and no suffix for seconds, e.g., 1h for an hour, 30m for 30 minutes and 120 for 120 seconds.\n" +
        "No DNS Lookup: Avoids reverse DNS lookup to circumvent DNS-based monitoring, at the cost of hostnames in the report.\n" +
        "Follow Redirects: Enable so testing continues at a redirected URL instead of stopping at the redirect.\n" +
        "=== Notes ===\n" +
        "Runtime: Scans can take a long time. Larger targets and poor network connection may result in a longer scan time, so avoid cancelling prematurely.";
    const sourceLink = "https://github.com/sullo/nikto";
    const tutorial = "https://docs.google.com/document/d/136gID61GZYxOugoVPH0KhT-jfe5-ELKPyFJL_UXLE3c/edit?usp=sharing";
    const dependencies = ["nikto"];

    // Initialize the form hook with initial values
    const form = useForm<FormValuesType>({
        initialValues: {
            host: "",
            port: 80,
            ssl: false,
            noSsl: false,
            output: "",
            format: "txt",
            tuning: "",
            plugins: "",
            dbcheck: false,
            evasion: "",
            id: "",
            pause: 0,
            userAgent: "",
            vhost: "",
            display: "",
            timeout: 10,
            maxTime: "",
            noLookup: false,
            followRedirects: false,
        },
    });

    // Check the availability of commands in the dependencies array
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
        }, 15000);
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
        }, 15000);
    };

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data received to the existing output.
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
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
     * handleSaveComplete: Recognizes that the output file has been saved.
     * Passes the saved status back to SaveOutputToTextFile_v2
     */
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the Nikto tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     */
    const onSubmit = async () => {
        setLoading(true);
        setAllowSave(false);

        const args = ["-h", form.values.host];

        if (form.values.port !== 80) {
            args.push("-port", form.values.port.toString());
        }

        if (form.values.ssl) {
            args.push("-ssl");
        }

        if (form.values.noSsl) {
            args.push("-nossl");
        }

        if (form.values.output) {
            args.push("-output", form.values.output);
        }

        if (form.values.format !== "txt") {
            args.push("-Format", form.values.format);
        }

        if (form.values.tuning) {
            args.push("-Tuning", form.values.tuning);
        }

        if (form.values.plugins) {
            args.push("-Plugins", form.values.plugins);
        }

        if (form.values.dbcheck) {
            args.push("-dbcheck");
        }

        if (form.values.evasion) {
            args.push("-evasion", form.values.evasion);
        }

        if (form.values.id) {
            args.push("-id", form.values.id);
        }

        if (form.values.pause > 0) {
            args.push("-Pause", form.values.pause.toString());
        }

        if (form.values.userAgent) {
            args.push("-useragent", form.values.userAgent);
        }

        if (form.values.vhost) {
            args.push("-vhost", form.values.vhost);
        }

        if (form.values.display) {
            args.push("-Display", form.values.display);
        }

        if (form.values.timeout !== 10) {
            args.push("-timeout", form.values.timeout.toString());
        }

        if (form.values.maxTime) {
            args.push("-maxtime", form.values.maxTime);
        }

        if (form.values.noLookup) {
            args.push("-nolookup");
        }

        if (form.values.followRedirects) {
            args.push("-followredirects");
        }

        try {
            const { pid, output } = await CommandHelper.runCommandGetPidAndOutput(
                "nikto",
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
     * clearOutput: Callback function to clear the console output.
     * It resets the state variable holding the output, thereby clearing the display.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, []);

    // Function to handle the next step in the Stepper.
    const nextStep = () => setActive((current) => (current < 2 ? current + 1 : current));

    // Function to handle the previous step in the Stepper.
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

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
                        <Group position="right">
                            {!showAlert && (
                                <Button onClick={handleShowAlert} size="xs" variant="outline" color="gray">
                                    Show Disclaimer
                                </Button>
                            )}
                        </Group>
                        {showAlert && (
                            <Alert title="Warning: Potential Risks & Runtime" color="red">
                                This tool is used to perform vulnerability scans, use with caution and only on networks
                                you own or have explicit permission to test.
                                <br />
                                <br />
                                <strong>Note:</strong> Targets can take a long time to finish scanning depending on the
                                size of the site and the options selected. For example, a default scan of
                                scanme.nmap.org took roughly 30 to 40 minutes to complete. Please be patient and avoid
                                cancelling the scan prematurely. Scan time can be shorten by using Tuning or Plugins
                                settings to selectively run fewer tests.
                            </Alert>
                        )}
                        {/* Render the Stepper component with steps */}
                        <Stepper active={active} onStepClick={setActive} breakpoint="sm">
                            {/* Step 1: Target */}
                            <Stepper.Step label="Target">
                                <TextInput label="Host" required {...form.getInputProps("host")} />
                                <NumberInput label="Port" {...form.getInputProps("port")} />
                            </Stepper.Step>
                            {/* Step 2: Parameters */}
                            <Stepper.Step label="Parameters">
                                <Grid mt={20}>
                                    <Grid.Col span={3}>
                                        <Button
                                            onClick={() => setBasicOpened(!basicOpened)}
                                            variant="outline"
                                            fullWidth
                                        >
                                            {basicOpened ? "Hide Basic Options" : "Show Basic Options"}
                                        </Button>
                                    </Grid.Col>
                                    <Grid.Col span={3}>
                                        <Button
                                            onClick={() => setAdvancedOpened(!advancedOpened)}
                                            variant="outline"
                                            fullWidth
                                        >
                                            {advancedOpened ? "Hide Advanced Options" : "Show Advanced Options"}
                                        </Button>
                                    </Grid.Col>
                                    <Grid.Col span={3}>
                                        <Button onClick={() => setAuthOpened(!authOpened)} variant="outline" fullWidth>
                                            {authOpened ? "Hide Authentication Options" : "Show Authentication Options"}
                                        </Button>
                                    </Grid.Col>
                                    <Grid.Col span={3}>
                                        <Button
                                            onClick={() => setAdditionalOpened(!additionalOpened)}
                                            variant="outline"
                                            fullWidth
                                        >
                                            {additionalOpened ? "Hide Additional Options" : "Show Additional Options"}
                                        </Button>
                                    </Grid.Col>
                                </Grid>

                                {/* Render Basic Options */}
                                {basicOpened && (
                                    <Stack mt={10}>
                                        <Switch label="SSL" {...form.getInputProps("ssl", { type: "checkbox" })} />
                                        <Switch label="No SSL" {...form.getInputProps("noSsl", { type: "checkbox" })} />
                                        <TextInput label="Output File" {...form.getInputProps("output")} />
                                        <Select
                                            label="Output Format"
                                            data={[
                                                { value: "txt", label: "Plain text" },
                                                { value: "csv", label: "CSV" },
                                                { value: "json", label: "JSON" },
                                                { value: "xml", label: "XML" },
                                            ]}
                                            {...form.getInputProps("format")}
                                        />
                                    </Stack>
                                )}

                                {/* Render Advanced Options */}
                                {advancedOpened && (
                                    <Stack mt={10}>
                                        <TextInput label="Tuning" {...form.getInputProps("tuning")} />
                                        <TextInput label="Plugins" {...form.getInputProps("plugins")} />
                                        <Group spacing="xs">
                                            <ActionIcon
                                                onClick={() => setTuningCodesOpened((o) => !o)}
                                                variant="outline"
                                                aria-label={
                                                    tuningCodesOpened
                                                        ? "Collapse code reference"
                                                        : "Expand code reference"
                                                }
                                            >
                                                {tuningCodesOpened ? "−" : "+"}
                                            </ActionIcon>
                                            <Text size="sm" c="dimmed">
                                                Tuning &amp; Plugin codes
                                            </Text>
                                        </Group>
                                        <Collapse in={tuningCodesOpened}>
                                            <Stack spacing={4} mt={4}>
                                                <Text size="sm">
                                                    <strong>Tuning:</strong> 0 - File Upload, 1 - Interesting File, 2 -
                                                    Misconfig/Default File, 3 - Info Disclosure, 4 - Injection
                                                    (XSS/HTML), 5 - Remote File Retrieval-web root, 6 - Denial of
                                                    Service, 7 - Remote File Retrieval-server wide, 8 - Command
                                                    Execution, 9 - SQL Injection, a - Auth Bypass, b - Software ID, c -
                                                    Remote Source Inclusion, d - WebService, e - Admin Console, f - XML
                                                    Injection, x - Reverse (exclude instead of include).
                                                </Text>
                                                <Text size="sm">
                                                    <strong>Plugins:</strong> Macros like '@@NONE' can be used for a
                                                    report with no scanning, '@@DEFAULT' for the plugins in the default
                                                    set, or '@@ALL' to run every plugins loaded. A plugin name, e.g.,
                                                    sitefiles, for just that check.
                                                </Text>
                                            </Stack>
                                        </Collapse>
                                        <Switch
                                            label="Database Check"
                                            {...form.getInputProps("dbcheck", { type: "checkbox" })}
                                        />
                                        <TextInput label="Evasion" {...form.getInputProps("evasion")} />
                                        <Group spacing="xs">
                                            <ActionIcon
                                                onClick={() => setEvasionCodesOpened((o) => !o)}
                                                variant="outline"
                                                aria-label={
                                                    evasionCodesOpened
                                                        ? "Collapse evasion code reference"
                                                        : "Expand evasion code reference"
                                                }
                                            >
                                                {evasionCodesOpened ? "−" : "+"}
                                            </ActionIcon>
                                            <Text size="sm" c="dimmed">
                                                Evasion codes
                                            </Text>
                                        </Group>
                                        <Collapse in={evasionCodesOpened}>
                                            <Stack spacing={4} mt={4}>
                                                <Text size="sm">
                                                    <strong>Evasion:</strong> 1 - Random URI encoding (non-UTF8), 2 -
                                                    Directory self-reference (/./), 3 - Premature URL ending, 4 -
                                                    Prepend long random string, 5 - Fake parameter, 6 - TAB as request
                                                    spacer, 7 - Change the case of the URL, 8 - Use Windows directory
                                                    separator (\), A - Use a carriage return (0x0d) as a request spacer,
                                                    B - Use binary value 0x0b as a request spacer.
                                                </Text>
                                            </Stack>
                                        </Collapse>
                                        <NumberInput label="Pause (seconds)" {...form.getInputProps("pause")} />
                                    </Stack>
                                )}

                                {/* Render Authentication Options */}
                                {authOpened && (
                                    <Stack mt={10}>
                                        <TextInput
                                            label="Authentication (id:pass or id:pass:realm)"
                                            {...form.getInputProps("id")}
                                        />
                                    </Stack>
                                )}

                                {/* Render Additional Options */}
                                {additionalOpened && (
                                    <Stack mt={10}>
                                        <TextInput label="User Agent" {...form.getInputProps("userAgent")} />
                                        <TextInput label="Virtual Host" {...form.getInputProps("vhost")} />
                                        <TextInput label="Display Options" {...form.getInputProps("display")} />
                                        <NumberInput label="Timeout (seconds)" {...form.getInputProps("timeout")} />
                                        <TextInput label="Max Time" {...form.getInputProps("maxTime")} />
                                        <Switch
                                            label="No DNS Lookup"
                                            {...form.getInputProps("noLookup", { type: "checkbox" })}
                                        />
                                        <Switch
                                            label="Follow Redirects"
                                            {...form.getInputProps("followRedirects", { type: "checkbox" })}
                                        />
                                    </Stack>
                                )}
                            </Stepper.Step>
                            {/* Step 3: Run */}
                            <Stepper.Step label="Run">
                                <Stack align="center" mt={20}>
                                    <Button type="submit" disabled={loading} style={{ alignSelf: "center" }}>
                                        Run Nikto
                                    </Button>
                                </Stack>
                            </Stepper.Step>
                        </Stepper>
                        {/* Render the SaveOutputToTextFile component */}
                        {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                        {/* Render the ConsoleWrapper component */}
                        <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                    </Stack>
                </form>
            </RenderComponent>
        </>
    );
}

export default Nikto;
