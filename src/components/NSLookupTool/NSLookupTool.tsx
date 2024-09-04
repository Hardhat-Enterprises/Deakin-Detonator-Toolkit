import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { installDependencies } from "../../utils/InstallHelper";

/**
 * Title and Description of the tool
 */
const title = "NSLookup";
const description =
    "The NSLookup command is a tool used to query Domain Name System (DNS) servers and retrieve information about a specific domain or IP address. This command is an essential tool for network administrators and system engineers as it can be used to troubleshoot DNS issues and gather information about DNS configurations.";
const steps =
    "How to use NSLookup.\n\n" +
    "Step 1: Enter an IP or Web URL.\n" +
    "E.g. 127.0.0.1\n\n" +
    "Step 2: View the Output block below to view the results of the Scan.";
const sourceLink = "https://www.nslookup.io"; //For Render Compomnet

// Form Value Interface
interface FormValuesType {
    ipAddress: string; // IP Address that needs to be looked up
}

function NSLookup() {
    // State the Variables
    const [loading, setLoading] = useState(false); // Indication of running the process
    const [pid, setPid] = useState(""); // Process ID
    const [output, setOutput] = useState(""); // Output
    const [allowSave, setAllowSave] = useState(false); // Looking whether the process can be saved
    const [hasSaved, setHasSaved] = useState(false); // Indication of saved process
    const [opened, setOpened] = useState(false); // Modal open state
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // Command Availability state
    const [loadingModal, setLoadingModal] = useState(true); // Loading state for modal
    const dependencies = ["bind9"];

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

    // Form Hook to handle form input
    const form = useForm({
        initialValues: {
            ipAddress: "",
        },
    });

    // Handling the processed data output
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    // Process Termination
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
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    // Updating the state of Saving the output
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    // Handling the submitted form
    const onSubmit = (values: FormValuesType) => {
        const ipAddress = values.ipAddress.trim();
        if (!ipAddress) {
            setOutput("Error: No IP address or hostname provided.");
            return;
        }

        setAllowSave(false);
        setLoading(true);

        CommandHelper.runCommandGetPidAndOutput("nslookup", [ipAddress], handleProcessData, handleProcessTermination)
            .then(({ pid, output }: { pid: string; output: string }) => {
                setPid(pid);
                setOutput(output);
            })
            .catch((error) => {
                setLoading(false);
                setOutput(`Error: ${error.message}`);
            });
    };

    // Clearing the output
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    return (
        <>
            <RenderComponent
                title={title}
                description={description}
                steps={steps}
                tutorial={""} // Empty string since we don't need the tutorial section
                sourceLink={sourceLink} // This will output the link to NSLookup
                children={""}
            />

            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description}
                    dependencies={dependencies}
                />
            )}
            <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                {LoadingOverlayAndCancelButton(loading, pid)}
                <Stack>
                    <TextInput
                        label={"Please enter the IP Address for NSLookup"}
                        required
                        {...form.getInputProps("ipAddress")}
                    />

                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type={"submit"}>Start {title}</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </>
    );
}

export default NSLookup;
