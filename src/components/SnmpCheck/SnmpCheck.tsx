import { Button, LoadingOverlay, NumberInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useEffect, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * FormValues defines the structure of the object used to hold form state in the SNMP check component.
 * @field ip: The ip address or hostname
 * @field port: The SNMP port, defaults to 161 if not specified.
 */
interface FormValuesType {
    ip: string;
    port: number;
}
// Component Constants.
const title = "SnmpCheck"; // Title of the tool.
const description_userguide = // Description of the tool.
    "The SNMP Check tool enables you to perform SNMP (Simple Network Management Protocol) checks on a specific IP " +
    "address or hostname and port.";
const steps =
    "Step 1: Enter the IP address or hostname of the target device\n" +
    "Step 2: (Optional) Specify a target port number (default port: 161).\n" +
    "Step 3: Click the 'Scan' button to initiate the SNMP check.\n";
const sourceLink = "https://www.kali.org/tools/snmpcheck/"; // Link to the source code.
const tutorial = ""; // Link to the official documentation/tutorial.
const dependencies = ["snmpcheck"]; // Contains the dependencies required by the component.

/**
 * The SnmpCheck component.
 * @returns The SnmpCheck component.
 */
const SnmpCheck = () => {
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); //State to store the output from the snmpCheck command
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.

    // Form hook to handle form input.
    let form = useForm({
        initialValues: {
            ip: "",
            port: 161,
        },
    });

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

    /**
     * Handles incoming data from a child process and appends it to the current output state.
     * @param {string} data - The string data recieved from the child process.
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
            // If the process was successful, display a success message.
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
                // If the process was terminated manually, display a termination message.
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
                // If the process was terminated with an error, display the exit and signal codes.
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }
            // Clear the child process pid reference. There is no longer a valid process running.
            setPid("");
            // Cancel the Loading Overlay. The process has completed.
            setLoading(false);
        },
        [handleProcessData]
    );

    /**
     * Sends a SIGTERM signal to the child process to request a graceful termination.
     */
    const handleCancel = () => {
        if (pid !== null) {
            const args = [`-15`, pid];
            CommandHelper.runCommand("kill", args);
        }
    };
    /**
     * Submits the form data to initiate the SNMP check command.
     * @param {FormValuesType} values - The form values containing the IP address and port number.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);

        const args = [values.ip, "-p", `${values.port}`];

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "snmp-check",
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
     * Clears the output state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <LoadingOverlay visible={loading} />
            {loading && (
                <div>
                    <Button variant="outline" color="red" style={{ zIndex: 1001 }} onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            )}
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label={"IP or Hostname"} required {...form.getInputProps("ip")} />
                <NumberInput label={"Port"} {...form.getInputProps("port")} />
                <Button type={"submit"}>Scan</Button>
                {SaveOutputToTextFile(output)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default SnmpCheck;
