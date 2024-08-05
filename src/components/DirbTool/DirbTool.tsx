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
 * Represents the form values for the Dirb component.
 */
interface FormValuesType {
    // Define the properties for the form values
    url: string;
    wordlistPath: string;
    wordlistSize: string;
    caseInsensitive: boolean;
    printLocation: boolean;
    ignoreHttpCode: number;
    outputFile: string;
    nonRecursive: boolean;
    silentMode: boolean;
    userAgent: string | null;
    squashSequences: boolean;
    cookie: string;
    certificatePath: string;
    customHeader: string;
    proxy: string | null;
    proxyAuth: string;
    interactiveRecursion: boolean;
    username: string;
    password: string;
    showNonExistent: boolean;
    stopOnWarning: boolean;
    extensionsFile: string;
    extensions: string;
    delay: number;
}

/**
 * The Dirb component.
 * @returns The Dirb component.
 */
function Dirb() {
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
    const title = "Dirb";
    const description =
        "Dirb is a Web Content Scanner. It looks for existing (and/or hidden) Web Objects. It basically works by launching a dictionary-based attack against a web server and analyzing the response.";
    const steps =
        "Step 1: Enter the base URL.\n" +
        "Step 2: Select the desired parameters for the Dirb command, including the wordlist size.\n" +
        "Step 3: Click the 'Run Dirb' button to initiate the scanning process.\n" +
        "Step 4: Review the output in the console to identify any detected web objects or hidden content.\n";
    const sourceLink = "";
    const tutorial = "";
    const dependencies = ["dirb"];

    // Initialize the form hook with initial values
    const form = useForm<FormValuesType>({
        initialValues: {
            url: "",
            wordlistPath: "",
            wordlistSize: "default", // Set the default wordlist size
            caseInsensitive: false,
            printLocation: false,
            ignoreHttpCode: 0,
            outputFile: "",
            nonRecursive: false,
            silentMode: false,
            userAgent: null,
            squashSequences: false,
            cookie: "",
            certificatePath: "",
            customHeader: "",
            proxy: null,
            proxyAuth: "",
            interactiveRecursion: false,
            username: "",
            password: "",
            showNonExistent: false,
            stopOnWarning: false,
            extensionsFile: "",
            extensions: "",
            delay: 0,
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
     * It sets up and triggers the Dirb tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     */
    const onSubmit = async () => {
        setLoading(true);
        setAllowSave(false);

        const args = [form.values.url];

        // Handle wordlist path based on selected wordlist size
        if (form.values.wordlistPath) {
            args.push(form.values.wordlistPath);
        } else {
            switch (form.values.wordlistSize) {
                case "short":
                    args.push("/usr/share/dirb/wordlists/small.txt");
                    break;
                case "long":
                    args.push("/usr/share/dirb/wordlists/big.txt");
                    break;
                case "big":
                    args.push("/usr/share/dirb/wordlists/biggest.txt");
                    break;
                default:
                    // Use the default wordlist
                    break;
            }
        }

        if (form.values.caseInsensitive) {
            args.push("-i");
        }

        if (form.values.printLocation) {
            args.push("-l");
        }

        if (form.values.ignoreHttpCode > 0) {
            args.push("-N", form.values.ignoreHttpCode.toString());
        }

        if (form.values.outputFile) {
            args.push("-o", form.values.outputFile);
        }

        if (form.values.nonRecursive) {
            args.push("-r");
        }

        if (form.values.silentMode) {
            args.push("-S");
        }

        if (form.values.userAgent !== null) {
            args.push("-a", form.values.userAgent);
        }

        if (form.values.squashSequences) {
            args.push("-b");
        }

        if (form.values.cookie) {
            args.push("-c", form.values.cookie);
        }

        if (form.values.certificatePath) {
            args.push("-E", form.values.certificatePath);
        }

        if (form.values.customHeader) {
            args.push("-H", form.values.customHeader);
        }

        if (form.values.proxy !== null) {
            args.push("-p", form.values.proxy);
        }

        if (form.values.proxyAuth) {
            args.push("-P", form.values.proxyAuth);
        }

        if (form.values.interactiveRecursion) {
            args.push("-R");
        }

        if (form.values.username && form.values.password) {
            args.push("-u", `${form.values.username}:${form.values.password}`);
        }

        if (form.values.showNonExistent) {
            args.push("-v");
        }

        if (form.values.stopOnWarning) {
            args.push("-w");
        }

        if (form.values.extensionsFile) {
            args.push("-x", form.values.extensionsFile);
        }

        if (form.values.extensions) {
            args.push("-X", form.values.extensions);
        }

        if (form.values.delay > 0) {
            args.push("-z", form.values.delay.toString());
        }

        try {
            const { pid, output } = await CommandHelper.runCommandGetPidAndOutput(
                "dirb",
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
                                <TextInput label="URL" required {...form.getInputProps("url")} />
                            </Stepper.Step>
                            {/* Step 2: Parameters */}
                            <Stepper.Step label="Parameters">
                                <TextInput label="Wordlist Path" {...form.getInputProps("wordlistPath")} />
                                <Select
                                    label="Wordlist Size"
                                    data={[
                                        { value: "default", label: "Default" },
                                        { value: "short", label: "Short" },
                                        { value: "long", label: "Long" },
                                        { value: "big", label: "Big" },
                                    ]}
                                    {...form.getInputProps("wordlistSize")}
                                />

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
                                        <Switch
                                            label="Case Insensitive"
                                            mt={20}
                                            {...form.getInputProps("caseInsensitive", {
                                                type: "checkbox",
                                            })}
                                        />
                                        <Switch
                                            label="Print Location"
                                            mt={20}
                                            {...form.getInputProps("printLocation", {
                                                type: "checkbox",
                                            })}
                                        />
                                        <NumberInput
                                            label="Ignore HTTP Code"
                                            min={0}
                                            {...form.getInputProps("ignoreHttpCode")}
                                        />
                                        <TextInput label="Output File" {...form.getInputProps("outputFile")} />
                                    </Stack>
                                )}

                                {/* Render Advanced Options */}
                                {advancedOpened && (
                                    <Stack mt={10}>
                                        <Switch
                                            label="Non-Recursive"
                                            mt={20}
                                            {...form.getInputProps("nonRecursive", {
                                                type: "checkbox",
                                            })}
                                        />
                                        <Switch
                                            label="Silent Mode"
                                            mt={20}
                                            {...form.getInputProps("silentMode", {
                                                type: "checkbox",
                                            })}
                                        />
                                        <TextInput label="User Agent" {...form.getInputProps("userAgent")} />
                                        <Switch
                                            label="Squash Sequences"
                                            mt={20}
                                            {...form.getInputProps("squashSequences", {
                                                type: "checkbox",
                                            })}
                                        />
                                    </Stack>
                                )}

                                {/* Render Authentication Options */}
                                {authOpened && (
                                    <Stack mt={10}>
                                        <TextInput label="Cookie" {...form.getInputProps("cookie")} />
                                        <TextInput
                                            label="Certificate Path"
                                            {...form.getInputProps("certificatePath")}
                                        />
                                        <TextInput label="Custom Header" {...form.getInputProps("customHeader")} />
                                        <TextInput label="Proxy" {...form.getInputProps("proxy")} />
                                        <TextInput label="Proxy Authentication" {...form.getInputProps("proxyAuth")} />
                                        <Switch
                                            label="Interactive Recursion"
                                            mt={20}
                                            {...form.getInputProps("interactiveRecursion", {
                                                type: "checkbox",
                                            })}
                                        />
                                        <TextInput label="Username" {...form.getInputProps("username")} />
                                        <TextInput label="Password" {...form.getInputProps("password")} />
                                    </Stack>
                                )}

                                {/* Render Additional Options */}
                                {additionalOpened && (
                                    <Stack mt={10}>
                                        <Switch
                                            label="Show Non-Existent Pages"
                                            mt={20}
                                            {...form.getInputProps("showNonExistent", {
                                                type: "checkbox",
                                            })}
                                        />
                                        <Switch
                                            label="Stop on Warning"
                                            mt={20}
                                            {...form.getInputProps("stopOnWarning", {
                                                type: "checkbox",
                                            })}
                                        />
                                        <TextInput label="Extensions File" {...form.getInputProps("extensionsFile")} />
                                        <TextInput label="Extensions" {...form.getInputProps("extensions")} />
                                        <NumberInput label="Delay (ms)" min={0} {...form.getInputProps("delay")} />
                                    </Stack>
                                )}
                            </Stepper.Step>
                            {/* Step 3: Run */}
                            <Stepper.Step label="Run">
                                <Stack align="center" mt={20}>
                                    <Button type="submit" disabled={loading} style={{ alignSelf: "center" }}>
                                        Run Dirb
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

export default Dirb;
