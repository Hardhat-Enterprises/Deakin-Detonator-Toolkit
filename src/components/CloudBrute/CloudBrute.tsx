import { Button, Stack, TextInput, Alert, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect, useRef } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the CloudBrute component.
 */
interface FormValuesType {
    domain: string;
    keyword: string;
    wordlist: string;
}

/**
 * The CloudBrute component.
 * @returns The CloudBrute component.
 */
const CloudBrute = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [showAlert, setShowAlert] = useState(true);
    const alertTimeout = useRef<NodeJS.Timeout | null>(null);

    // Component Constants.
    const title = "CloudBrute";
    const description =
        "CloudBrute is a tool for cloud enumeration and infrastructure discovery in various cloud providers.";
    const steps =
        "Step 1: Enter the target domain.\n" +
        "Step 2: Enter a keyword for URL generation.\n" +
        "Step 3: Specify the path to the wordlist file.\n" +
        "Step 4: Click Start " +
        title +
        " to start the scan.\n" +
        "Step 5: View the Output block below to see the results of the scan.";
    const sourceLink = "https://www.kali.org/tools/cloudbrute/";
    const tutorial = "https://docs.google.com/document/d/1jxEqsWXp2GsNFSU-0B41MZK5EaG5csh41tzUpUX0wcw/edit?usp=sharing";
    const dependencies = ["cloudbrute"];

    // Form hook to handle form input.
    const form = useForm({
        initialValues: {
            domain: "",
            keyword: "",
            wordlist: "/usr/share/dirb/wordlists/common.txt",
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
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
        setAllowSave(true);
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
     * It sets up and triggers the CloudBrute tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the domain, keyword, and wordlist path.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);
        setHasSaved(false);
        const args = ["-d", values.domain, "-k", values.keyword, "-w", values.wordlist];
        CommandHelper.runCommandGetPidAndOutput("cloudbrute", args, handleProcessData, handleProcessTermination)
            .then(({ pid, output }) => {
                setPid(pid);
                setOutput(output);
            })
            .catch((error) => {
                setLoading(false);
                setOutput(`Error: ${error.message}`);
                setAllowSave(true);
            });
    };

    /**
     * Clears the output state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setAllowSave(false);
        setHasSaved(false);
    }, []);

    /**
     * handleSaveComplete: Recognises that the output file has been saved.
     * Passes the saved status back to SaveOutputToTextFile_v2
     */
    const handleSaveComplete = useCallback(() => {
        setHasSaved(true);
        setAllowSave(false);
    }, []);

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
                ></InstallationModal>
            )}
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    <Group position="right">
                    {!showAlert && <Button onClick={handleShowAlert} size="xs" variant="outline" color="gray">Show Disclaimer</Button>}
                    </Group>
                    {LoadingOverlayAndCancelButton(loading, pid)}

                    {showAlert && (
                        <Alert title="Warning: Potential Risks" color="red">
                            This tool is used to perform cloud enumeration, use with caution and only on cloud
                            environments you own or have explicit permission to test.
                        </Alert>
                    )}


                    <TextInput
                        label="Target Domain"
                        required
                        placeholder="e.g., google.com"
                        {...form.getInputProps("domain")}
                    />
                    <TextInput label="Keyword" required placeholder="e.g., test" {...form.getInputProps("keyword")} />
                    <TextInput
                        label="Path to Wordlist"
                        required
                        placeholder="/usr/share/dirb/wordlists/common.txt"
                        {...form.getInputProps("wordlist")}
                    />
                    <Button type="submit">Start {title}</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default CloudBrute;
