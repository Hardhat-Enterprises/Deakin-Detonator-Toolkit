import { Button, Stack, TextInput, Switch, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the NbtscanTool component.
 */
interface FormValuesType {
    subnet: string;
    scanRange: string;
    timeout: number;
    bandwidth: string;
    retransmits: number;
}

/**
 * The NbtscanTool component.
 * @returns The NbtscanTool component.
 */
const NbtscanTool = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to control the loading overlay
    const [output, setOutput] = useState(""); // State variable to store the output from the nbtscan command
    const [checkedAdvanced, setCheckedAdvanced] = useState(false); // State variable to track if the advanced mode is enabled
    const [pid, setPid] = useState(""); // State variable to store the process ID (PID) of the running command
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [allowSave, setAllowSave] = useState(false); // State variable to control whether the output can be saved
    const [hasSaved, setHasSaved] = useState(false); // State variable to track if the output has already been saved
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [subnet, setSubnet] = useState(""); // State variable to store the entered subnet value
    const [checkedPacketDump, setCheckedPacketDump] = useState(false); // State variable to track whether the "Dump Packets Mode" is enabled or disabled

    // Component Constants
    const title = "Nbtscan"; // Title of the component.
    const description = "NBTscan is a program for scanning IP networks for NetBIOS name information."; // Description of the component.
    const steps = // Instructions on how to use NBTScan Tool
        "Using Nbtscan:\n" +
        "Step 1: Enter a Target Subnet to scan.\n" +
        "       Eg: 192.168.1.0/24\n\n" +
        "Step 2: Click Start Nbtscan to commence the Nbtscan tool's operation.\n\n" +
        "Step 3: View the output block to see the results.\n\n" +
        "Switch to Advanced Mode for further options.";
    const sourceLink = "https://www.kali.org/tools/nbtscan/"; // Link to the source code (or Kali Tools).
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["Nbtscan"]; // Contains the dependencies required by the component.

    // Form hook to handle form input.
    let form = useForm({
        initialValues: {
            subnet: "",
            scanRange: "",
            timeout: 1000,
            bandwidth: "",
            retransmits: 0,
        },
    });

    /**
     * Checks if the nbtscan command is available and sets the modal state accordingly.
     */
    useEffect(() => {
        // Check if the command is available and set the state variables accordingly.
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
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output
    }, []);

    /**
     * handleProcessTermination: Callback to handle the termination of the child process.
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
     * onSubmit: Asynchronous handler for the form submission event.
     * @param {FormValuesType} values - The form values.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        // Start the Loading Overlay
        setLoading(true);
        const args = [];

        if (values.subnet) {
            args.push(`${values.subnet}`);
        }
        //Push -d parameter based on the flag
        if (checkedPacketDump) {
            args.push(`-d`);
        }

        if (values.scanRange) {
            args.push(values.scanRange);
        }

        if (values.timeout) {
            args.push(`-t ${values.timeout}`);
        }

        if (values.bandwidth) {
            args.push(`-b ${values.bandwidth}`);
        }

        if (values.retransmits) {
            args.push(`-m ${values.retransmits}`);
        }

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "nbtscan",
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
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    /**
     * Handles completion of the output file saving process.
     */
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

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
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, handleProcessData, handleProcessTermination)}
                    <Switch
                        size="md"
                        label="Advanced Mode"
                        checked={checkedAdvanced}
                        onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                    />
                    {!checkedAdvanced && (
                        <TextInput label={"Subnet or Range to Scan"} required {...form.getInputProps("subnet")} />
                    )}
                    {checkedAdvanced && (
                        <>
                            <Checkbox
                                label={"Dump Packets Mode"}
                                //Check the status of the option
                                checked={checkedPacketDump}
                                onChange={(e) => e.currentTarget.checked}
                            />
                            <TextInput
                                label={"Subnet or Range to Scan"}
                                placeholder={"Format of xxx.xxx.xxx.xxx/xx or xxx.xxx.xxx.xxx-xxx."}
                                {...form.getInputProps("scanRange")}
                            />
                            <TextInput
                                label={"Timeout Delay"}
                                placeholder={"in milliseconds; default is 1000"}
                                {...form.getInputProps("timeout")}
                            />
                            <TextInput
                                label={"Bandwidth"}
                                placeholder={"Kilobytes per second; default is 128"}
                                {...form.getInputProps("bandwidth")}
                            />
                            <TextInput
                                label={"Retransmits"}
                                placeholder={"number; default is 0"}
                                {...form.getInputProps("retransmits")}
                            />
                        </>
                    )}
                    <Button type={"submit"}>Start {title}</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default NbtscanTool;
