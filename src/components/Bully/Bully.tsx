import { useState, useCallback, useEffect } from "react";
import { Button, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";

/**
 * Represents the form values for the Bully component.
 */
interface FormValuesType {
    interface: string;
    bssid?: string;
    essid?: string;
}

/**
 * The Bully component.
 * @returns The Bully component.
 */
function Bully() {
    // Component State Variables.
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);

    // Component Constants.
    const title = "Bully";
    const description = "Bully is a tool for brute-forcing WPS PIN authentication.";
    const steps =
        "Step 1: Ensure that your wireless interface is in monitor mode (root privileges required).\n" +
        "Step 2: Enter the wireless interface name (e.g., wlan0mon) for the target Wi-Fi network.\n" +
        "Step 3: Provide either the MAC address (BSSID) or Extended SSID (ESSID) of the target access point.\n" +
        "Step 4: Initiate the brute-force attack: Click the 'Start Bully Attack' button to begin the attack using the provided options.\n" +
        "Step 5: Review the output: After the attack is complete, review the output to identify the cracked WPS PIN, if successful.\n";
    const sourceLink = "https://www.kali.org/tools/bully/";
    const tutorial = "";
    const dependencies = ["bully"];

    // Form hook to handle form input.
    const form = useForm<FormValuesType>({
        initialValues: {
            interface: "",
            bssid: "",
            essid: "",
        },
    });

    // Check the availability of all commands in the dependencies array.
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
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData],
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
     * It sets up and triggers the bully tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     * @param {FormValuesType} values - The form values, containing the interface, BSSID, and ESSID.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);

        if (!values.interface) {
            setOutput("Error: Please provide the wireless interface in monitor mode.");
            setLoading(false);
            setAllowSave(true);
            return;
        }

        const args = [values.interface];

        if (values.bssid) {
            args.push("--bssid", values.bssid);
        } else if (values.essid) {
            args.push("--essid", values.essid);
        } else {
            setOutput("Error: Please provide either the BSSID or ESSID of the target access point.");
            setLoading(false);
            setAllowSave(true);
            return;
        }

        try {
            const { pid, output } = await CommandHelper.runCommandWithPkexec(
                "bully",
                args,
                handleProcessData,
                handleProcessTermination,
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
                        <TextInput
                            label="Wireless Interface in Monitor Mode"
                            required
                            {...form.getInputProps("interface")}
                        />
                        <TextInput label="MAC Address (BSSID)" {...form.getInputProps("bssid")} />
                        <TextInput label="Extended SSID (ESSID)" {...form.getInputProps("essid")} />
                        <Button type={"submit"}>Start {title}</Button>
                        {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                        <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                    </Stack>
                </form>
            </RenderComponent>
        </>
    );
}

export default Bully;
