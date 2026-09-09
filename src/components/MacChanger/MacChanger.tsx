/* ================================
   External UI library imports
   ================================ */
import { Button, Stack, TextInput, Alert, Group } from "@mantine/core";
import { useForm } from "@mantine/form";

/* ================================
   React hooks
   ================================ */
import { useCallback, useState, useEffect, useRef } from "react";

/* ================================
   Internal utilities
   ================================ */
import { CommandHelper } from "../../utils/CommandHelper";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";

/* ================================
   Internal components
   ================================ */
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";

/**
 * Defines the structure of the MAC address form.
 */
interface FormValuesType {
    mac: string;
}

/**
 * MacChangerTool component.
 *
 * Provides a UI for viewing, spoofing, and resetting a network interface MAC address
 * using the macchanger command-line tool.
 */
function MacChangerTool() {
    // State variable to track whether a command is currently running.
    const [loading, setLoading] = useState(false);

    // State variable to store the command output displayed in the console.
    const [output, setOutput] = useState("");

    // State variable to store the process ID of the running command.
    const [pid, setPid] = useState("");

    // State variable to control whether output can be saved to a file.
    const [allowSave, setAllowSave] = useState(false);

    // State variable to track if the output has already been saved.
    const [hasSaved, setHasSaved] = useState(false);

    // State variable indicating whether the macchanger command is installed.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);

    // State variable to control the installation modal visibility.
    const [opened, setOpened] = useState(!isCommandAvailable);

    // State variable indicating whether dependency checks are still running.
    const [loadingModal, setLoadingModal] = useState(true);

    // State variable to show or hide the warning disclaimer.
    const [showAlert, setShowAlert] = useState(true);

    // Reference used to store the timeout ID for auto-hiding the warning.
    const alertTimeout = useRef<NodeJS.Timeout | null>(null);

    // Tool metadata used by the user guide wrapper.
    const title = "MacChanger";
    const dependencies = ["macchanger"];
    const description =
        "This tool allows you to view the current MAC address, spoof it using macchanger, or reset it back to the permanent hardware address.";
    const steps =
        "Step 1: Enter a valid MAC address to spoof.\n" +
        "Step 2: Click 'Show Current MAC' to display the real and active MAC.\n" +
        "Step 3: Click 'Spoof MAC' to apply the new address.\n" +
        "Step 4: Click 'Reset MAC' to restore the original one.";
    const sourceLink = "https://github.com/alobbs/macchanger";

    /**
     * Runs once on component mount.
     *
     * Checks whether required dependencies are installed and
     * sets up a timeout to auto-hide the disclaimer alert.
     */
    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable);
                setOpened(!isAvailable);
                setLoadingModal(false);
            })
            .catch(() => {
                setLoadingModal(false);
            });

        alertTimeout.current = setTimeout(() => {
            setShowAlert(false);
        }, 5000);

        return () => {
            if (alertTimeout.current) {
                clearTimeout(alertTimeout.current);
            }
        };
    }, []);

    /**
     * Appends streamed process output to the console.
     *
     * @param data - Output data received from the running process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prev) => prev + "\n" + data);
    }, []);

    /**
     * Handles process termination and updates UI state accordingly.
     *
     * @param param0 - Object containing exit code and signal.
     */
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal: ${signal}`);
            }

            setPid("");
            setLoading(false);
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    /**
     * Mantine form handler for MAC address input.
     */
    const form = useForm<FormValuesType>({
        initialValues: { mac: "" },
    });

    /**
     * Executes a system command and streams its output to the UI.
     *
     * @param cmd - Command name to execute.
     * @param args - Array of arguments passed to the command.
     */
    const runCommand = async (cmd: string, args: string[]) => {
        setAllowSave(false);
        setLoading(true);

        CommandHelper.runCommandGetPidAndOutput(cmd, args, handleProcessData, handleProcessTermination)
            .then(({ pid, output }) => {
                setOutput(output);
                setPid(pid);
            })
            .catch((error) => {
                setOutput(error.message);
                setLoading(false);
            });
    };

    /**
     * Displays the current MAC address of the network interface.
     */
    const showMac = () => {
        runCommand("macchanger", ["-s", "eth0"]);
    };

    /**
     * Spoofs the MAC address using the value provided in the form.
     *
     * @param values - Form values containing the new MAC address.
     */
    const spoofMac = (values: FormValuesType) => {
        runCommand("macchanger", ["-m", values.mac, "eth0"]);
    };

    /**
     * Resets the MAC address back to the permanent hardware address.
     */
    const resetMac = () => {
        runCommand("macchanger", ["-p", "eth0"]);
    };

    /**
     * Clears console output and resets save-related state.
     */
    const clearOutput = () => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    };

    return (
        <RenderComponent title={title} description={description} steps={steps} sourceLink={sourceLink}>
            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    dependencies={dependencies}
                    feature_description={description}
                />
            )}

            <form onSubmit={form.onSubmit((values) => spoofMac(values))}>
                <Group position="right">
                    {!showAlert && (
                        <Button onClick={() => setShowAlert(true)} size="xs" variant="outline" color="gray">
                            Show Disclaimer
                        </Button>
                    )}
                </Group>

                {LoadingOverlayAndCancelButton(loading, pid)}

                {showAlert && (
                    <Alert title="Warning" color="red">
                        Spoofing MAC addresses should only be done on systems you own or have permission to modify.
                    </Alert>
                )}

                <Stack>
                    <TextInput
                        label="New MAC address"
                        placeholder="Example: 00:04:0F:12:34:56"
                        {...form.getInputProps("mac")}
                    />

                    <Group>
                        <Button onClick={showMac} variant="outline">
                            Show Current MAC
                        </Button>

                        <Button type="submit">Spoof MAC</Button>

                        <Button onClick={resetMac} color="red" variant="outline">
                            Reset to Original
                        </Button>
                    </Group>

                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, () => setHasSaved(true))}

                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}

export default MacChangerTool;
