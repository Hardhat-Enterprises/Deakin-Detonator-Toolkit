// Import necessary hooks and components from React and other libraries
import { useState, useCallback, useEffect } from "react";
import { Stepper, Button, TextInput, NumberInput, Select, Switch, Stack, Grid, Group, Text, Card, Badge } from "@mantine/core";
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
        
        validate: {
        target: (value, values) => {
            if (!value.trim() && !values.inputFile.trim()) {
                return "Please enter a target URL or IP address, or provide an input file.";
        	    }

        	    return null;
        	},
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

    // Process handlers
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

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

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    // Submit handler
    const onSubmit = async (values: FormValuesType) => {
    	if (!values.target.trim() && !values.inputFile.trim()) {
   	 form.setFieldError(
   	     "target",
   	     "Please enter a target URL or IP address, or provide an input file."
  	  );
   	 setActive(0);
    	return;
	}
	
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

    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, []);

    // Navigation
    const nextStep = () => {
    if (active === 0) {
        const validation = form.validateField("target");

        if (validation.hasError) {
            return;
        }
    }

    setActive((currentStep) => (currentStep < 2 ? currentStep + 1 : currentStep));
    };
    
    const prevStep = () =>
    setActive((currentStep) =>
        currentStep > 0 ? currentStep - 1 : currentStep
    );

    const handleStepClick = (step: number) => {
    // Allow the user to return to a previous step
    if (step <= active) {
        setActive(step);
        return;
    }

    // Validate the required target before moving forward
    if (!form.values.target.trim() && !form.values.inputFile.trim()) {
        form.setFieldError(
            "target",
            "Please enter a target URL or IP address, or provide an input file."
        );
        setActive(0);
        return;
  	  }

    	setActive(step);
	};

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
    
    const extractSummary = (text: string) => {
    const targetMatch = text.match(/https?:\/\/[^\s\[]+/i);
    const statusMatch = text.match(/\[(\d{3}\s+[^\]]+)\]/);
    const titleMatch = text.match(/Title\[([^\]]+)\]/i);
    const ipMatch = text.match(/IP\[([^\]]+)\]/i);
    const serverMatch = text.match(/HTTPServer\[([^\]]+)\]/i);

    return {
        target: targetMatch?.[0] || "Not detected",
        status: statusMatch?.[1] || "Not detected",
        title: titleMatch?.[1] || "Not detected",
        ip: ipMatch?.[1] || "Not detected",
        server: serverMatch?.[1] || "Not detected",
    	};
	};

    const summary = extractSummary(output);

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
                        <Stepper active={active} onStepClick={handleStepClick} breakpoint="sm">
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
                                            <Text size="sm" c="gray.4">
   						 Controls how intensive the scan will be. Higher levels perform deeper analysis but may take longer.
					    </Text>
					    
                                        <TextInput
                                            label="Plugins"
                                            title="Specify WhatWeb plugins"
                                            {...form.getInputProps("plugins")}
                                        />
                                        <Text size="sm" c="gray.4">
    						Specify one or more WhatWeb plugins to focus the scan on particular technologies.
					</Text>
                                        
                                        <Switch
                                            label="Verbose Output"
                                            title="Enable detailed results"
                                            {...form.getInputProps("verbose", { type: "checkbox" })}
                                        />
                                        <Text size="sm" c="gray.4">
  						  Displays additional scan details for troubleshooting and analysis.
					</Text>
                                    
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

                        {active === 2 && output.trim() && (
    				<Group position="right" mb={5}>
        				<Button size="xs" onClick={() => setFullscreen((f) => !f)}>
            					{fullscreen ? "Exit Fullscreen" : "Expand Results"}
        				</Button>
    				</Group>
			)}

                        <div style={{ height: fullscreen ? "80vh" : "300px" }}>
                       
                       {active === 2 && output.trim() !== "" && (
    				<Card withBorder shadow="sm" mb="md">
        			<Stack gap="xs">
            			<Text size="lg" fw={700}>🔍 Scan Summary</Text>

            			<Group>
                			<Text fw={700}>Target:</Text>
                			<Text>{summary.target}</Text>
            			</Group>

            			<Group>
                			<Text fw={700}>Status:</Text>
                			<Badge
   						 color={summary.status.startsWith("200") ? "green" : "red"}
						>
    						{summary.status}
					</Badge>
            			</Group>

            			<Group>
                			<Text fw={700}>Title:</Text>
                			<Text>{summary.title}</Text>
            			</Group>

            			<Group>
                			<Text fw={700}>Server:</Text>
                			<Text>{summary.server}</Text>
            			</Group>

            			<Group>
                			<Text fw={700}>IP:</Text>
                			<Text>{summary.ip}</Text>
            			</Group>
        			</Stack>
    				</Card>
			)}
			
                        <ConsoleWrapper
   				 output={formatOutput(output)}
   				 clearOutputCallback={clearOutput}
			/>
                        </div>
                    </Stack>
                </form>
            </RenderComponent>
        </>
    );
}

export default WhatWeb;
