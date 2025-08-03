import { Button, Stack, TextInput, Switch, Alert, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect, useRef } from "react";
import { CommandHelper } from "../../../utils/CommandHelper";
import ConsoleWrapper from "../../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../../utils/CommandAvailability";
import InstallationModal from "../../InstallationModal/InstallationModal";

/**
 * Represents the form values for the DNSMap component.
 */
interface FormValuesType {
    domain: string;
    delay: number;
    wordlistPath: string;
    csvResultsFile: string;
    ipsToIgnore: string;
}

/**
 * The DNSMap component.
 * @returns The DNSMap component.
 */

const DNSMap = () => {
    //Componenets state Variable
    const [loading, setLoading] = useState(false); // State variable that represents loading state of the component
    const [output, setOutput] = useState(""); // State variable that represents the output text from the DNS mapping process
    const [checkedAdvanced, setCheckedAdvanced] = useState(false); //State variable that represents the state of advanced mode switch
    const [Pid, setPid] = useState(""); //State variable that represents the process ID of the DNS mapping process
    const [allowSave, setAllowSave] = useState(false); //State variable that represents whether saving the output is allowed
    const [hasSaved, setHasSaved] = useState(false); //State variable that represents whether the output has been saved
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [showAlert, setShowAlert] = useState(true);
    const alertTimeout = useRef<NodeJS.Timeout | null>(null);

    //Components Constant Variables
    const title = "Dnsmap";
    const description_userguide =
        "DNSMap scans a domain for common subdomains using a built-in or an external wordlist (if specified using -w option). " +
        "The internal wordlist has around 1000 words in English and Spanish as ns1, firewall services and smtp. " +
        "So it will be possible to search for smtp.example.com inside example.com automatically.\n\n";
    const steps =
        "Step 1: Enter a valid domain to be mapped.\n" +
        "       Eg: google.com\n\n" +
        "Step 2: Enter a delay between requests. Default is 10 (milliseconds). Can be left blank.\n" +
        "       Eg: 10\n\n" +
        "Step 3: Click 'Start Mapping' to commence the DNSMap tool's operation.\n\n" +
        "Step 4: View the Output block below to view the results of the tool's execution.\n\n" +
        "Switch to Advanced Mode for further options.";
    const sourceLink = "https://www.kali.org/tools/dnsmap/"; // Link to the source code (or Kali Tools).
    const tutorial = "https://docs.google.com/document/d/15iZ-USnXOVe-zLBLC_ROp0OTqXO_Nh7WtGO6YHfqQsc/edit?usp=sharing"; // Link to the official documentation/tutorial.
    const dependencies = ["dnsmap"]; // Contains the dependencies required by the component.

    //Form Hook to handle input
    let form = useForm({
        initialValues: {
            domain: "",
            delay: 10,
            wordlistPath: "",
            csvResultsFile: "",
            ipsToIgnore: "",
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
        // Set timeout to remove alert after 5 seconds on load.
        alertTimeout.current = setTimeout(() => {
            setShowAlert(false);
        }, 5000);

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
        }, 5000);
    };

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data received to the existing output.
     *
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Append new data to the previous output.
    }, []);

    /**
     * handleProcessTermination: Callback to handle the termination of the child process.
     * Once the process termination is handled, it clears the process PID reference and
     * deactivates the loading overlay.
     * @param {object} param0 - An object containing information about the process termination.
     * @param {number} param0.code - The exit code of the terminated process.
     * @param {number} param0.signal - The signal code indicating how the process was terminated.
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
            // Clear the child process pid reference
            setPid("");
            // Cancel the Loading Overlay
            setLoading(false);

            // Allow Saving as the output is finalised
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    /**
     * onSubmit: Handler function that is triggered when the form is submitted.
     * It prepares the arguments and initiates the execution of the `dnsmap` command.
     * Upon successful execution, it updates the state with the process PID and output.
     * If an error occurs during the command execution, it updates the output with the error message.
     * @param {FormValues} values - An object containing the form input values.
     */

    // Actions taken after saving the output
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    const onSubmit = async (values: FormValuesType) => {
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        setLoading(true);
        const args = [values.domain, "-d", `${values.delay}`];

        values.wordlistPath ? args.push(`-w`, values.wordlistPath) : undefined;

        values.csvResultsFile ? args.push(`-c`, values.csvResultsFile) : undefined;

        values.ipsToIgnore ? args.push(`-i`, values.ipsToIgnore) : undefined;

        const filteredArgs = args.filter((arg) => arg !== "");
        CommandHelper.runCommandGetPidAndOutput("dnsmap", filteredArgs, handleProcessData, handleProcessTermination)
            .then(({ pid, output }) => {
                setPid(pid);
                setOutput(output);
            })
            .catch((error) => {
                setLoading(false);
                setOutput(`Error: ${error.message}`);
            });
    };
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    return (
        <RenderComponent
            title={title}
            description={description_userguide}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description_userguide}
                    dependencies={dependencies}
                ></InstallationModal>
            )}
            <form onSubmit={form.onSubmit(onSubmit)}>
                {LoadingOverlayAndCancelButton(loading, Pid)}
                <Stack>
                    <Group position="right">
                        {!showAlert && (
                            <Button onClick={handleShowAlert} size="xs" variant="outline" color="gray">
                                Show Disclaimer
                            </Button>
                        )}
                    </Group>
                    {showAlert && (
                        <Alert title="Warning: Potential Risks" color="red">
                            This tool is used to perform DNS enumeration, use with caution and only on targets you own
                            or have explicit permission to test.
                        </Alert>
                    )}
                    <Switch
                        size="md"
                        label="Advanced Mode"
                        checked={checkedAdvanced}
                        onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                    />

                    <TextInput label={"Domain"} required {...form.getInputProps("domain")} />

                    <TextInput
                        label={"Random delay between requests (default 10)(milliseconds)"}
                        type="number"
                        {...form.getInputProps("delay")}
                    />
                    {checkedAdvanced && (
                        <>
                            <TextInput
                                label={"Path to external wordlist file"}
                                {...form.getInputProps("wordlistPath")}
                            />
                            <TextInput
                                label={"CSV results file name (optional)"}
                                {...form.getInputProps("csvResultsFile")}
                            />
                            <TextInput
                                label={"IP addresses to ignore (comma-separated, up to 5 IPs)"}
                                {...form.getInputProps("ipsToIgnore")}
                            />
                        </>
                    )}
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type={"submit"}>Start Mapping</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default DNSMap;
