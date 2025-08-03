// Import necessary hooks and components from React and other libraries
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

/**
 * Represents the form values for the WPScan component.
 */
interface FormValuesType {
    url: string;
    enumerationType: string;
    customEnum: string;
    detectionMode: string;
    verbose: boolean;
    outputFormat: string;
    stealthy: boolean;
    passwords: string;
    usernames: string;
    outputFile: string;
    apiToken: string;
    randomUserAgent: boolean;
    forceSsl: boolean;
    disableTlsChecks: boolean;
    httpAuth: string;
    proxy: string;
}

/**
 * The WPScan component.
 * @returns The WPScan component.
 */
function WPScan() {
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
    const [outputOpened, setOutputOpened] = useState(false);

    // Declare constants for the component
    const title = "WPScan";
    const description = "WPScan scans remote WordPress installations to find security issues";
    const steps =
        "Step 1: Enter a WordPress URL.\n" +
        "Step 2: Enter any additional parameters for the scan.\n" +
        "Step 3: Click Start " +
        title +
        " to commence WPScan's operation.\n" +
        "Step 4: View the Output block below to view the results of the tool's execution.\n" +
        "\n" +
        "API Token: For the API Token field, head to the WPScan website and make a free account.\n" +
        "           Once logged in, you can visit the API Token section and copy it into the tool.\n";
    const sourceLink = "https://github.com/wpscanteam/wpscan";
    const tutorial = "https://docs.google.com/document/d/1qkCw-Ktjih6C1R_ylEbVJlDwfJLpxmL7W7leO17AjS0/edit?usp=sharing";
    const dependencies = ["wpscan"];

    // Initialize the form hook with initial values
    const form = useForm<FormValuesType>({
        initialValues: {
            url: "",
            enumerationType: "",
            customEnum: "",
            detectionMode: "",
            verbose: false,
            outputFormat: "",
            stealthy: false,
            passwords: "",
            usernames: "",
            outputFile: "",
            apiToken: "",
            randomUserAgent: false,
            forceSsl: false,
            disableTlsChecks: false,
            httpAuth: "",
            proxy: "",
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
     * handSaveComplete: Recognises that the output file has been saved.
     * Passes the saved status back to SaveOutputToTextFile_v2
     */
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the WPScan tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);

        const args: string[] = ["--url", values.url];

        if (values.enumerationType) args.push("-e", values.enumerationType);
        if (values.customEnum) args.push("-e", values.customEnum);
        if (values.detectionMode) args.push("--detection-mode", values.detectionMode);
        if (values.verbose) args.push("--verbose");
        if (values.outputFormat) args.push("--format", values.outputFormat);
        if (values.stealthy) args.push("--stealthy");
        if (values.passwords) args.push("--passwords", values.passwords);
        if (values.usernames) args.push("--usernames", values.usernames);
        if (values.outputFile) args.push("--output", values.outputFile);
        if (values.apiToken) args.push("--api-token", values.apiToken);
        if (values.randomUserAgent) args.push("--random-user-agent");
        if (values.forceSsl) args.push("--force-ssl");
        if (values.disableTlsChecks) args.push("--disable-tls-checks");
        if (values.httpAuth) args.push("--http-auth", values.httpAuth);
        if (values.proxy) args.push("--proxy", values.proxy);

        try {
            const { pid, output } = await CommandHelper.runCommandGetPidAndOutput(
                "wpscan",
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
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <Stack>
                        <Stepper active={active} onStepClick={setActive} breakpoint="sm">
                            <Stepper.Step label="Target">
                                <TextInput label="WordPress URL" required {...form.getInputProps("url")} />
                            </Stepper.Step>
                            <Stepper.Step label="Scan Options">
                                <Grid>
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
                                            onClick={() => setOutputOpened(!outputOpened)}
                                            variant="outline"
                                            fullWidth
                                        >
                                            {outputOpened ? "Hide Output Options" : "Show Output Options"}
                                        </Button>
                                    </Grid.Col>
                                </Grid>

                                {basicOpened && (
                                    <Stack mt={10}>
                                        <Select
                                            label="Enumeration Type"
                                            data={[
                                                { value: "vp", label: "Vulnerable plugins" },
                                                { value: "ap", label: "All Plugins" },
                                                { value: "p", label: "Popular Plugins" },
                                                { value: "vt", label: "Vulnerable themes" },
                                                { value: "at", label: "All themes" },
                                                { value: "t", label: "Popular themes" },
                                                { value: "tt", label: "Timthumbs" },
                                                { value: "cb", label: "Config Backups" },
                                                { value: "dbe", label: "Db exports" },
                                                { value: "u", label: "User IDs" },
                                                { value: "m", label: "Media IDs" },
                                            ]}
                                            {...form.getInputProps("enumerationType")}
                                        />
                                        <TextInput label="Custom Enumeration" {...form.getInputProps("customEnum")} />
                                    </Stack>
                                )}

                                {advancedOpened && (
                                    <Stack mt={10}>
                                        <Select
                                            label="Detection Mode"
                                            data={[
                                                { value: "mixed", label: "Mixed" },
                                                { value: "passive", label: "Passive" },
                                                { value: "aggressive", label: "Aggressive" },
                                            ]}
                                            {...form.getInputProps("detectionMode")}
                                        />
                                        <Switch
                                            label="Verbose"
                                            {...form.getInputProps("verbose", { type: "checkbox" })}
                                        />
                                        <Switch
                                            label="Stealthy"
                                            {...form.getInputProps("stealthy", { type: "checkbox" })}
                                        />
                                        <Switch
                                            label="Random User Agent"
                                            {...form.getInputProps("randomUserAgent", { type: "checkbox" })}
                                        />
                                        <Switch
                                            label="Force SSL"
                                            {...form.getInputProps("forceSsl", { type: "checkbox" })}
                                        />
                                        <Switch
                                            label="Disable TLS Checks"
                                            {...form.getInputProps("disableTlsChecks", { type: "checkbox" })}
                                        />
                                        <TextInput label="HTTP Authentication" {...form.getInputProps("httpAuth")} />
                                        <TextInput label="Proxy" {...form.getInputProps("proxy")} />
                                    </Stack>
                                )}

                                {authOpened && (
                                    <Stack mt={10}>
                                        <TextInput label="Password List" {...form.getInputProps("passwords")} />
                                        <TextInput label="Username List" {...form.getInputProps("usernames")} />
                                        <TextInput label="API Token" {...form.getInputProps("apiToken")} />
                                    </Stack>
                                )}

                                {outputOpened && (
                                    <Stack mt={10}>
                                        <Select
                                            label="Output Format"
                                            data={[
                                                { value: "cli", label: "CLI" },
                                                { value: "json", label: "JSON" },
                                                { value: "cli-no-color", label: "CLI (No Color)" },
                                            ]}
                                            {...form.getInputProps("outputFormat")}
                                        />
                                        <TextInput label="Output File" {...form.getInputProps("outputFile")} />
                                    </Stack>
                                )}
                            </Stepper.Step>
                            <Stepper.Step label="Run">
                                <Stack align="center" mt={20}>
                                    <Button type="submit" disabled={loading} style={{ alignSelf: "center" }}>
                                        Start {title}
                                    </Button>
                                </Stack>
                            </Stepper.Step>
                        </Stepper>
                        {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                        <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                    </Stack>
                </form>
            </RenderComponent>
        </>
    );
}

export default WPScan;
