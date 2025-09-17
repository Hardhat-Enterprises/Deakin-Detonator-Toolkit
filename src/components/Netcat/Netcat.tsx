import { Button, NativeSelect, Stack, TextInput, Stepper, Switch, Group, Badge, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { FilePicker } from "../FileHandler/FilePicker";

/**
 * Represents the form values for the Netcat component.
 */
interface FormValuesType {
    ipAddress: string;
    portNumber: string;
    netcatOptions: string;
    websiteUrl: string;
    filePath: string;
}

/* -------------------------
   Validators (domains / IPv4 / IPv6 + ports)
   ------------------------- */

// Domain: must include at least one dot; labels 1–63; total <=253; no leading/trailing hyphen .
const isValidDomain = (host: string) => {
    if (!host) return false;
    const s = host.trim();
    // reject schemes or paths
    if (/^[a-z]+:\/\//i.test(s) || /[\/?#]/.test(s)) return false;
    // localhost is not a domain with a dot; allow it only if you want — here we reject it for WHOIS-like checks
    const re = /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
    return re.test(s);
};

// IPv4: dotted-quad, each 0–255
const isValidIPv4 = (ip: string) => {
    if (!ip) return false;
    const m = ip.trim().match(/^(\d{1,3}\.){3}\d{1,3}$/);
    if (!m) return false;
    return ip.split(".").every((o) => {
        const n = Number(o);
        return o === String(n) && n >= 0 && n <= 255;
    });
};

// IPv6: reasonably complete regex covering full, shortened, and with embedded IPv4
const isValidIPv6 = (ip: string) => {
    if (!ip) return false;
    const s = ip.trim();
    const re = new RegExp(
        "^(" +
            "([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|" + // 1:2:3:4:5:6:7:8
            "([0-9A-Fa-f]{1,4}:){1,7}:|" + // 1:: 1:2:3:4:5:6:7::
            ":[0-9A-Fa-f]{1,4}(:[0-9A-Fa-f]{1,4}){0,6}|" + // ::2  ::2:3  ... ::2:3:4:5:6:7
            "([0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4}|" + // 1:2:3:4:5:6::8
            "([0-9A-Fa-f]{1,4}:){1,5}(:[0-9A-Fa-f]{1,4}){1,2}|" + // 1:2:3:4:5::7:8
            "([0-9A-Fa-f]{1,4}:){1,4}(:[0-9A-Fa-f]{1,4}){1,3}|" + // 1:2:3:4::6:7:8
            "([0-9A-Fa-f]{1,4}:){1,3}(:[0-9A-Fa-f]{1,4}){1,4}|" + // 1:2:3::5:6:7:8
            "([0-9A-Fa-f]{1,4}:){1,2}(:[0-9A-Fa-f]{1,4}){1,5}|" + // 1:2::4:5:6:7:8
            "[0-9A-Fa-f]{1,4}:(:[0-9A-Fa-f]{1,4}){1,6}|" + // 1::3:4:5:6:7:8
            ":(:[0-9A-Fa-f]{1,4}){1,7}|" + // ::2:3:4:5:6:7:8  or ::8
            // IPv6 with embedded IPv4
            "([0-9A-Fa-f]{1,4}:){6}(\\d{1,3}\\.){3}\\d{1,3}|" +
            "([0-9A-Fa-f]{1,4}:){0,5}:[0-9A-Fa-f]{1,4}:(\\d{1,3}\\.){3}\\d{1,3}|" +
            "::(ffff(?::0{1,4}){0,1}:)?(\\d{1,3}\\.){3}\\d{1,3}" +
            ")$"
    );
    if (!re.test(s)) return false;
    // If embedded IPv4 exists, ensure each quad <=255
    const v4 = s.match(/(\d{1,3}\.){3}\d{1,3}$/);
    if (v4) return isValidIPv4(v4[0]);
    return true;
};

const isHost = (v: string) => isValidDomain(v) || isValidIPv4(v) || isValidIPv6(v);

const isValidPort = (p: string) => {
    if (!p) return false;
    const s = p.trim();
    if (!/^\d+$/.test(s)) return false;
    const n = Number(s);
    return n >= 1 && n <= 65535;
};

/* -------------------------
   Component
   ------------------------- */
const NetcatTool = () => {
    // Component State Variables
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [checkedVerboseMode, setCheckedVerboseMode] = useState(false);
    const [loadingModal, setLoadingModal] = useState(true);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [fileNames, setFileNames] = useState<string[]>([]);
    const [active, setActive] = useState(0);

    // Component Constants
    const title = "Netcat";
    const description =
        "A simple Unix utility which reads and writes data across network connections using TCP or UDP protocol.";
    const steps =
        "Step 1: Select the Netcat option.\n" +
        "Step 2: Provide the required inputs based on the selected option.\n" +
        "Step 3: Run the Netcat command and review results.";
    const sourceLink = "https://www.kali.org/tools/netcat/";
    const tutorial = "https://docs.google.com/document/d/1NQ-hy8NBuTTUJzHebST5UF42JPjJ3yfIvNgWbM7FPLE/edit?usp=sharing";
    const dependencies = ["nc"];

    // Form hook to handle form input.
    const form = useForm<FormValuesType>({
        initialValues: {
            ipAddress: "",
            portNumber: "",
            netcatOptions: "",
            websiteUrl: "",
            filePath: "",
        },
        validateInputOnChange: true,
        validateInputOnBlur: true,
        validate: {
            netcatOptions: (v) => (v ? null : "Please select an option"),
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

    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            console.log("handleProcessTermination called with code:", code, "signal:", signal);
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

    /**
     * Per-option validation (now: domain/IPv4/IPv6 for host-like inputs).
     * This only guards navigation/submit; command behavior is unchanged.
     */
    const validateForOption = (values: FormValuesType) => {
        const errors: Partial<Record<keyof FormValuesType, string>> = {};
        const opt = values.netcatOptions;

        if (!opt) errors.netcatOptions = "Please select an option";

        if (opt === "Listen") {
            if (!values.portNumber) errors.portNumber = "Port is required";
            else if (!isValidPort(values.portNumber)) errors.portNumber = "Enter a valid port (1–65535)";
        }

        if (opt === "Connect") {
            if (!values.ipAddress) errors.ipAddress = "Host is required";
            else if (!(isValidIPv4(values.ipAddress) || isValidIPv6(values.ipAddress)))
                errors.ipAddress = "Enter a valid IPv4 or IPv6";
            if (!values.portNumber) errors.portNumber = "Port is required";
            else if (!isValidPort(values.portNumber)) errors.portNumber = "Enter a valid port (1–65535)";
        }

        if (opt === "Port Scan") {
            if (!values.ipAddress) errors.ipAddress = "Host is required";
            else if (!isHost(values.ipAddress)) errors.ipAddress = "Enter a valid domain or IP";
            if (!values.portNumber) errors.portNumber = "Port/Range is required";
            // (range parsing intentionally left alone to avoid runtime changes)
        }

        if (opt === "Website Port Scan") {
            if (!values.portNumber) errors.portNumber = "Port/Range is required";
            if (!values.websiteUrl) errors.websiteUrl = "Host is required";
            else if (!isHost(values.websiteUrl)) errors.websiteUrl = "Enter a valid domain or IP";
        }

        if (opt === "Send File") {
            if (!values.ipAddress) errors.ipAddress = "Host is required";
            else if (!(isValidIPv4(values.ipAddress) || isValidIPv6(values.ipAddress)))
                errors.ipAddress = "Enter a valid IPv4 or IPv6";
            if (!values.portNumber) errors.portNumber = "Port is required";
            else if (!isValidPort(values.portNumber)) errors.portNumber = "Enter a valid port (1–65535)";
            if (fileNames.length === 0) errors.filePath = "Please select a file to send";
        }

        if (opt === "Receive File") {
            if (!values.portNumber) errors.portNumber = "Port is required";
            else if (!isValidPort(values.portNumber)) errors.portNumber = "Enter a valid port (1–65535)";
            if (!values.filePath) errors.filePath = "Output file path is required";
        }

        form.setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /**
     * Submit: unchanged command behavior; just blocked if inputs invalid.
     */
    const onSubmit = async (values: FormValuesType) => {
        if (!validateForOption(values)) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setAllowSave(false);

        let command = "nc";
        let args: string[] = [];
        const verboseFlag = checkedVerboseMode ? "-vn" : "-n";
        const verboseFlagWithSpaceAndDash = checkedVerboseMode ? " -v" : "";

        switch (values.netcatOptions) {
            case "Listen":
                args = ["-l", verboseFlag, "-w", "60", "-p", values.portNumber];
                break;
            case "Connect":
                args = [verboseFlag, "-w", "30", values.ipAddress, values.portNumber];
                break;
            case "Port Scan":
                args = ["-z", verboseFlag, "-w", "5", values.ipAddress, values.portNumber];
                break;
            case "Website Port Scan":
                args = ["-z", verboseFlag, "-w", "5", values.websiteUrl, values.portNumber];
                break;
            case "Send File":
                if (fileNames.length === 0) {
                    form.setFieldError("filePath", "Please select a file to send");
                    setLoading(false);
                    return;
                }
                command = "bash";
                args = [
                    "-c",
                    `nc -w 10${verboseFlagWithSpaceAndDash} -n ${values.ipAddress} ${values.portNumber} < "${fileNames[0]}"`,
                ];
                break;
            case "Receive File":
                command = "bash";
                args = [
                    "-c",
                    `nc -l${verboseFlagWithSpaceAndDash} -n -w 60 -p ${values.portNumber} > "${values.filePath}"`,
                ];
                break;
            default:
                setOutput("Invalid Netcat option selected.");
                setLoading(false);
                return;
        }

        console.log(`Executing command: ${command} ${args.join(" ")}`);

        try {
            const { pid, output } = await CommandHelper.runCommandWithPkexec(
                command,
                args.filter(Boolean),
                handleProcessData,
                handleProcessTermination
            );
            setPid(pid);
            setOutput(output);

            if (values.netcatOptions === "Listen" || values.netcatOptions === "Connect") {
                handleProcessData(
                    "\nNote: This operation may keep running. The loading overlay will stop in 10 seconds."
                );
                setTimeout(() => {
                    console.log("Safety timeout triggered - stopping loading overlay");
                    setLoading(false);
                    setAllowSave(true);
                }, 10000);
            }
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

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    // Guarded stepper next that enforces per-step validation
    const guardedNextStep = () => {
        if (active === 0) {
            if (!form.values.netcatOptions) {
                form.setFieldError("netcatOptions", "Please select an option");
                return;
            }
            setActive(1);
            return;
        }
        if (active === 1) {
            if (!validateForOption(form.values)) return;
            setActive(2);
            return;
        }
        if (active < 2) setActive((c) => c + 1);
    };

    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

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
                {LoadingOverlayAndCancelButtonPkexec(loading, pid, handleProcessData, handleProcessTermination)}
                <Stepper
                    active={active}
                    onStepClick={(s) => {
                        if (s <= active) return setActive(s);
                        if (active === 0 && form.values.netcatOptions) return setActive(1);
                        if (active === 1 && validateForOption(form.values)) return setActive(2);
                    }}
                    breakpoint="sm"
                >
                    <Stepper.Step label="Select Option">
                        <NativeSelect
                            value={form.values.netcatOptions}
                            onChange={(e) => form.setFieldValue("netcatOptions", e.target.value)}
                            title={"Netcat option"}
                            data={[
                                { value: "", label: "Pick a Netcat option", disabled: true },
                                { value: "Listen", label: "Listen" },
                                { value: "Connect", label: "Connect" },
                                { value: "Port Scan", label: "Port Scan" },
                                { value: "Send File", label: "Send File" },
                                { value: "Receive File", label: "Receive File" },
                                { value: "Website Port Scan", label: "Website Port Scan" },
                            ]}
                            required
                            error={form.errors.netcatOptions}
                        />
                    </Stepper.Step>

                    <Stepper.Step label="Provide Inputs">
                        <Stack>
                            <Switch
                                label="Enable Verbose Mode"
                                checked={checkedVerboseMode}
                                onChange={(event) => setCheckedVerboseMode(event.currentTarget.checked)}
                            />

                            {form.values.netcatOptions === "Listen" && (
                                <TextInput
                                    label={"Port number"}
                                    required
                                    {...form.getInputProps("portNumber")}
                                    error={form.errors.portNumber}
                                />
                            )}

                            {form.values.netcatOptions === "Connect" && (
                                <>
                                    <TextInput
                                        label={"Host (IPv4 / IPv6)"}
                                        required
                                        {...form.getInputProps("ipAddress")}
                                        error={form.errors.ipAddress}
                                        placeholder="93.184.216.34 or 2001:db8::1"
                                    />
                                    <TextInput
                                        label={"Port number"}
                                        required
                                        {...form.getInputProps("portNumber")}
                                        error={form.errors.portNumber}
                                    />
                                </>
                            )}

                            {form.values.netcatOptions === "Port Scan" && (
                                <>
                                    <TextInput
                                        label={"Host (domain or IP)"}
                                        required
                                        {...form.getInputProps("ipAddress")}
                                        error={form.errors.ipAddress}
                                        placeholder="example.com / 93.184.216.34 / 2001:db8::1"
                                    />
                                    <TextInput
                                        label={"Port number/Port range"}
                                        required
                                        placeholder="80 or 1-1024"
                                        {...form.getInputProps("portNumber")}
                                        error={form.errors.portNumber}
                                    />
                                </>
                            )}

                            {form.values.netcatOptions === "Send File" && (
                                <>
                                    <TextInput
                                        label={"Host (IPv4 / IPv6)"}
                                        required
                                        {...form.getInputProps("ipAddress")}
                                        error={form.errors.ipAddress}
                                        placeholder="93.184.216.34 or 2001:db8::1"
                                    />
                                    <TextInput
                                        label={"Port number"}
                                        required
                                        {...form.getInputProps("portNumber")}
                                        error={form.errors.portNumber}
                                    />
                                    <FilePicker
                                        fileNames={fileNames}
                                        setFileNames={setFileNames}
                                        multiple={false}
                                        componentName="Netcat"
                                        labelText="File"
                                        placeholderText="Click to select file"
                                    />
                                    {fileNames.length > 0 ? (
                                        <Group spacing="xs" style={{ marginTop: 8 }}>
                                            <Text size="sm">Selected file:</Text>
                                            {fileNames.map((n) => (
                                                <Badge key={n} variant="outline">
                                                    {n}
                                                </Badge>
                                            ))}
                                        </Group>
                                    ) : (
                                        form.errors.filePath && (
                                            <Text size="sm" color="red" style={{ marginTop: 8 }}>
                                                {form.errors.filePath}
                                            </Text>
                                        )
                                    )}
                                </>
                            )}

                            {form.values.netcatOptions === "Receive File" && (
                                <>
                                    <TextInput
                                        label={"Port number"}
                                        required
                                        {...form.getInputProps("portNumber")}
                                        error={form.errors.portNumber}
                                    />
                                    <TextInput
                                        label={"File path"}
                                        required
                                        {...form.getInputProps("filePath")}
                                        error={form.errors.filePath}
                                    />
                                </>
                            )}

                            {form.values.netcatOptions === "Website Port Scan" && (
                                <>
                                    <TextInput
                                        label={"Port number/Port range"}
                                        required
                                        placeholder="80 or 1-1024"
                                        {...form.getInputProps("portNumber")}
                                        error={form.errors.portNumber}
                                    />
                                    <TextInput
                                        label={"Host (domain or IP)"}
                                        required
                                        {...form.getInputProps("websiteUrl")}
                                        error={form.errors.websiteUrl}
                                        placeholder="example.com / 93.184.216.34 / 2001:db8::1"
                                    />
                                </>
                            )}
                        </Stack>
                    </Stepper.Step>

                    <Stepper.Step label="Run">
                        <Stack align="center" mt={20}>
                            <Button type="submit" disabled={loading} style={{ alignSelf: "center" }}>
                                Run Netcat
                            </Button>
                        </Stack>
                    </Stepper.Step>
                </Stepper>

                {/* Navigation buttons */}
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
                    <Button onClick={prevStep} disabled={active === 0}>
                        Previous
                    </Button>
                    <Button onClick={guardedNextStep} disabled={active === 2}>
                        Next
                    </Button>
                </div>

                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </form>
        </RenderComponent>
    );
};

export default NetcatTool;
