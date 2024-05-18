import { Button, LoadingOverlay, Stack, TextInput, Switch, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

/**
 * Represents the form values for the Harvester component.
 */
interface FormValuesType {
    domain: string;
    resultLimit: number;
    source: string;
    startresult: number;
    useshodan: boolean;
    dnslookup: boolean;
    dnsbrute: boolean;
    virtualHost: boolean;
    takeover: boolean;
}

/**
 * The Harvester component.
 * @returns The Harvester component.
 */
const TheHarvester = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [checkedAdvanced, setCheckedAdvanced] = useState(false); // State variable to indicate advanced settings.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    // Component Constants.
    const title = "The Harvester"; // Title of the component.
    const description =
        "A tool for gathering subdomain names, e-mail addresses, virtual hosts, open ports/ banners, and employee names from different public sources (search engines, pgp key servers)."; // Description of the component.
    const steps =
        "Step 1: Enter a valid domain to be harvested.\n" +
        "       Eg: kali.org\n" +
        "Step 2: Enter a limit for the requests. Default is 500 results. Can be left blank.\n" +
        "       Eg: 500\n" +
        "Step 3: Select a source to search form. The list contains compatible search engines.\n" +
        "       Eg: baidu\n" +
        "Step 4: Click Start The Harvester to commence the tool's operation.\n" +
        "Step 5: View the Output block below to view the results of the tool's execution.\n" +
        "Switch to Advanced Mode for further options.";
    const sourceLink = "https://gitlab.com/kalilinux/packages/theharvester"; // Link to the source code.
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["theHarvester"]; // Contains the dependencies required by the component.

    // Form hook to handle form input.
    let form = useForm({
        initialValues: {
            domain: "",
            resultLimit: 500,
            source: "",
            startresult: 0,
            useshodan: false,
            dnslookup: false,
            dnsbrute: false,
            virtualHost: false,
            takeover: false,
        },
    });

    // Check if the command is available and set the state variables accordingly.
    useEffect(() => {
        // Check if the command is available and set the state variables accordingly.
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable); // Set the command availability state
                setOpened(!isAvailable); // Set the modal state to opened if the command is not available
                setLoadingModal(false); // Set loading to false after the check is done
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false); // Also set loading to false in case of error
            });
    }, []);

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data received to the existing output.
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output
    }, []);

    /**
     * handleProcessTermination: Callback to handle the termination of the child process.
     * Once the process termination is handled, it clears the process PID reference and
     * deactivates the loading overlay.
     * @param {object} param - An object containing information about the process termination.
     * @param {number} param.code - The exit code of the terminated process.
     * @param {number} param.signal - The signal code indicating how the process was terminated.
     */
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            // If the process was successful, display a success message.
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");

                // If the process was terminated manually, display a termination message.
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");

                // If the process was terminated with an error, display the exit and signal codes.
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }
            // Clear the child process pid reference
            setPid("");
            // Cancel the Loading Overlay
            setLoading(false);
        },
        [handleProcessData]
    );
    // Sends a SIGTERM signal to gracefully terminate the process
    const handleCancel = () => {
        if (pid !== null) {
            const args = [`-15`, pid];
            CommandHelper.runCommand("kill", args);
        }
    };

    // Handles saving the output after the tool use
    const handleSaveComplete = () => {
        // Indicates  the file has been saved and passed into the SaveOutputToTextFile function
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the airbase-ng tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the fake host name, channel, and WLAN interface.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Construct arguments for the Harvester based on form input and if choice variables are utilised
        const args = ["-d", `${values.domain}`, "-l", `${values.resultLimit}`, "-b", `${values.source}`];
        if (values.startresult) {
            args.push(`-S ${values.startresult}`);
        }
        if (values.useshodan === true) {
            args.push(`-s`);
        }
        if (values.dnslookup === true) {
            args.push(`-n`);
        }
        if (values.dnsbrute === true) {
            args.push(`-c`);
        }
        if (values.virtualHost === true) {
            args.push(`-v`);
        }
        if (values.takeover === true) {
            args.push(`-t`);
        }
        const filteredArgs = args.filter((arg) => arg !== "");
        try {
            // Handles filtering arguments and setting the output state depending on its success or failure
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "theHarvester",
                filteredArgs,
                handleProcessData,
                handleProcessTermination
            );
            setOutput(result.output);
        } catch (e: any) {
            setOutput(e.message);
        }

        // Deactivate loading state
        setLoading(false);
    };

    // Clears the output state utilising the callback function to revert the output to an empty string
    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <RenderComponent
            title={title}
            description={description}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
        <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <LoadingOverlay visible={loading} />
            {loading && (
                <div>
                    <Button variant="outline" color="red" style={{ zIndex: 1001 }} onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            )}
                    <Switch
                        size="md"
                        label="Advanced Mode"
                        checked={checkedAdvanced}
                        onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                    />
                    <TextInput label={"Domain"} required {...form.getInputProps("domain")} />
                    <TextInput
                        label={"Limit of results searched/shown (default 500)"}
                        type="number"
                        {...form.getInputProps("resultlimit")}
                    />
                    <label>Source</label>
                    <select {...form.getInputProps("source")}>
                        <option value="baidu">Baidu</option>
                        <option value="bing">Bing</option>
                        <option value="censys">Censys</option>
                        <option value="certspotter">Certspotter</option>
                        <option value="crtsh">Crtsh</option>
                        <option value="dnsdumpster">DNSdumpster</option>
                        <option value="duckduckgo">DuckDuckGo</option>
                        <option value="exalead">Exalead</option>
                        <option value="google">Google</option>
                        <option value="hackertarget">Hackertarget</option>
                        <option value="hunter">Hunter</option>
                        <option value="intelx">Intelx</option>
                        <option value="linkedin">Linkedin</option>
                        <option value="linkedin_links">Linkedin Links</option>
                        <option value="netcraft">Netcraft</option>
                        <option value="otx">Otx</option>
                        <option value="securityTrails">SecurityTrails</option>
                        <option value="shodan">Shodan</option>
                        <option value="spyse">Spyse</option>
                        <option value="sublist3r">Sublist3r</option>
                        <option value="threatcrowd">Threatcrowd</option>
                        <option value="threatminer">Threatminer</option>
                        <option value="trello">Trello</option>
                        <option value="twitter">Twitter</option>
                        <option value="vhost">Vhost</option>
                        <option value="virustotal">Virustotal</option>
                        <option value="yahoo">Yahoo</option>
                    </select>
                    {checkedAdvanced && (
                        <>
                            <TextInput
                                label={"Start with result number X. (default 0)"}
                                type="number"
                                {...form.getInputProps("startresult")}
                            />
                            <Checkbox
                                label={"Use Shodan to query discovered hosts."}
                                type="checkbox"
                                {...form.getInputProps("useshodan")}
                            />
                            <Checkbox
                                label={"DNS Lookup (Enable DNS server lookup)"}
                                type="checkbox"
                                {...form.getInputProps("dnslookup")}
                            />
                            <Checkbox
                                label={"DNS Brute (Perform a DNS brute force on the domain.)"}
                                type="checkbox"
                                {...form.getInputProps("dnsbrute")}
                            />
                            <Checkbox
                                label={
                                    "Virtual Host (Verify host name via DNS resolution and search for virtual hosts.)"
                                }
                                type="checkbox"
                                {...form.getInputProps("virtualhost")}
                            />
                            <Checkbox
                                label={"Takeover (Check for takeovers.)"}
                                type="checkbox"
                                {...form.getInputProps("takeover")}
                            />
                        </>
                    )}
                    <br></br>
                    <Button type={"submit"}>Start {title}</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};
export default TheHarvester;
