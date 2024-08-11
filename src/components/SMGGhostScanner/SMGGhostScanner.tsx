import { Button, Stack, TextInput, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { IconAlertCircle } from "@tabler/icons";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

const title = "SMG-Ghost Scanner";
const description_userguide =
    "SMG-Ghost Scanner is a tool used to scan a target to see if they are vulnerable to the attack vector " +
    "CVE2020-0796. This vulnerability fell within Microsoft's SMB 3.1.1 protocol stack implementation where " +
    "due to the failure of handling particular requests and response messages, an attacker could perform " +
    "remote code execution to act as the systems user.\n\n" +
    "Using SMG-Ghost Scanner:\n" +
    "Step 1: Enter a Target IP address.\n" +
    "       Eg: 192.168.1.1 \n\n" +
    "Step 2: Click scan to commence SMG-Ghost Scanners operation.\n\n" +
    "Step 3: View the Output block below to view the results of the tools execution.";
/**
 * Interface representing the form values used in the SMGGhostScanner component.
 */
interface FormValuesType {
    ip: string;
}
/**
 * The SMGGhostScanner component.
 * @returns The SMGGhostScanner component.
 */
const SMGGhostScanner = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [pid, setPid] = useState("");

    let form = useForm({
        initialValues: {
            ip: "",
        },
    });

    /**
     * Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data received to the existing output.
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output
    }, []);

    /**
     * Callback to handle the termination of the child process.
     * Once the process termination is handled, it clears the process PID reference and
     * deactivates the loading overlay.
     * @param {object} param - An object containing information about the process termination.
     * @param {number} param.code - The exit code of the terminated process.
     * @param {number} param.signal - The signal code indicating how the process was terminated.
     */
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
            setLoading(false);
            // Allow Saving as the output is finalised
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    /**
     * Actions taken after saving the output.
     * It updates the state to reflect that the output has been saved.
     */
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * Asynchronous handler for the form submission event.
     * It sets up and triggers the SMG-Ghost Scanner tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     * @param {FormValuesType} values - The form values, containing the target IP address.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);
        // Start the Loading Overlay
        setLoading(true);

        const args = [`/usr/share/ddt/SMGGhostScanner.py`, values.ip];

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "python3",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any) {
            setOutput(e.message);
        }
    };

    /**
     * Clears the output state and resets save state variables to defaults.
     */
    const clearOutput = useCallback(() => {
        setOutput("");

        // reset save state variables to defaults
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack>
                {UserGuide(title, description_userguide)}
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    radius="md"
                    children={
                        "Please turn off the firewall on target system, otherwise the detect packet might be dropped. "
                    }
                ></Alert>
                <TextInput label={"Target IP address"} required {...form.getInputProps("ip")} />
                <Button type={"submit"}>Scan</Button>
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default SMGGhostScanner;
