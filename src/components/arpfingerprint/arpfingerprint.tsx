import { Button, Stack, TextInput, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
import InstallationModal from "../InstallationModal/InstallationModal";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";

/**
 * The ARPFingerprinting component.
 * @returns The ARPFingerprinting component.
 */
const ARPFingerprinting = () => {
    // Constants and Interfaces
    const title = "ARP Fingerprint Tool";
    const description =
        "ARP Fingerprinting is a network reconnaissance technique used to detect the operating systems and devices in a network.";
    const steps =
        "Step 1: Enter the IP address of the target device.\n" +
        "Step 2: Click Scan to start ARP fingerprinting.\n" +
        "Step 3: View the Output block below to see the fingerprinting results.";
    const sourceLink = "https://www.kali.org/tools/arp-scan/";
    const tutorial = "";
    const dependencies = ["arp-scan"];

    interface FormValues {
        targetIP: string;
    }

    // State Hooks
    const [isScanning, setIsScanning] = useState(false);
    const [pidScan, setPidScan] = useState("");
    const [allowSave, setAllowSave] = useState(true);
    const [hasSaved, setHasSaved] = useState(false);
    const [output, setOutput] = useState("");

    // Form Handling
    const form = useForm({
        initialValues: {
            targetIP: "",
        },
    });

    // useEffect to check if the command is available
    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                // Set the command availability state
                if (!isAvailable) {
                    setAllowSave(false); // Disable saving option
                }
            })
            .catch((error) => {
                console.error("An error occurred while checking command availability:", error);
            });
    }, []);

    // Callback Functions
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    const handleProcessTermination = useCallback(({ code, signal }: { code: number; signal: number }) => {
        // Handle process termination
        setPidScan("");
        setIsScanning(false);
    }, []);

    // Form Submission
    const onSubmit = async (values: FormValues) => {
        setIsScanning(true); // Start scanning
        const args = [values.targetIP]; // Command arguments

        try {
            const result = await CommandHelper.runCommandWithPkexec(
                "arp-fingerprint",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setOutput(result.output);
            setPidScan(result.pid);
        } catch (error) {
            console.error("Error occurred during ARP fingerprinting:", error);
            setIsScanning(false);
        }
    };

    return (
        <RenderComponent
            title={title}
            description={description}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
            <InstallationModal
                isOpen={!allowSave}
                setOpened={setAllowSave}
                feature_description={description}
                dependencies={dependencies}
            />
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    <TextInput label="Target IP Address" required {...form.getInputProps("targetIP")} />
                    {SaveOutputToTextFile(output)}
                    <Button type="submit" disabled={isScanning}>
                        {isScanning ? "Scanning..." : "Scan"}
                    </Button>
                    <ConsoleWrapper output={output} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default ARPFingerprinting;
