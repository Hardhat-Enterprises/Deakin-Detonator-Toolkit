import { Button, Stack, TextInput, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useCallback } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import { UserGuide } from "../UserGuide/UserGuide";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

const title = "ARP Spoofing Tool";
const description_userguide =
    "ARP Spoofing is a Man in the Middle attack where an interception can be made on the communication between " +
    "devices on a network. The tool will send out forged ARP responses to the IP addresses of at least two devices, " +
    "where the devices will connect to the attackers MAC address due to confusion on the router and workstation. " +
    "These devices will further communicate with the attacker whilst being unknowing that an attack has even taken " +
    "place. \n\nFurther information can be found at: https://www.kali.org/tools/dsniff/#arpspoof\n\n" +
    "Using ARP Spoofing Tool:\n" +
    "Step 1: Enter the IP address of the 1st target.\n" +
    "       Eg: 192.168.1.1\n\n" +
    "Step 2: Enter the IP address of the 2nd target.\n" +
    "       Eg: 127.0.0.1\n\n" +
    "Step 3: Click Spoof to commence ARP Spoofing's operation.\n\n" +
    "Step 4: View the Output block below to view the results of the tools execution.";

interface FormValues {
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
