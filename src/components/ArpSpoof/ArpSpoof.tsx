import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useEffect, useCallback } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import { RenderComponent } from "../UserGuide/UserGuide";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the ARPSpoof component.
 */
interface FormValuesType {
    ipGateway: string;
    ipTarget: string;
}

const ARPSpoofing = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate if the process is loading.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pidGateway, setPidGateway] = useState(""); // State variable to store the PID of the gateway process.
    const [pidTarget, setPidTarget] = useState(""); // State variable to store the PID of the target process.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.

    // Component Constants
    const title = "ARPSpoof"; // Contains the description of the component.

    // Contains the description of the component.
    const description_userguide =
        "ARP (Address Resolution Protocol) spoofing is a Man-in-the-Middle (MitM) style attack.\n" +
        "This attack involves a malicious actor sending false ARP messages over a local area network.\n" +
        "This will link the attacker's MAC address with the IP address of a legitimate device or the default gateway.\n" +
        "This will cause the traffic meant for the legitimate device to be sent to the attacker instead.\n" +
        "The attacker can then inspect the traffic before forwarding it to the actual default gateway.\n" +
        "The attacker can also modify the traffic before forwarding it. \n" +
        "ARP spoofing can be used to intercept data frames, modify traffic, or stop the traffic altogether.\n";
    // Contains the steps of the componant.
    const steps =
        "How to use ARPSpoofing:\n" +
        "Step 1: Enter the IP address of the 1st target. Eg: 192.168.1.1\n" +
        "Step 2: Enter the IP address of the 2nd target. Eg: 192.168.1.2\n" +
        "Step 3: Click spoof to commence the ARP spoofing operation.\n" +
        "Step 4: View the output block below to view the results.";

    // Component Constants.
    const dependencies = ["arpspoof"]; // Contains the dependencies required for the component.
    const sourceLink = "https://github.com/tecknicaltom/dsniff/blob/master/arpspoof.c"; // contains link to the source code (arpspoof)
    const tutorial = "";

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

    // Form Hook to handle form input.
    const form = useForm({
        initialValues: {
            ipGateway: "",
            ipTarget: "",
        },
    });

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data received to the existing output.
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Append new data to the previous output.
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
            // If the process was terminated successfully, display a success message.
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
                // If the process was terminated due to a signal, display the signal code.
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
                // If the process was terminated with an error, display the exit code and signal code.
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }

            // Clear the child process pid reference. There is no longer a valid process running.
            // We complete this process for both gateway and target processes.
            setPidGateway("");
            setPidTarget("");

            // Cancel the Loading Overlay
            setLoading(false);

            // Now that loading has completed, allow the user to save the output to a file.
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    // Actions taken after saving the output
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * clearOutput: Callback function to clear the console output.
     * It resets the state variable holding the output, thereby clearing the display.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    const onSubmit = async (values: FormValuesType) => {
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Construct arguments for the ARPSpoof command based on form input
        const argsGateway = [`-t`, values.ipGateway, values.ipTarget];
        const argsTarget = [`-t`, values.ipTarget, values.ipGateway];

        // Execute arpspoof command for the gateway
        const result_gateway = await CommandHelper.runCommandWithPkexec(
            "arpspoof",
            argsGateway,
            handleProcessData,
            handleProcessTermination
        );
        setPidGateway(result_gateway.pid);

        // Execute arpspoof command for the target
        const result_target = await CommandHelper.runCommandWithPkexec(
            "arpspoof",
            argsTarget,
            handleProcessData,
            handleProcessTermination
        );
        setPidTarget(result_target.pid);

        setLoading(false);
    };

    return (
        <RenderComponent
            title={title}
            description={description_userguide}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
            <>
                {!loadingModal && (
                    <InstallationModal
                        isOpen={opened}
                        setOpened={setOpened}
                        feature_description={description_userguide}
                        dependencies={dependencies}
                    ></InstallationModal>
                )}
                <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                    <TextInput label={"Target one IP address"} required {...form.getInputProps("ipGateway")} />
                    <TextInput label={"Target two IP address"} required {...form.getInputProps("ipTarget")} />
                    <Button type={"submit"}>Start Spoof</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </form>
            </>
        </RenderComponent>
    );
};

export default ARPSpoofing;
