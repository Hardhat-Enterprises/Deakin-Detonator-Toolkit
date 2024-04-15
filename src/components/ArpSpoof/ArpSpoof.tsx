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

interface FormValuesType {
    ip_gateway: string;
    ip_target: string;
}

const ARPSpoofing = () => {
    const [isSpoofing, setIsSpoofing] = useState(false);
    const [PidGateway, setPidGateway] = useState("");
    const [PidTarget, setPidTarget] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            ip_gateway: "",
            ip_target: "",
        },
    });

    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output
    }, []);

    // Uses the onTermination callback function of runCommandGetPidAndOutput to handle
    // the termination of that process, resetting state variables, handling the output data,
    // and informing the user.
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
            setPidGateway("");
            setPidTarget("");
            // Cancel the Loading Overlay
            setIsSpoofing(false);

            // Allow Saving as the output is finalised
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    // Actions taken after saving the output
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    const onSubmit = async (values: FormValues) => {
        const args_gateway = [`-t`, values.ip_gateway, values.ip_target];
        const args_target = [`-t`, values.ip_target, values.ip_gateway];
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
                            "ARP spoofing between " + form.values.ip_gateway + " and " + form.values.ip_target + "..."
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
