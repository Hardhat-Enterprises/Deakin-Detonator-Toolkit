import { Button, Stack, TextInput, Alert, Loader, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { IconAlertCircle } from "@tabler/icons";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import InstallationModal from "../InstallationModal/InstallationModal";

const title = "SMB-Ghost Scanner"; // Title of the component.

const description =
    "SMB-Ghost Scanner is a tool used to scan a target for vulnerability to the CVE2020-0796 attack vector."; // Description of the component.

const steps =
    "Step 1: Enter a Target IP address.\n" +
    "Step 2: Click scan to commence SMB-Ghost Scanners operation.\n" +
    "Step 3: View the Output block below to view the results of the tools execution."; // Steps for viewing the component

const sourceLink = "https://github.com/w1ld3r/SMBGhost_Scanner?tab=readme-ov-file"; // Link to the source code or documentation.

const tutorial = "https://docs.google.com/document/d/1bVNVFUnwX9VMTaSd-OMneKfs5b61swiFLx0d7haFHcA/edit?usp=sharing"; // Link to the official documentation/tutorial.

const dependencies = ["python3"]; // Contains the dependencies required by the component.

/**
 * Interface representing the form values used in the SMBGhostScanner component.
 */
interface FormValuesType {
    ip: string;
}

/**
 * The SMBGhostScanner component.
 * @returns The SMBGhostScanner component.
 */
const SMBGhostScanner = () => {
    // Component State Variables
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [ipError, setIpError] = useState(""); // State variable to store IP validation error message.

    // Tracks the user-facing execution state of the vulnerability scan.
    const [executionStatus, setExecutionStatus] = useState<
        "idle" | "running" | "success" | "failed" | "no-vulnerability" | "cancelled"
    >("idle");

    // Form hook to handle form input.
    const form = useForm({
        initialValues: {
            ip: "",
        },
    });

    /**
     * Checks whether the required commands are available.
     */
    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable);
                setOpened(!isAvailable);
                setLoadingModal(false);
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false);
            });
    }, []);

    /**
     * Callback to handle and append new data from the child process to the output.
     * It also maps the raw SMB-Ghost Scanner result to a user-facing execution state.
     *
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);

        if (data.includes("Vulnerable!!")) {
            setExecutionStatus("success");
        } else if (data.includes("Not vulnerable.")) {
            setExecutionStatus("no-vulnerability");
        } else if (data.includes("connection failed.")) {
            setExecutionStatus("failed");
        }
    }, []);

    /**
     * Callback to handle termination of the child process.
     * Manual termination is treated as cancelled, while a non-zero exit code
     * is treated as a failed execution.
     * A normal exit does not overwrite the semantic result already detected
     * from the scanner output.
     *
     * @param {object} param - Information about the terminated process.
     * @param {number} param.code - Exit code of the terminated process.
     * @param {number} param.signal - Signal used to terminate the process.
     */
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
                setExecutionStatus("cancelled");
            } else if (code !== 0) {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
                setExecutionStatus("failed");
            }

            setPid("");
            setLoading(false);
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
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * Validates the IP address format.
     *
     * @param {string} ip - The IP address to validate.
     * @returns {boolean} - Returns true if the IP address is valid, otherwise false.
     */
    const validateIpAddress = (ip: string): boolean => {
        const ipv4Pattern =
            /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

        const ipv6Pattern =
            /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]|[1-9]?)?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]|[1-9]?)?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]|[1-9]?)?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]|[1-9]?)?[0-9]))$/;

        return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
    };

    /**
     * Asynchronous handler for the form submission event.
     * It validates the target address, starts the scanner and updates
     * the user-facing execution status.
     *
     * @param {FormValuesType} values - Form values containing the target IP address.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Validate IP address.
        if (!validateIpAddress(values.ip)) {
            setIpError("Invalid IP address format. Please enter a valid IPv4 or IPv6 address.");
            return;
        }

        // Clear previous IP error.
        setIpError("");

        // Clear previous execution output.
        setOutput("");

        // Disallow saving until execution is complete.
        setAllowSave(false);

        // Start loading state.
        setLoading(true);

        // Display running status.
        setExecutionStatus("running");

        const args = ["/usr/share/ddt/SMBGhostScanner.py", values.ip];

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
            setExecutionStatus("failed");
            setLoading(false);
            setAllowSave(true);
        }
    };

    /**
     * Clears the output and execution-status states.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setExecutionStatus("idle");

        // Reset save state variables to defaults.
        setHasSaved(false);
        setAllowSave(false);
    }, []);

    return (
        <RenderComponent
            title={title}
            description={description}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description}
                    dependencies={dependencies}
                ></InstallationModal>
            )}

            <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid)}

                    {executionStatus !== "idle" && (
                        <Alert
                            color={
                                executionStatus === "running"
                                    ? "blue"
                                    : executionStatus === "success"
                                    ? "green"
                                    : executionStatus === "no-vulnerability"
                                    ? "yellow"
                                    : executionStatus === "cancelled"
                                    ? "gray"
                                    : "red"
                            }
                            radius="md"
                        >
                            {executionStatus === "running" && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                    }}
                                >
                                    <Loader size="sm" />
                                    <Text>Running...</Text>
                                </div>
                            )}

                            {executionStatus === "success" && (
                                <Text>Scan completed successfully - vulnerability found.</Text>
                            )}

                            {executionStatus === "no-vulnerability" && <Text>No vulnerability found.</Text>}

                            {executionStatus === "failed" && <Text>Scan failed.</Text>}

                            {executionStatus === "cancelled" && <Text>Scan cancelled.</Text>}
                        </Alert>
                    )}

                    <Alert icon={<IconAlertCircle size={16} />} radius="md">
                        Please turn off the firewall on target system, otherwise the detect packet might be dropped.
                    </Alert>

                    <TextInput label="Target IP address" required {...form.getInputProps("ip")} error={ipError} />

                    <Button type="submit">Scan</Button>

                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}

                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default SMBGhostScanner;
