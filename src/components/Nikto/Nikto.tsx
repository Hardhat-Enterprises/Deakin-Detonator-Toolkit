import { useState, useCallback, useEffect } from "react";
import { Stepper, Button, TextInput, NumberInput, Select, Switch, Stack, Grid } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";

// --- minimal target validator for host/URL/IP (with localhost + IPv6 support) ---
const ipv4RE =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

const hostnameLabel = "(?!-)[A-Za-z0-9-]{1,63}(?<!-)";
const hostnameRE = new RegExp(`^${hostnameLabel}(?:\\.${hostnameLabel})*$`);

function wrapIPv6IfNeeded(s: string): string {
  if (!s.includes("://") && s.includes(":") && !s.startsWith("[") && !s.endsWith("]")) {
    return `http://[${s}]`;
  }
  return s.includes("://") ? s : `http://${s}`;
}

function isValidTarget(input: string): boolean {
  if (!input) return false;
  const s = input.trim();
  if (!s || /\s/.test(s)) return false;  // whitespace
  if (s.includes("..")) return false;    // double dots
  try {
    const url = new URL(wrapIPv6IfNeeded(s));
    const host = url.hostname; // brackets removed for IPv6
    if (!host) return false;
    return ipv4RE.test(host) || host.includes(":") || hostnameRE.test(host);
  } catch {
    return false;
  }
}



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

    // Additional state variables for section visibility
    const [basicOpened, setBasicOpened] = useState(true);
    const [advancedOpened, setAdvancedOpened] = useState(false);
    const [authOpened, setAuthOpened] = useState(false);
    const [additionalOpened, setAdditionalOpened] = useState(false);

    // Declare constants for the component
    const title = "Nikto";
    const description =
        "Nikto is a powerful web server scanner that performs comprehensive tests against web servers for multiple items, including dangerous files/CGIs, outdated software, and other problems.";
    const steps =
        "Step 1: Enter the target host/URL.\n" +
        "Step 2: Select the desired parameters for the Nikto scan.\n" +
        "Step 3: Click the 'Run Nikto' button to initiate the scanning process.\n" +
        "Step 4: Review the output in the console to identify potential vulnerabilities and misconfigurations.\n";
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
        validate: {
            host: (value) =>
              isValidTarget(value) ? null : "Enter a valid host/IP or URL (no spaces, no double dots).",
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
    }, []);

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
        const { hasErrors } = form.validate();
  if (hasErrors) {
    setOutput("✖ Invalid target: please fix the Host field and try again.");
    return;
  }

  setLoading(true);
  setAllowSave(false);

  const host = form.values.host.trim();
  const args = ["-h", host];

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
                                        <Switch
                                            label="Database Check"
                                            {...form.getInputProps("dbcheck", { type: "checkbox" })}
                                        />
                                        <TextInput label="Evasion" {...form.getInputProps("evasion")} />
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
