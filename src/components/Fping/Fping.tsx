import { Button, Stack, TextInput, Switch, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the Fping component.
 */
interface FormValuesType {
    target: string;
    filePath: string;
    size: string;
    backoff: string;
    count: string;
    ttl: string;
    interface: string;
    period: string;
    retries: string;
    source: string;
}

/**
 * The Fping component.
 * @returns The Fping component.
 */
function Fping() {
    // Component State Variables
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [checkedFilePath, setFilePath] = useState(false); // State variable to indicate if using a file containing targets.
    const [checkedAdvanced, setCheckedAdvanced] = useState(false); // State variable to indicate advanced settings.
    //Advanced mode state variables.
    const [checkedIPv4, setCheckedIPv4] = useState(false); //State variable to indicate to only ping IPv4 Targets.
    const [checkedIPv6, setCheckedIPv6] = useState(false); //State variable to indicate to only ping IPv6 Targets.
    const [checkedAlive, setCheckedAlive] = useState(false); //State variable to indicate targets that are alive.
    const [checkedUnreachable, setCheckedUnreachable] = useState(false); //State variable to indicate targets that are unreachable.
    const [checkedRandom, setCheckedRandom] = useState(false); //State variable to indicate to send random packet data.
    const [checkedDontFrag, setCheckedDontFrag] = useState(false); //State variable to indicate to set the don't fragment flag.
    const [checkedAddress, setCheckedAddress] = useState(false); //State variable to indicate to show targets by address.
    const [checkedName, setCheckedName] = useState(false); //State variable to indicate to show targets by name.
    const [checkedElapsed, setCheckedElapsed] = useState(false); //State variable to indicate to show elapsed time on return packets.
    const [checkedOutage, setCheckedOutage] = useState(false); //State variable to indicate to show accumulated outage time.
    const [checkedQuiet, setCheckedQuiet] = useState(false); //State variable to indicate to show quiet output.
    const [checkedStats, setCheckedStats] = useState(false); //State variable to indicate to show final stats output.

    // Component Constants.
    const title = "Fping"; // Title of the component.
    const description =
        "Fping is a ping like program which uses the Internet Control Message Protocol (ICMP) echo request to determine if a target host is responding."; // Description of the component.
    const steps = "";
    const sourceLink = "https://www.kali.org/tools/Fping/"; // Link to the source code (or Kali Tools).
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["fping"]; // Constains the dependencies required for the component.

    // Form hook to handle form input.
    const form = useForm({
        initialValues: {
            target: "",
            filePath: "",
            size: "",
            backoff: "",
            count: "",
            ttl: "",
            interface: "",
            period: "",
            retries: "",
            source: "",
        },
    });

    // Check if the command is available and set the state variables accordingly.
    useEffect(() => {
        // Check if the command is available and set the state variables accordingly.
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable); // Set the command availability state.
                setOpened(!isAvailable); // Set the modal state to opened if the command is not available.
                setLoadingModal(false); // Set loading to false after the check is done.
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false); // Also set loading to false in case of error.
            });
    }, []);

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data received to the existing output.
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output
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

            // Allow Saving as the output is finalised.
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback.
    );

    // Actions taken after saving the output.
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user.
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the Fping tool with the given parameter.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form value containing the target/targets.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process.
        setLoading(true);

        // Disallow saving until the tool's execution is complete.
        setAllowSave(false);

        // Construct the argmentss for the Fping command based on form input.
        const args: string[] = [];
        //Advanced input options
        if (checkedAdvanced) {
            //Number of pings to each target.
            if (values.count) {
                args.push("-c", values.count);
            }
            //Exponential backoff factor.
            if (values.backoff) {
                args.push("-B", values.backoff);
            }
            //Size of ping data in bytes to send.
            if (values.size) {
                args.push("-b", values.size);
            }
            //Time to Live hops.
            if (values.ttl) {
                args.push("-H", values.ttl);
            }
            //Bind to a particular interface.
            if (values.interface) {
                args.push("-I", values.interface);
            }
            //Interval between ping packets.
            if (values.period) {
                args.push("-p", values.period);
            }
            //Number of retries.
            if (values.retries) {
                args.push("-r", values.retries);
            }
            //Sends random packet data.
            if (checkedRandom) {
                args.push("-R");
            }
            //Sets the Don't Frag flag.
            if (checkedDontFrag) {
                args.push("-M");
            }
            //Shows targets by address.
            if (checkedAddress) {
                args.push("-A");
            }
            //Shows targets by name.
            if (checkedName) {
                args.push("-d");
            }
            //Show elapsed time on return packets.
            if (checkedElapsed) {
                args.push("-e");
            }
            //Show the accumulated outage time.
            if (checkedOutage) {
                args.push("-o");
            }
            //Show quiet output.
            if (checkedQuiet) {
                args.push("-q");
            }
            //Show the final stats.
            if (checkedStats) {
                args.push("-s");
            }
            //Only ping IPv4 targets.
            if (checkedIPv4) {
                args.push("-4");
            }
            //Only ping IPv6 targets.
            if (checkedIPv6) {
                args.push("-6");
            }
            //Only show targets that are alive.
            if (checkedAlive) {
                args.push("-a");
            }
            //Only show targets that are unreachable.
            if (checkedUnreachable) {
                args.push("-u");
            }
        }
        // Takes the input values of the targets and makes an array while trimming the input of extra whitespace.
        if (!checkedFilePath) {
            args.push(...values.target.trim().split(/\s+/));
        }
        // Uses the specified file path of the target list.
        if (checkedFilePath) {
            args.push("-f", values.filePath);
        }

        // Execute the bash command via helper method and handle its output or potential errors.
        CommandHelper.runCommandGetPidAndOutput("fping", args, handleProcessData, handleProcessTermination)
            .then(({ pid, output }) => {
                setPid(pid);
                setOutput(output);
            })
            .catch((error) => {
                setLoading(false);
                setOutput(`Error: ${error.message}`);
            });
    };

    /**
     * clearOutput: Callback function to clear the console output.
     * It resets the state variable holding the output, thereby clearing the display.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

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
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, handleProcessData, handleProcessTermination)}
                    <Switch
                        label="Target File"
                        checked={checkedFilePath}
                        onChange={(e) => setFilePath(e.currentTarget.checked)}
                    />
                    {!checkedFilePath && (
                        <TextInput
                            label={"Target"}
                            placeholder={"E.g. Google.com Amazon.com Youtube.com"}
                            {...form.getInputProps("target")}
                        />
                    )}
                    {checkedFilePath && (
                        <TextInput
                            label={"File Path"}
                            placeholder="E.g. /home/kali/Documents/targets.txt"
                            {...form.getInputProps("filePath")}
                        />
                    )}
                    <Switch
                        label="Advanced Options"
                        checked={checkedAdvanced}
                        onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                    />
                    {checkedAdvanced && (
                        <>
                            <Group>
                                <Switch
                                    label="Only ping IPv4 targets"
                                    checked={checkedIPv4}
                                    onChange={(e) => {
                                        setCheckedIPv4(e.currentTarget.checked);
                                        //Turn off IPv6 switch when IPv4 is checked.
                                        if (e.currentTarget.checked) {
                                            setCheckedIPv6(false);
                                        }
                                    }}
                                />
                                <Switch
                                    label="Only ping IPv6 targets"
                                    checked={checkedIPv6}
                                    onChange={(e) => {
                                        setCheckedIPv6(e.currentTarget.checked);
                                        //Turn off IPv4 switch when IPv6 is checked.
                                        if (e.currentTarget.checked) {
                                            setCheckedIPv4(false);
                                        }
                                    }}
                                />
                            </Group>
                            <Group>
                                <Switch
                                    label="Show targets that are alive"
                                    checked={checkedAlive}
                                    onChange={(e) => {
                                        setCheckedAlive(e.currentTarget.checked);
                                        //Turn off Unreachable switch when Alive is checked.
                                        if (e.currentTarget.checked) {
                                            setCheckedUnreachable(false);
                                        }
                                    }}
                                />
                                <Switch
                                    label="Show targets that are unreachable"
                                    checked={checkedUnreachable}
                                    onChange={(e) => {
                                        setCheckedUnreachable(e.currentTarget.checked);
                                        //Turn off Alive switch when Unreachable is checked.
                                        if (e.currentTarget.checked) {
                                            setCheckedAlive(false);
                                        }
                                    }}
                                />
                            </Group>
                            <Group>
                                <Switch
                                    label="Send random packet data"
                                    checked={checkedRandom}
                                    onChange={(e) => setCheckedRandom(e.currentTarget.checked)}
                                />
                                <Switch
                                    label="Set the Don't Frag flag"
                                    checked={checkedDontFrag}
                                    onChange={(e) => setCheckedDontFrag(e.currentTarget.checked)}
                                />
                                <Switch
                                    label="Show targets by address"
                                    checked={checkedAddress}
                                    onChange={(e) => setCheckedAddress(e.currentTarget.checked)}
                                />
                                <Switch
                                    label="Show targets by name"
                                    checked={checkedName}
                                    onChange={(e) => setCheckedName(e.currentTarget.checked)}
                                />
                            </Group>
                            <Group>
                                <Switch
                                    label="Elapsed time on return packets"
                                    checked={checkedElapsed}
                                    onChange={(e) => setCheckedElapsed(e.currentTarget.checked)}
                                />
                                <Switch
                                    label="Accumulated Outage time"
                                    checked={checkedOutage}
                                    onChange={(e) => setCheckedOutage(e.currentTarget.checked)}
                                />
                                <Switch
                                    label="Show quiet output"
                                    checked={checkedQuiet}
                                    onChange={(e) => setCheckedQuiet(e.currentTarget.checked)}
                                />
                                <Switch
                                    label="Show final stats"
                                    checked={checkedStats}
                                    onChange={(e) => setCheckedStats(e.currentTarget.checked)}
                                />
                            </Group>
                            <Group>
                                <TextInput
                                    label={"Bind to a particular interface"}
                                    {...form.getInputProps("interface")}
                                />
                                <TextInput
                                    label={"Amount of pings to send each target"}
                                    {...form.getInputProps("count")}
                                />
                                <TextInput label={"Set source IP Address"} {...form.getInputProps("source")} />
                                <TextInput label={"Time to Live hops"} {...form.getInputProps("ttl")} />
                            </Group>
                            <Group>
                                <TextInput
                                    label={"Size in bytes"}
                                    placeholder="default: 56"
                                    {...form.getInputProps("size")}
                                />
                                <TextInput
                                    label={"Exponential backoff factor"}
                                    placeholder="default: 1.5"
                                    {...form.getInputProps("backoff")}
                                />
                                <TextInput
                                    label={"Interval between ping packets to one target"}
                                    placeholder="default: 1000 ms"
                                    {...form.getInputProps("period")}
                                />
                                <TextInput
                                    label={"Number of retries"}
                                    placeholder="default: 3"
                                    {...form.getInputProps("retries")}
                                />
                            </Group>
                        </>
                    )}
                    <Button type={"submit"}>Start {title}</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}

export default Fping;
