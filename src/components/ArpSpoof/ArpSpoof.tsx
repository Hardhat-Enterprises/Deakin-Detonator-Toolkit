import { Button, Stack, TextInput, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useCallback } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import { UserGuide } from "../UserGuide/UserGuide";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";

// Component Constants
const title = "ARPSpoof";

// Contains the description of the component.
const description_userguide =
    "ARP (Address Resolution Protocol) spoofing is a Man-in-the-Middle (MitM) style attack.\n" +
    "This attack involves a malicious actor sending false ARP messages over a local area network.\n" +
    "This will link the attacker's MAC address with the IP address of a legitimate device or the default gateway.\n" +
    "This will cause the traffic meant for the legitimate device to be sent to the attacker instead.\n" +
    "The attacker can then inspect the traffic before forwarding it to the actual default gateway.\n" +
    "The attacker can also modify the traffic before forwarding it. \n" +
    "ARP spoofing can be used to intercept data frames, modify traffic, or stop the traffic altogether.\n\n" +
    "How to use ARPSpoofing:\n\n" +
    "Step 1: Enter the IP address of the 1st target. Eg: 192.168.1.1\n" +
    "Step 2: Enter the IP address of the 2nd target. Eg: 192.168.1.2\n" +
    "Step 3: Click spoof to commence the ARP spoofing operation.\n" +
    "Step 4: View the output block below to view the results.";

/**
 * Represents the form values for the ARPSpoof component.
 */
interface FormValuesType {
    ipGateway: string;
    ipTarget: string;
}

const ARPSpoofing = () => {
    // Component State Variables.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [PidGateway, setPidGateway] = useState(""); // State variable to store the PID of the gateway process.
    const [PidTarget, setPidTarget] = useState(""); // State variable to store the PID of the target process.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    
    // ARPSpoof specific state variables.
    const [isSpoofing, setIsSpoofing] = useState(false);

    // Form Hook to handle form input.
    let form = useForm({
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
            setIsSpoofing(false);

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
     * Clears the output and resets the save state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    const onSubmit = async (values: FormValuesType) => {
        const args_gateway = [`-t`, values.ipGateway, values.ipTarget];
        const args_target = [`-t`, values.ipTarget, values.ipGateway];
        const result_gateway = await CommandHelper.runCommandWithPkexec(
            "arpspoof",
            args_gateway,
            handleProcessData,
            handleProcessTermination
        );
        setPidGateway(result_gateway.pid);
        const result_target = await CommandHelper.runCommandWithPkexec(
            "arpspoof",
            args_target,
            handleProcessData,
            handleProcessTermination
        );
        setPidTarget(result_target.pid);
        setIsSpoofing(true);
    };
    const close = async () => {
        const argsGateway = [`-2`, PidGateway];
        const argsTarget = [`-2`, PidTarget];
        await CommandHelper.runCommandWithPkexec("kill", argsGateway, handleProcessData, handleProcessTermination);
        await CommandHelper.runCommandWithPkexec("kill", argsTarget, handleProcessData, handleProcessTermination);
        setIsSpoofing(false);
    };

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label={"Target one IP address"} required {...form.getInputProps("ip1")} />
                <TextInput label={"Target two IP address"} required {...form.getInputProps("ip2")} />
                {!isSpoofing && <Button type={"submit"}>Spoof</Button>}
                {isSpoofing && (
                    <Alert
                        radius="md"
                        children={
                            "ARP spoofing between " + form.values.ipGateway + " and " + form.values.ipTarget + "..."
                        }
                    ></Alert>
                )}
                {isSpoofing && <Button onClick={close}>Stop</Button>}
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default ARPSpoofing;
