import { Button, Stack, TextInput, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useCallback } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import { UserGuide } from "../UserGuide/UserGuide";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

const title = "ARP Fingerprint Tool";
const description_userguide =
    "ARP Fingerprinting is a network reconnaissance technique used to detect the operating systems and devices " +
    "in a network. The tool will send ARP requests and analyze responses to identify unique patterns or signatures " +
    "associated with specific devices or operating systems. This information can be valuable for network mapping " +
    "and vulnerability assessment.\n\n" +
    "Using ARP Fingerprint Tool:\n" +
    "Step 1: Enter the IP address of the target device.\n" +
    "       Eg: 192.168.1.1\n\n" +
    "Step 2: Click Scan to start ARP fingerprinting.\n\n" +
    "Step 3: View the Output block below to see the fingerprinting results.";

interface FormValues {
    target_ip: string;
}

const ARPFingerprinting = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [pidScan, setPidScan] = useState("");
    const [allowSave, setAllowSave] = useState(true);
    const [hasSaved, setHasSaved] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            target_ip: "",
        },
    });

    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output
    }, []);

    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("\nScan completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nScan was manually terminated.");
            } else {
                handleProcessData(`\nScan terminated with exit code: ${code} and signal code: ${signal}`);
            }
            setPidScan(""); // Clear the process id reference
            setIsScanning(false); // Disable scanning state
            setAllowSave(true); // Allow saving output
            setHasSaved(false); // Reset save status
        },
        [handleProcessData]
    );

    const handleSaveComplete = () => {
        setHasSaved(true); // Set save status to true after saving
        setAllowSave(true); // Disable saving option
    };

    const clearOutput = useCallback(() => {
        setOutput(""); // Clear output
        setHasSaved(false); // Reset save status
        setAllowSave(false); // Disable saving option
    }, [setOutput]);

    const onSubmit = async (values: FormValues) => {
        const args = [values.target_ip]; // Command arguments
    
        try {
            // Execute the command with elevated privileges using CommandHelper
            const result = await CommandHelper.runCommandWithPkexec(
                "arp-scan", 
                args,
                handleProcessData,
                handleProcessTermination
            );
    
            // Set the process ID obtained from the command result
            setPidScan(result.pid);
    
            // Set scanning state to true
            setIsScanning(true);
        } catch (error) {
            // Handle any errors that might occur during command execution
            console.error("Error executing command:", error);
        }
    };
    

    const stopScan = async () => {
        const args = ["-2", pidScan]; // Command arguments for killing process
        await CommandHelper.runCommandWithPkexec("kill", args, handleProcessData, handleProcessTermination);
        setIsScanning(false); // Disable scanning state
    };

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label={"Target IP address"} required {...form.getInputProps("target_ip")} />
                {!isScanning && <Button type={"submit"}>Scan</Button>}
                {isScanning && (
                    <Alert
                        radius="md"
                        children={"Scanning device at " + form.values.target_ip + "..."}
                    ></Alert>
                )}
                {isScanning && <Button onClick={stopScan}>Stop</Button>}
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default ARPFingerprinting;
