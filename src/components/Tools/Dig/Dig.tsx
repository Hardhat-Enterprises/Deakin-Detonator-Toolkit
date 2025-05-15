import { useState, useCallback, useEffect } from "react";
import { Stepper, Button, TextInput, Select, Switch, Stack, Grid, Group, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../../utils/CommandHelper";
import ConsoleWrapper from "../../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButtonPkexec } from "../../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../../utils/CommandAvailability";
import InstallationModal from "../../InstallationModal/InstallationModal";
import { RenderComponent } from "../../UserGuide/UserGuide";
import AskChatGPT from "../../AskChatGPT/AskChatGPT";
import ChatGPTOutput from "../../AskChatGPT/ChatGPTOutput";
import AskCohere from "../../AskCohere/AskCohere";
import CohereOutput from "../../AskCohere/CohereOutput";

/**
 * Represents the form values for the Dig component.
 */
interface FormValuesType {
    domain: string;
    server: string;
    queryType: string;
    queryClass: string;
    useIPv4: boolean;
    useIPv6: boolean;
    reverseMode: boolean;
    shortFormat: boolean;
    trace: boolean;
    dnssec: boolean;
    additionalOptions: string;
}

/**
 * The Dig component.
 * @returns The Dig component.
 */
function Dig() {
    // Declare state variables for component
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [chatGPTResponse, setChatGPTResponse] = useState("");
    const [hasSaved, setHasSaved] = useState(false);
    const [active, setActive] = useState(0);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [cohereResponse, setCohereResponse] = useState("");
    const [advancedOpened, setAdvancedOpened] = useState(false);

    // Declare constants for the component
    const title = "Dig";
    const description =
        "Dig (Domain Information Groper) is a flexible DNS lookup utility used to query DNS servers for information about various DNS records.";
    const steps =
        "Step 1: Enter the domain name you want to query.\n" +
        "\u2022 Domain Name/IP: Enter a website domain (example.com) or IP address (8.8.8.8)\n" +
        "\u2022 Reverse Lookup: Enable to convert an IP address back to a domain name\n" +
        "\n" +
        "Step 2: Configure lookup options including query type and DNS server.\n" +
        "\u2022 DNS Server: Optional server to use for the query (default: your system's DNS)\n" +
        "\u2022 Query Type:\n" +
        "  \u2022 A: IPv4 addresses for a domain\n" +
        "  \u2022 AAAA: IPv6 addresses for a domain\n" +
        "  \u2022 MX: Mail exchange servers\n" +
        "  \u2022 NS: Name servers\n" +
        "  \u2022 TXT: Text records (used for SPF, verification)\n" +
        "  \u2022 CNAME: Canonical name (domain aliases)\n" +
        "  \u2022 Other: Additional record types for specific needs\n" +
        "\n" +
        "Advanced Options:\n" +
        "\u2022 Query Class: IN (Internet), CH (Chaos - server info), HS (Hesiod - network directory)\n" +
        "\u2022 IPv4/IPv6 Only: Force using only one IP protocol version\n" +
        "\u2022 Short Format: Display minimal output (just answers)\n" +
        "\u2022 Trace: Follow the entire DNS resolution path\n" +
        "\u2022 DNSSEC: Check domain security signatures\n" +
        "\u2022 Additional Options: For custom parameters and advanced configurations\n" +
        "\n" +
        "Step 3: Run the Dig command and review results.\n" +
        "\u2022 Run: Execute the DNS lookup\n" +
        "\u2022 Review the output in the console\n" +
        "\u2022 Optionally analyze results with AI assistants or save to file";
    const sourceLink = "https://www.kali.org/tools/bind9/#dig";
    const tutorial = "";
    const dependencies = ["dig"];

    // Initialize the form hook with initial values
    const form = useForm<FormValuesType>({
        initialValues: {
            domain: "",
            server: "",
            queryType: "A",
            queryClass: "IN",
            useIPv4: false,
            useIPv6: false,
            reverseMode: false,
            shortFormat: false,
            trace: false,
            dnssec: false,
            additionalOptions: "",
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
     * handleSaveComplete: Recognises that the output file has been saved.
     * Passes the saved status back to SaveOutputToTextFile_v2
     */
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the Dig tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);

        const args: string[] = [];

        // Handle server specification
        // This command is used to specify the DNS server to query.
        if (values.server) {
            args.push(`@${values.server}`);
        }

        // Handle domain - check if it's reverse lookup mode
        // This command is used to specify the domain name or IP address to query.
        if (values.reverseMode) {
            args.push("-x");
            args.push(values.domain);
        } else {
            args.push(values.domain);
        }

        // Handle query type and class
        // This command is used to specify the type of DNS record to query.
        if (!values.reverseMode) {
            args.push(values.queryType);
            args.push(values.queryClass);
        }

        // Handle IPv4/IPv6 options
        // These commands are used to specify the IP version to use for the query.
        if (values.useIPv4) args.push("-4");
        if (values.useIPv6) args.push("-6");

        // Handle other options
        // These commands are used to specify additional options for the query.
        if (values.shortFormat) args.push("+short");
        if (values.trace) args.push("+trace");
        if (values.dnssec) args.push("+dnssec");

        // Handle additional options
        // This command is used to specify any additional options for the query.
        // It allows the user to pass any extra flags or parameters to the dig command.
        // This is useful for advanced users who want to customize their queries.
        if (values.additionalOptions) {
            const additionalArgs = values.additionalOptions.split(" ");
            args.push(...additionalArgs);
        }

        try {
            const { pid, output } = await CommandHelper.runCommandWithPkexec(
                "dig",
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
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, "", handleProcessData, handleProcessTermination)}
                    <Stack>
                        <Stepper active={active} onStepClick={setActive} breakpoint="sm">
                            {/* Step 1: Domain */}
                            <Stepper.Step label="Domain">
                                <Stack>
                                    <TextInput
                                        label="Domain Name or IP Address"
                                        required
                                        placeholder="example.com or 8.8.8.8"
                                        {...form.getInputProps("domain")}
                                    />
                                    <Checkbox
                                        label="Reverse Lookup (-x)"
                                        {...form.getInputProps("reverseMode", { type: "checkbox" })}
                                    />
                                </Stack>
                            </Stepper.Step>

                            {/* Step 2: Options */}
                            <Stepper.Step label="Options">
                                <Stack>
                                    <TextInput
                                        label="DNS Server (optional)"
                                        placeholder="8.8.8.8 or dns.google"
                                        {...form.getInputProps("server")}
                                    />

                                    <Select
                                        label="Query Type"
                                        data={[
                                            { value: "A", label: "A (IPv4 Address)" },
                                            { value: "AAAA", label: "AAAA (IPv6 Address)" },
                                            { value: "MX", label: "MX (Mail Exchange)" },
                                            { value: "NS", label: "NS (Name Server)" },
                                            { value: "SOA", label: "SOA (Start of Authority)" },
                                            { value: "TXT", label: "TXT (Text Records)" },
                                            { value: "CNAME", label: "CNAME (Canonical Name)" },
                                            { value: "PTR", label: "PTR (Pointer)" },
                                            { value: "SRV", label: "SRV (Service)" },
                                            { value: "ANY", label: "ANY (All Records)" },
                                        ]}
                                        {...form.getInputProps("queryType")}
                                        disabled={form.values.reverseMode}
                                    />

                                    <Button
                                        onClick={() => setAdvancedOpened(!advancedOpened)}
                                        variant="outline"
                                        fullWidth
                                    >
                                        {advancedOpened ? "Hide Advanced Options" : "Show Advanced Options"}
                                    </Button>

                                    {advancedOpened && (
                                        <>
                                            <Select
                                                label="Query Class"
                                                data={[
                                                    { value: "IN", label: "IN (Internet)" },
                                                    { value: "CH", label: "CH (Chaos)" },
                                                    { value: "HS", label: "HS (Hesiod)" },
                                                ]}
                                                {...form.getInputProps("queryClass")}
                                            />

                                            <Group>
                                                <Checkbox
                                                    label="IPv4 Only (-4)"
                                                    {...form.getInputProps("useIPv4", { type: "checkbox" })}
                                                />
                                                <Checkbox
                                                    label="IPv6 Only (-6)"
                                                    {...form.getInputProps("useIPv6", { type: "checkbox" })}
                                                />
                                            </Group>

                                            <Group>
                                                <Checkbox
                                                    label="Short Format (+short)"
                                                    {...form.getInputProps("shortFormat", { type: "checkbox" })}
                                                />
                                                <Checkbox
                                                    label="Trace (+trace)"
                                                    {...form.getInputProps("trace", { type: "checkbox" })}
                                                />
                                            </Group>

                                            <Checkbox
                                                label="DNSSEC (+dnssec)"
                                                {...form.getInputProps("dnssec", { type: "checkbox" })}
                                            />

                                            <TextInput
                                                label="Additional Options"
                                                placeholder="+nottlid +noall +answer +timeout=3"
                                                {...form.getInputProps("additionalOptions")}
                                            />
                                        </>
                                    )}
                                </Stack>
                            </Stepper.Step>

                            {/* Step 3: Run */}
                            <Stepper.Step label="Run">
                                <Stack align="center" mt={20}>
                                    <Button type="submit" disabled={loading} style={{ alignSelf: "center" }}>
                                        Run Dig
                                    </Button>
                                </Stack>
                            </Stepper.Step>
                        </Stepper>

                        {/* Navigation buttons */}
                        <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
                            <Button onClick={prevStep} disabled={active === 0}>
                                Previous
                            </Button>
                            <Button onClick={nextStep} disabled={active === 2}>
                                Next
                            </Button>
                        </div>

                        {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                        <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />

                        {/* AI Analysis */}
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
        </>
    );
}

export default Dig;
