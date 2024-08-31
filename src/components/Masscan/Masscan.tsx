import { useState, useEffect, useCallback } from "react";
import { Button, Stack, TextInput, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";

/**
 * Represents the form values for the Masscan component.
 */
interface FormValuesType {
    targetIP: string;
    targetPort: string;
    waitTime: string;
    packetRate: string;
    excludedIP: string;
    topPorts: string;
    interface: string;
}

/**
 * The Masscan component.
 * @returns The Masscan component.
 */
const Masscan = () => {
    // Component state variables
    const [loading, setLoading] = useState(false); // State variable to indicate loading state
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving of output
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if output has been saved
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [verboseMode, setVerboseMode] = useState(false); // State variable for verbose mode
    const [checkedTopPorts, setCheckedTopPorts] = useState(false); //State variable for scanning common ports.
    const [checkedBannerGrabbing, setCheckedBannerGrabbing] = useState(false); //State variable for banner grabbing.

    // Component Constants
    const title = "Masscan";
    const description =
        "Masscan is a network reconnaissance tool designed to scan large IP ranges for open ports and services faster than traditional scanners.";
    const steps =
        "=== Required ===\n" +
        "Step 1: Input a single IP address or an IP address range/subnet to scan.\n" +
        "Step 2: Input a port or range of ports to scan. Alternatively check the common ports box and input n number of common ports to scan.\n" +
        " \n" +
        "=== Optional ===\n" +
        "Step 3: Input a wait time to allow Masscan to wait after the last packet is sent to receive any delayed responses.\n" +
        "Step 4: Input a packet rate to deterine how many packets are sent per second (Slower rates can help avoid detection).\n" +
        "Step 5: Input a single IP address or an IP address range to exclude from the scan.\n" +
        "Step 6: Input a network interface to send and receive packets from during the scan.\n" +
        "Step 7: Check the banner grabbing checkbox to attempt to identify services running on scanned ports.\n" +
        "Step 8: Check the verbose checkbox to run the command in verbose mode.\n";
    const sourceLink = ""; // Link to the source code
    const tutorial = ""; // Link to the official documentation/tutorial
    const dependencies = ["masscan"]; // Contains the dependencies required by the component.

    // Form hook to handle form input
    let form = useForm({
        initialValues: {
            targetIP: "",
            targetPort: "",
            waitTime: "",
            packetRate: "",
            excludedIP: "",
            topPorts: "",
            interface: "",
        },
    });

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

            // Cancel the loading overlay. The process has completed.
            setLoading(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    /**
     * Handles form submission for the Masscan component.
     * @param {FormValuesType} values - The form values containing the target domain.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Construct arguments for the Masscan command based on form input
        let args = [];
        args = [values.targetIP, "-p", values.targetPort];

        // Check if waitTime has a value and push it to args
        if (values.waitTime) {
            args.push("--wait", values.waitTime);
        }

        // Check if packetRate has a value and push it to args
        if (values.packetRate) {
            args.push("--rate", values.packetRate);
        }

        // Check if excludedIP has a value and push it to args
        if (values.excludedIP) {
            args.push("--exclude", values.excludedIP);
        }

        // Check if topPorts has a value and push it to args
        if (values.topPorts) {
            args.push("--top-ports", values.topPorts);
        }

        // Check if interface has a value and push it to args
        if (values.topPorts) {
            args.push("--interface", values.interface);
        }

        if (checkedBannerGrabbing) {
            args.push("--banner"); // Add banner grabbing if option is enabled
        }

        if (verboseMode) {
            args.push("-v"); // Add verbose mode option if enabled
        }

        // Execute the Masscan command via helper method and handle its output or potential errors
        CommandHelper.runCommandWithPkexec("masscan", args, handleProcessData, handleProcessTermination)
            .then(() => {
                // Deactivate loading state
                setLoading(false);
            })
            .catch((error) => {
                // Display any errors encountered during command execution
                setOutput(`Error: ${error.message}`);
                // Deactivate loading state
                setLoading(false);
            });
        setAllowSave(true);
    };

    /**
     * Handles the completion of output saving by updating state variables.
     */
    const handleSaveComplete = () => {
        setHasSaved(true); // Set hasSaved state to true
        setAllowSave(false); // Disallow further output saving
    };

    /**
     * Clears the command output and resets state variables related to output saving.
     */
    const clearOutput = () => {
        setOutput(""); // Clear the command output
        setHasSaved(false); // Reset hasSaved state
        setAllowSave(false); // Disallow further output saving
    };

    // Render component
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
                />
            )}
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <TextInput
                        label="IP Address/Range/Subnet"
                        required
                        {...form.getInputProps("targetIP")}
                        placeholder="e.g. 192.168.1.0"
                    />
                    <Checkbox
                        label={"Scan Common Ports Mode"}
                        checked={checkedTopPorts}
                        onChange={(e) => setCheckedTopPorts(e.currentTarget.checked)}
                    />
                    {checkedTopPorts ? (
                        <TextInput
                            label="Number of Common Ports"
                            required
                            {...form.getInputProps("topPorts")}
                            placeholder="e.g. 100"
                        />
                    ) : (
                        <TextInput
                            label="Port/Port Range"
                            required
                            {...form.getInputProps("targetPort")}
                            placeholder="e.g. 80 or 80-100"
                        />
                    )}
                    <TextInput label="Response Wait Timer" {...form.getInputProps("waitTime")} placeholder="e.g. 5" />
                    <TextInput label="Packet Send Rate" {...form.getInputProps("packetRate")} placeholder="e.g. 1000" />
                    <TextInput
                        label="Exclude IP(s)"
                        {...form.getInputProps("excludedIP")}
                        placeholder="e.g. 192.168.1.4"
                    />
                    <TextInput
                        label="Select Network Interface"
                        {...form.getInputProps("interface")}
                        placeholder="e.g. eth0"
                    />
                    <Checkbox
                        label="Banner Grabbing"
                        checked={checkedBannerGrabbing}
                        onChange={(event) => setCheckedBannerGrabbing(event.currentTarget.checked)}
                    />
                    <Checkbox
                        label="Verbose Mode"
                        checked={verboseMode}
                        onChange={(event) => setVerboseMode(event.currentTarget.checked)}
                    />
                    <Button type={"submit"}>Start {title}</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Masscan;
