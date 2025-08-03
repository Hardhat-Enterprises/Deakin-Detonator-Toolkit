import { Button, Stack, TextInput, Switch, SimpleGrid } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../../utils/CommandHelper";
import ConsoleWrapper from "../../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../../UserGuide/UserGuide";
import { LoadingOverlayAndCancelButtonPkexec } from "../../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../../utils/CommandAvailability";
import InstallationModal from "../../InstallationModal/InstallationModal";

/**
 * Represents the form values for the Photon component.
 */
interface FormValuesType {
    url: string;
    outputDir: string;
    crawlDepth: string;
    cookies: string;
    userAgent: string;
    threads: string;
    delay: string;
    seeds: string;
    verbose: string;
    timeout: string;
    exclude: string;
    headers: string;
    onlyUrls: string;
    extractKeys: string;
}

/**
 * The Photon component.
 * @returns The Photon component.
 */
const Photon = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [loadingModal, setLoadingModal] = useState(true); // State variable that indicates if the modal is opened.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable to indicate loading state of the modal.
    const [advancedMode, setAdvancedMode] = useState(false);
    const [crawlDepth, setCrawlDepth] = useState(false);
    const [showCookies, setShowCookies] = useState(false);
    const [showUserAgent, setShowUserAgent] = useState(false);
    const [showThreads, setShowThreads] = useState(false);
    const [showDelay, setShowDelay] = useState(false);
    const [showSeeds, setShowSeeds] = useState(false);
    const [verbose, setVerbose] = useState(false);
    const [showTimeout, setShowTimeout] = useState(false);
    const [showExclude, setShowExclude] = useState(false);
    const [showHeaders, setShowHeaders] = useState(false);
    const [onlyUrls, setOnlyUrls] = useState(false);
    const [extractKeys, setExtractKeys] = useState(false);

    // Component Constants.
    const title = "Photon";
    const description =
        "Photon is a fast crawler designed for extracting URLs, endpoints, and more from target websites.";
    const steps =
        "Step 1: Enter a valid target URL (e.g. https://www.deakin.edu.au).\n" +
        "Step 2: Specify the output directory where results will be saved.\n" +
        "Step 3 (Optional): Enable advanced options to refine the scan:\n" +
        "- Crawl Depth: Limits how deep Photon traverses links on the target site.\n" +
        "- Threads: Define the number of concurrent threads for faster processing. Can help speed up crawling, but might also trigger security mechanisms or overwhelm smaller websites.\n" +
        "- Delay: Introduce a delay between requests to reduce server load. Must be a whole number (integer, in seconds).\n" +
        "- Timeout: Set the maximum time (in seconds) to wait for a response.\n" +
        "- Cookies: Provide session cookies for authenticated crawling. Can allow access content behind login pages or user-specific sessions.\n" +
        "- User-Agent: Set a custom User-Agent string for requests. Can mimic specific browsers or devices and avoid basic bot detection.\n" +
        "- Seeds: Provide additional seed URLs to begin scanning from.\n" +
        "- Exclude: Use regex to exclude specific URLs from being crawled.\n" +
        "- Headers: Add custom headers to all HTTP requests. Useful for mimicking browser behaviour, setting authentication tokens, or bypassing certain restrictions.\n" +
        "- Verbose: Increase output detail for debugging or deeper inspection.\n" +
        "- Only URLs: Collect and return only discovered URLs without performing further crawling.\n" +
        "- Extract Keys: Searches for high-entropy strings that may indicate authentication tokens, API keys, or cryptographic hashes.\n" +
        "Step 4: Click Start Photon to begin scanning.\n" +
        "Step 5: View the output results displayed below.";
    const sourceLink = "https://www.kali.org/tools/photon/";
    const tutorial = "https://docs.google.com/document/d/1KhrGuwq3N3NHzLmxTV_7s8buNy2ykOVX3alfx_C7V8s/edit?usp=sharing";
    const dependencies = ["photon"]; // Contains the dependencies required by the component.

    // Form hook to handle form input.
    let form = useForm({
        initialValues: {
            url: "",
            outputDir: "",
            crawlDepth: "",
            cookies: "",
            userAgent: "",
            threads: "",
            delay: "",
            seeds: "",
            verbose: "",
            timeout: "",
            exclude: "",
            headers: "",
            onlyUrls: "",
            extractKeys: "",
        },
    });

    // Check if the command is available and set the state variables accordingly.
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
     * Once the process termination is handled, it clears the process PID reference and deactivates the loading overlay.
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

            setPid("");
            setLoading(false);
        },
        [handleProcessData]
    );

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the Photon tool with the given parameters.
     * @param {FormValuesType} values - The form values containing the url, output directory, crawl depth, cookies, and user agent.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);

        // Create the arguments array for the command
        const args = [];
        if (values.url) args.push("-u", values.url);
        if (values.outputDir) args.push("-o", values.outputDir);
        if (values.crawlDepth) args.push("-l", values.crawlDepth);
        if (values.cookies) args.push("-c", values.cookies);
        if (values.userAgent) args.push("--user-agent", values.userAgent);
        if (values.threads) args.push("-t", values.threads);
        if (values.delay) args.push("-d", values.delay);
        if (values.seeds) args.push("-s", values.seeds);
        if (values.timeout) args.push("--timeout", values.timeout);
        if (values.exclude) args.push("--exclude", values.exclude);
        if (values.headers) args.push("--headers", values.headers);
        if (verbose) args.push("-v");
        if (onlyUrls) args.push("--only-urls");
        if (extractKeys) args.push("--keys");

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "photon",
                args,
                handleProcessData,
                handleProcessTermination
            );

            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any) {
            setOutput(e.message);
            setLoading(false);
        }
    };

    /**
     * Clears the output state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    // Resets all advanced mode entered values to their default state
    // Add any new advanced mode options that require user input here
    const clearAdvancedFormValues = () => {
        form.setValues({
            crawlDepth: "",
            cookies: "",
            userAgent: "",
            threads: "",
            delay: "",
            seeds: "",
            timeout: "",
            exclude: "",
            headers: "",
        });
    };

    // Resets all advanced mode toggles and entered values to their default state
    // Add any new advanced mode options here
    const resetAdvancedModeOptions = () => {
        setCrawlDepth(false);
        setShowCookies(false);
        setShowUserAgent(false);
        setShowThreads(false);
        setShowDelay(false);
        setShowSeeds(false);
        setShowTimeout(false);
        setShowExclude(false);
        setShowHeaders(false);
        setVerbose(false);
        setOnlyUrls(false);
        setExtractKeys(false);

        clearAdvancedFormValues();
    };

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
                <Stack>
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, "", handleProcessData, handleProcessTermination)}
                    <Switch
                        size="md"
                        label="Advanced Mode"
                        checked={advancedMode}
                        onChange={(e) => {
                            const isChecked = e.currentTarget.checked;
                            setAdvancedMode(isChecked);
                            clearAdvancedFormValues();
                            if (!isChecked) resetAdvancedModeOptions();
                        }}
                    />
                    <TextInput
                        label={"URL of the target"}
                        placeholder={"e.g., https://example.com"}
                        required
                        {...form.getInputProps("url")}
                    />
                    <TextInput
                        label={"Output Directory"}
                        placeholder={"Specify the output directory"}
                        required
                        {...form.getInputProps("outputDir")}
                    />
                    {advancedMode && (
                        <>
                            <SimpleGrid cols={6} spacing="md" verticalSpacing="sm">
                                <Switch
                                    size="md"
                                    label="Crawl Depth"
                                    checked={crawlDepth}
                                    onChange={(e) => {
                                        const isChecked = e.currentTarget.checked;
                                        setCrawlDepth(isChecked);
                                        if (!isChecked) {
                                            form.setFieldValue("crawlDepth", "");
                                        }
                                    }}
                                />
                                <Switch
                                    size="md"
                                    label="Threads"
                                    checked={showThreads}
                                    onChange={(e) => {
                                        const isChecked = e.currentTarget.checked;
                                        setShowThreads(isChecked);
                                        if (!isChecked) {
                                            form.setFieldValue("threads", "");
                                        }
                                    }}
                                />
                                <Switch
                                    size="md"
                                    label="Delay"
                                    checked={showDelay}
                                    onChange={(e) => {
                                        const isChecked = e.currentTarget.checked;
                                        setShowDelay(isChecked);
                                        if (!isChecked) {
                                            form.setFieldValue("delay", "");
                                        }
                                    }}
                                />
                                <Switch
                                    size="md"
                                    label="Timeout"
                                    checked={showTimeout}
                                    onChange={(e) => {
                                        const isChecked = e.currentTarget.checked;
                                        setShowTimeout(isChecked);
                                        if (!isChecked) {
                                            form.setFieldValue("timeout", "");
                                        }
                                    }}
                                />
                                <Switch
                                    size="md"
                                    label="Cookies"
                                    checked={showCookies}
                                    onChange={(e) => {
                                        const isChecked = e.currentTarget.checked;
                                        setShowCookies(isChecked);
                                        if (!isChecked) {
                                            form.setFieldValue("cookies", "");
                                        }
                                    }}
                                />
                                <Switch
                                    size="md"
                                    label="User Agent"
                                    checked={showUserAgent}
                                    onChange={(e) => {
                                        const isChecked = e.currentTarget.checked;
                                        setShowUserAgent(isChecked);
                                        if (!isChecked) {
                                            form.setFieldValue("userAgent", "");
                                        }
                                    }}
                                />
                                <Switch
                                    size="md"
                                    label="Seeds"
                                    checked={showSeeds}
                                    onChange={(e) => {
                                        const isChecked = e.currentTarget.checked;
                                        setShowSeeds(isChecked);
                                        if (!isChecked) {
                                            form.setFieldValue("seeds", "");
                                        }
                                    }}
                                />
                                <Switch
                                    size="md"
                                    label="Exclude"
                                    checked={showExclude}
                                    onChange={(e) => {
                                        const isChecked = e.currentTarget.checked;
                                        setShowExclude(isChecked);
                                        if (!isChecked) {
                                            form.setFieldValue("exclude", "");
                                        }
                                    }}
                                />
                                <Switch
                                    size="md"
                                    label="Headers"
                                    checked={showHeaders}
                                    onChange={(e) => {
                                        const isChecked = e.currentTarget.checked;
                                        setShowHeaders(isChecked);
                                        if (!isChecked) {
                                            form.setFieldValue("headers", "");
                                        }
                                    }}
                                />
                                <Switch
                                    size="md"
                                    label="Verbose"
                                    checked={verbose}
                                    onChange={(e) => {
                                        const isChecked = e.currentTarget.checked;
                                        setVerbose(isChecked);
                                    }}
                                />
                                <Switch
                                    size="md"
                                    label="Only URLs"
                                    checked={onlyUrls}
                                    onChange={(e) => {
                                        const isChecked = e.currentTarget.checked;
                                        setOnlyUrls(isChecked);
                                    }}
                                />
                                <Switch
                                    size="md"
                                    label="Extract Keys"
                                    checked={extractKeys}
                                    onChange={(e) => {
                                        const isChecked = e.currentTarget.checked;
                                        setExtractKeys(isChecked);
                                    }}
                                />
                            </SimpleGrid>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                {crawlDepth && (
                                    <TextInput
                                        label="Crawl Depth"
                                        placeholder="e.g., 2"
                                        style={{ flex: 1 }}
                                        {...form.getInputProps("crawlDepth")}
                                    />
                                )}
                                {showThreads && (
                                    <TextInput
                                        label="Threads"
                                        placeholder="e.g., 4"
                                        style={{ flex: 1 }}
                                        {...form.getInputProps("threads")}
                                    />
                                )}
                                {showDelay && (
                                    <TextInput
                                        label="Delay (seconds)"
                                        placeholder="e.g., 1"
                                        style={{ flex: 1 }}
                                        {...form.getInputProps("delay")}
                                    />
                                )}
                                {showTimeout && (
                                    <TextInput
                                        label="Timeout (seconds)"
                                        placeholder="e.g., 10"
                                        style={{ flex: 1 }}
                                        {...form.getInputProps("timeout")}
                                    />
                                )}
                            </div>
                            {showCookies && (
                                <TextInput
                                    label="Cookies"
                                    placeholder="e.g., sessionid=abc123; theme=light"
                                    {...form.getInputProps("cookies")}
                                />
                            )}
                            {showUserAgent && (
                                <TextInput
                                    label="User Agent"
                                    placeholder="e.g., Mozilla/5.0 (X11; Linux x86_64)"
                                    {...form.getInputProps("userAgent")}
                                />
                            )}
                            {showSeeds && (
                                <TextInput
                                    label="Seed URLs"
                                    placeholder="e.g., http://example.com/portals.html"
                                    {...form.getInputProps("seeds")}
                                />
                            )}
                            {showExclude && (
                                <TextInput
                                    label="Exclude Regex"
                                    placeholder="e.g., /blog/20[17|18]"
                                    {...form.getInputProps("exclude")}
                                />
                            )}
                            {showHeaders && (
                                <TextInput
                                    label="HTTP Headers"
                                    placeholder='e.g., {"Authorization": "Bearer xyz"}'
                                    {...form.getInputProps("headers")}
                                />
                            )}
                        </>
                    )}
                    <Button type={"submit"}>Start {title}</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Photon;
