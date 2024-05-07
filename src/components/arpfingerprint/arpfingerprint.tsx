import { Button, Stack, TextInput, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
import InstallationModal from "../InstallationModal/InstallationModal";

// Section: Constants and Interfaces
const title = "ARP Fingerprint Tool";
const description =
    "ARP Fingerprinting is a network reconnaissance technique used to detect the operating systems and devices in a network.";
const steps =
    "Step 1: Enter the IP address of the target device.\n" +
    "Step 2: Click Scan to start ARP fingerprinting.\n" +
    "Step 3: View the Output block below to see the fingerprinting results.";
const sourceLink = "https://www.kali.org/tools/arp-scan/";
const tutorial = "";
const dependencies = ["arp-fingerprint"];

interface FormValues {
    targetIP: string;
}

// Section: Component Definition
const ARPFingerprinting = () => {
    // Section: State Hooks
    const [isScanning, setIsScanning] = useState(false); // State hook for scanning status
    const [pidScan, setPidScan] = useState(""); // State hook for process ID of the scanning process
    const [allowSave, setAllowSave] = useState(true); // State hook for allowing output saving
    const [hasSaved, setHasSaved] = useState(false); // State hook for tracking if output has been saved
    const [output, setOutput] = useState(""); // State hook for storing the output of the scanning process

    // Section: Form Handling
    let form = useForm({
        initialValues: {
            targetIP: "",
        },
    });

    // Section: Callback Functions

    /**
     * Callback function to handle process data received during scanning
     * @param {string} data - Data received from the scanning process
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output
    }, []);

    /**
     * Callback function to handle process termination
     * @param {Object} - Object containing exit code and signal code
     */
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

    /**
     * Callback function to handle completion of output saving
     */
    const handleSaveComplete = () => {
        setHasSaved(true); // Set save status to true after saving
        setAllowSave(true); // Disable saving option
    };

    /**
     * Callback function to clear output
     */
    const clearOutput = useCallback(() => {
        setOutput(""); // Clear output
        setHasSaved(false); // Reset save status
        setAllowSave(false); // Disable saving option
    }, [setOutput]);

    // Section: Form Submission

    /**
     * Function to handle form submission
     * Initiates the ARP fingerprinting process based on the provided IP address
     * @param {FormValues} values - Form input values containing the target IP address
     */
    const onSubmit = async (values: FormValues) => {
        const args = [values.targetIP]; // Command arguments

        try {
            // Execute the command with elevated privileges using CommandHelper
            const result = await CommandHelper.runCommandWithPkexec(
                "arp-fingerprint",
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

    // Function to stop the scanning process
    const stopScan = async () => {
        const args = ["-2", pidScan]; // Command arguments for killing process
        await CommandHelper.runCommandWithPkexec("kill", args, handleProcessData, handleProcessTermination);
        setIsScanning(false); // Disable scanning state
    };

    // Section: JSX
    return (
        <RenderComponent
            title={title}
            description={description}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
            <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                <Stack>
                    <TextInput label={"Target IP address"} required {...form.getInputProps("targetIP")} />
                    {!isScanning && <Button type={"submit"}>Scan</Button>}

                    {isScanning && <Button onClick={stopScan}>Stop</Button>}
                    {SaveOutputToTextFile(output)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
            <InstallationModal
                isOpen={!allowSave}
                setOpened={() => setAllowSave(true)}
                feature_description={description}
                dependencies={dependencies}
            />
        </RenderComponent>
    );
};

export default ARPFingerprinting;
