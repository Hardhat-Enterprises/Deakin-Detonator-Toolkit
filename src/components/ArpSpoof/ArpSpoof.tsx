import { Button, Stack, TextInput, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState,useCallback } from "react";
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
    ip1: string;
    ip2: string;
}

const ARPSpoofing = () => {
    const [isSpoofing, setIsSpoofing] = useState(false);
    const [pid, setPid] = useState("");
    const [pid2,setPid2] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            ip1: "",
            ip2: "",
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
            setPid("");
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
        const args = [`-t`, values.ip1, values.ip2];
        const args2 = [`-t`, values.ip2, values.ip1]
        const handle = await CommandHelper.runCommandWithPkexec("arpspoof", args,handleProcessData,handleProcessTermination);
        const handle2 = await CommandHelper.runCommandWithPkexec("arpspoof", args2,handleProcessData,handleProcessTermination);
        setPid(handle.pid.toString());
        setPid2(handle2.pid.toString());
        setIsSpoofing(true);
    };
    const close = async () => {
        const args = [`-2`, pid];
        const args2 = [`-2`,pid2]
        await CommandHelper.runCommand("kill", args);
        await CommandHelper.runCommand("kill",args2)
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
                        children={"ARP spoofing between " + form.values.ip1 + " and " + form.values.ip2 + "..."}
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
