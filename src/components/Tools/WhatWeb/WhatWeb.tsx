// Import necessary hooks and components from React and other libraries
import { useState, useCallback, useEffect } from "react";
import { Stepper, Button, TextInput, NumberInput, Select, Switch, Stack, Grid } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../../utils/CommandHelper";
import ConsoleWrapper from "../../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../../utils/CommandAvailability";
import InstallationModal from "../../InstallationModal/InstallationModal";
import { RenderComponent } from "../../UserGuide/UserGuide";

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

    // Additional state variables for section visibility
    const [basicOpened, setBasicOpened] = useState(true);
    const [advancedOpened, setAdvancedOpened] = useState(false);
    const [authOpened, setAuthOpened] = useState(false);

    // Declare constants for the component
    const title = "WhatWeb";
    const description =
        "WhatWeb identifies websites. It recognises web technologies including content management systems, blogging platforms, statistic/analytics packages, JavaScript libraries, web servers, and embedded devices.";
    const steps =
        "Step 1: Enter the target URL or IP address.\n" +
        "Step 2: Configure scan options.\n" +
        "Step 3: Run WhatWeb and review results.";
    const sourceLink = "https://github.com/urbanadventurer/WhatWeb";
    const tutorial = "https://docs.google.com/document/d/1IUrB6sX_Ykk5hyrcelRSwi4l7QMqc_YxpyEPCmUarzc/edit?usp=sharing";
    const dependencies = ["whatweb"];

    // Initialize the form hook with initial values
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
     * It sets up and triggers the WhatWeb tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);

        const args: string[] = [];

        if (values.inputFile) args.push(`-i ${values.inputFile}`);
        if (values.aggression) args.push(`-a ${values.aggression}`);
        if (values.userAgent) args.push(`-U "${values.userAgent}"`);
        if (values.followRedirect) args.push(`--follow-redirect=${values.followRedirect}`);
        if (values.user) args.push(`-u ${values.user}`);
        if (values.cookie) args.push(`-c "${values.cookie}"`);
        if (values.plugins) args.push(`-p ${values.plugins}`);
        if (values.verbose) args.push("-v");
        if (values.logFormat) args.push(`--log-${values.logFormat}=-`);
        if (values.maxThreads > 0) args.push(`-t ${values.maxThreads}`);

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
                    ></InstallationModal>
                )}
                <form onSubmit={form.onSubmit(onSubmit)}>
                    {/* Render the loading overlay and cancel button */}
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <Stack>
                        {/* Render the Stepper component with steps */}
                        <Stepper active={active} onStepClick={setActive} breakpoint="sm">
                            {/* Step 1: Target */}
                            <Stepper.Step label="Target">
                                <TextInput label="Target URL or IP" required {...form.getInputProps("target")} />
                                <TextInput label="Input File" {...form.getInputProps("inputFile")} />
                            </Stepper.Step>
                            {/* Step 2: Scan Options */}
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

                                {/* Render Basic Options */}
                                {basicOpened && (
                                    <Stack mt={10}>
                                        <Select
                                            label="Aggression Level"
                                            data={[
                                                { value: "", label: "Default" },
                                                { value: "1", label: "Stealthy" },
                                                { value: "3", label: "Aggressive" },
                                                { value: "4", label: "Heavy" },
                                            ]}
                                            {...form.getInputProps("aggression")}
                                        />
                                        <TextInput label="Plugins" {...form.getInputProps("plugins")} />
                                        <Switch
                                            label="Verbose Output"
                                            {...form.getInputProps("verbose", { type: "checkbox" })}
                                        />
                                    </Stack>
                                )}

                                {/* Render Advanced Options */}
                                {advancedOpened && (
                                    <Stack mt={10}>
                                        <TextInput label="User Agent" {...form.getInputProps("userAgent")} />
                                        <Select
                                            label="Follow Redirect"
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
                                            min={0}
                                            {...form.getInputProps("maxThreads")}
                                        />
                                        <Select
                                            label="Log Format"
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

                                {/* Render Authentication Options */}
                                {authOpened && (
                                    <Stack mt={10}>
                                        <TextInput label="User (user:password)" {...form.getInputProps("user")} />
                                        <TextInput label="Cookie" {...form.getInputProps("cookie")} />
                                    </Stack>
                                )}
                            </Stepper.Step>
                            {/* Step 3: Run */}
                            <Stepper.Step label="Run">
                                <Stack align="center" mt={20}>
                                    <Button type="submit" disabled={loading} style={{ alignSelf: "center" }}>
                                        Run WhatWeb
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

export default WhatWeb;
