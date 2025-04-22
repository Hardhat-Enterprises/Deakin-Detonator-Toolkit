import { useState, useCallback, useEffect } from "react";
import { Button, NativeSelect, Stack, TextInput, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";

/**
 * Represents the form values for the Tcpdump component.
 * @field interface: The interface used when listening for traffic
 * @field Optionswitch: Allows the user to select the different options for scanning.
 */
interface FormValuesType {
    interface: string;
    Tcpdumpswitch: string;
}

enum tcpdumpOptions {
    "First 5 packets",
    "TCP packets only",
    "Detailed output",
    "DHCP capture",
    "Syn/Ack packets",
}

/**
 * The Tcpdump component.
 * @returns The TcpDump component.
 */
function Tcpdump() {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [selectedScanOption, setSelectedTcpdumpOption] = useState(""); // State to store the selected scan type.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable to check if the installation modal is open.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state for the installation modal.

    // Component Constants.
    const title = "Tcpdump"; // Title of the component.
    const description =
        "Tcpdump is a packet analysis tool that allows a user to view packets being transmitted over the local " +
        "network. It is often used to troubleshoot network issues. It includes the ability to filter traffic " +
        "by features such as network protocol, IP address or interface. "; // Description of the component.
    const steps =
        "Step 1: Enter the network interface you wish to scan.\n" +
        "\tExamples: wlan0, eth0, lo.\n" +
        "Step 2: Select one of the scanning options. The command will be formatted to " +
        "produce the type of scan selected.\n" +
        "Step 3: Click start to view the output block below and see the results of the scan.\n";
    const sourceLink = "https://www.tcpdump.org/"; // Link to the source code or Kali Tools page.
    const tutorial = "https://www.tcpdump.org/manpages/"; // Link to the official documentation/tutorial.
    const dependencies = ["tcpdump"]; // Usually pre-installed with most Linux distributions, but best to double check.

    // Form hook to handle form input.
    const form = useForm<FormValuesType>({
        initialValues: {
            interface: "",
            Tcpdumpswitch: tcpdumpOptions[0],
        },
    });

    // Check the availability of commands in the dependencies array.
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
            // If the process was successful, display a success message.
            if (code === 0) {
                handleProcessData("\nPacket capture completed successfully.");

                // If the process was terminated manually, display a termination message.
            } else if (signal === 15) {
                handleProcessData("\nPacket capture was manually terminated.");

                // If the process was terminated with an error, display the exit and signal codes.
            } else {
                handleProcessData(`\nPacket capture terminated with exit code: ${code} and signal code: ${signal}`);
            }

            // Cancel the loading overlay. The process has completed.
            setLoading(false);

            // Now that loading has completed, allow the user to save the output to a file.
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the ARPScan tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     * @param {FormValuesType} values - The form values, containing the network address and tcp option.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        let switchArgs = "-c 5"; // default option

        //Switch for options other than default
        if (values.Tcpdumpswitch == tcpdumpOptions[1]) {
            switchArgs = "-c 20 tcp port 80";
        } else if (values.Tcpdumpswitch == tcpdumpOptions[2]) {
            switchArgs = "-c 5 -vv";
        } else if (values.Tcpdumpswitch == tcpdumpOptions[3]) {
            switchArgs = "-c 10 -v -n port 67 or 68";
        } else if (values.Tcpdumpswitch == tcpdumpOptions[4]) {
            switchArgs = "-c 5 -vv 'tcp[tcpflags] = 0x12'";
        }

        const args = ["-i", values.interface, switchArgs];

        // Try execute the Tcpdump command via helper method and handle its output or potential errors
        try {
            const { output, pid } = await CommandHelper.runCommandWithPkexec(
                dependencies[0],
                args,
                handleProcessData,
                handleProcessTermination
            );
            setOutput(output);
            setAllowSave(true);
            setPid(pid);
        } catch (error: any) {
            // Display any errors encountered during command execution
            setOutput(error.message || "An unknown error occurred.");
            setLoading(false); // Deactivate loading state
            setAllowSave(true);
        }
    };

    /**
     * clearOutput: Clears the screen
     * It resets the state variable holding the output, thereby clearing the display.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, []);

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
            {/* Render the installation modal if the command is not available */}
            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description}
                    dependencies={dependencies}
                ></InstallationModal>
            )}

            <form onSubmit={form.onSubmit((values) => onSubmit({ ...values, Tcpdumpswitch: selectedScanOption }))}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <TextInput label={"interface/IP address"} {...form.getInputProps("interface")} />
                    <NativeSelect
                        value={selectedScanOption}
                        onChange={(e) => setSelectedTcpdumpOption(e.target.value)}
                        title={"Scan type"}
                        data={[
                            tcpdumpOptions[0],
                            tcpdumpOptions[1],
                            tcpdumpOptions[2],
                            tcpdumpOptions[3],
                            tcpdumpOptions[4],
                        ]}
                        required
                        description={"Type of scan to perform"}
                    />
                    <Button type={"submit"}>Start Tcpdump</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}

export default Tcpdump;
