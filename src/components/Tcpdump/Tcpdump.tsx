import { useState, useCallback, useEffect } from "react";
import { Button,NativeSelect, Stack, TextInput, Alert } from "@mantine/core";
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
 * @field hostname: The IP address to be used
 * @field Optionswitch: Allows the user to select the different options for scanning.
 */
interface FormValuesType {
    hostname: string;
    Tcpdumpswitch: string;
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
    const title = "Tcpdump Tool"; // Title of the component.
    const description =
        "Tcp dump is a packet analysis tool that allows a user to view packets being transmitted over the local" +
        "network. It is often used to troubleshoot network issues. It includes the ability to filter traffic" +
        "by features such as network protocol, IP address or interface. "; // Description of the component.
    const steps =
        "Step 1: Click on the 'Start' button to start the Tcpdump.\n" +
        "Step 2: View the Output block below to see the results of the scan.\n";
    const sourceLink = "https://www.tcpdump.org/"; // Link to the source code or Kali Tools page.
    const tutorial = "https://www.tcpdump.org/manpages/"; // Link to the official documentation/tutorial.
    const dependencies = ["libpcap"]; // Dependencies required for the ARPScan tool.

    // Form hook to handle form input.
    const form = useForm<FormValuesType>({
        initialValues: {
            hostname: "",
            Tcpdumpswitch: ""
        },
    });

    const Tcpdumpswitch = [
        "First 5 packets",
        "TCP packets only"
    ]


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
     * @param {FormValuesType} values - The form values, containing the network interface.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Set the loading state to true to indicate that the process is starting.
        setLoading(true);
        let args = [""];
        
        //Switch for different options
        switch (values.Tcpdumpswitch) {
            case "First 5 packets":
                args = [`/usr/share/ddt/Bash-Scripts/Tcpdump.sh`];
                args.push('-c 5 -i'); //Can put other options first, then hostname, tested
                args.push(`${values.hostname}`);
                CommandHelper.runCommandGetPidAndOutput("bash", args, handleProcessData, handleProcessTermination)
                    .then(({ pid, output }) => {
                        setPid(pid);
                        setOutput(output);
                        setAllowSave(true);
                    })
                    .catch((error: any) => {
                        setLoading(false);
                        setOutput(`Error: ${error.message}`);
                    });
            break;

            case "TCP packets only":
                args = [`/usr/share/ddt/Bash-Scripts/Tcpdump.sh`];
                args.push('-c 20 tcp port 80 -i');
                args.push(`${values.hostname}`)
                CommandHelper.runCommandGetPidAndOutput("bash", args, handleProcessData, handleProcessTermination)
                    .then(({ pid, output }) => {
                        setPid(pid);
                        setOutput(output);
                        setAllowSave(true);
                    })
                    .catch((error: any) => {
                        setLoading(false);
                        setOutput(`Error: ${error.message}`);
                    });
            break;

        }

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
                            <TextInput label={"Hostname/IP address"} {...form.getInputProps("hostname")} />
                            <TextInput label={"Traceroute custom (optional)"} {...form.getInputProps("tracerouteOptions")} />
                            <NativeSelect
                                value={selectedScanOption}
                                onChange={(e) => setSelectedTcpdumpOption(e.target.value)}
                                title={"Traceroute option"}
                                data={Tcpdumpswitch}
                                required
                                description={"Type of scan to perform"}
                            />
                            <Button type={"submit"}>start traceroute</Button>
                            {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                            <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                        </Stack>
                    </form>
                </RenderComponent>
            );
        }    
    }   

export default Tcpdump;
