import { Button, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useEffect, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { RenderComponent } from "../UserGuide/UserGuide";

/**
 * FormValuesType defines the structure for the form values used in the TracerouteTool component.
 * @field hostname: The hostname or IP address for the traceroute operation.
 * @field portNumber:The port number to be used, currently not utilized in the traceroute operations.
 * @field tracerouteSwitch: The selected type of traceroute scan.
 * @field tracerouteOptions: Custom traceroute options provided by the user.
 */
interface FormValuesType {
    hostname: string;
    portNumber: string;
    traceRouteSwitch: string;
    traceRouteOptions: string;
}

/**
 * The Traceroute component.
 * @returns The Traceroute component.
 */
const Traceroute = () => {
    // Component State Variables.
    const [output, setOutput] = useState(""); //State to store the output from the traceroute command
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [selectedScanOption, setSelectedTracerouteOption] = useState("Traceroute ICMP scan"); // State to store the selected scan type.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the model is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the model.
    const [allowSave, setAllowSave] = useState(false); // State variable indicating whether the current state is valid and the results can be saved.
    const [hasSaved, setHasSaved] = useState(false); // State variable that tracks whether the results have already been saved to avoid redundant operations.
    // Form hook to handle form input.

    // Component Constants.
    const title = "Traceroute"; // Title of the tool.
    const description = // Description of the component
        "The Traceroute tool provides a utility for displaying the route that IP packets have used as they travel to a particular network or host.";
    const steps =
        "Step 1: Enter a Hostname/IP address.\n" +
        "Step 2: (Optional) Enter any additional options.\n" +
        "Step 3: Select a scan option.\n" +
        "Step 4: Click Scan to commence Traceroute operation.\n" +
        "Step 5: View the Output block below to view the results of the tool's execution.";
    const sourceLink = "https://www.kali.org/tools/traceroute/"; // Link to the source code(or kali tools).
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["traceroute"]; // Contains the dependencies required by the component.

    // Traceroute Options - Types of traceroute scans available.
    const traceRouteSwitch = [
        "Traceroute ICMP scan",
        "Traceroute TCP scan",
        "Traceroute UDP scan",
        "Traceroute custom scan",
    ];

    let form = useForm({
        initialValues: {
            hostname: "",
            portNumber: "",
            traceRouteOptions: "",
        },
    });

    // Check is the command is avaliable and set the state variables accordingly.
    useEffect(() => {
        // Check if the command is available and set the state variables accordingly.
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable); // Set the command availability state.
                setOpened(!isAvailable); // Set the modal state to opened if the command is not available.
                setLoadingModal(false); // Set loading to false after check is done.
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false);
            });
    }, []);

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data recieved to the existing output.
     * @param {string} data - The data recieved from the child process.
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
     * onSubmit: Asynchronous handler for the form submission event event related to executing traceroute commands.
      It constructs command arguments, executes them via a shell script, and updates the UI with the results or errors.
     *
     * @param {FormValuesType} values - Contains the type of traceroute scan (ICMP, TCP, UDP, custom),
     * the destination hostname, and optional custom traceroute options.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true); // Activate loading state to indicate ongoing process
        let args = [""];

        // Switch case to handle different traceroute scan options based on user selection.
        switch (values.traceRouteSwitch) {
            case "Traceroute ICMP scan":
                args = [`/usr/share/ddt/Bash-Scripts/Tracerouteshell.sh`];
                args.push(`-I`);
                args.push(`${values.hostname}`); // Adds the hostname to the arguments list.
                console.log(args);
                CommandHelper.runCommandGetPidAndOutput("bash", args, handleProcessData, handleProcessTermination)
                    .then(({ pid, output }) => {
                        setPid(pid);
                        setOutput(output);
                        setAllowSave(true);
                    })
                    .catch((error: any) => {
                        setLoading(false);
                        setOutput(`Error: ${error.message}`);
                    });

                break;
            // Traceroute TCP scan uses the '-T' option.
            // Syntax: traceroute -T <hostname>
            case "Traceroute TCP scan":
                args = [`/usr/share/ddt/Bash-Scripts/Tracerouteshell.sh`];
                args.push(`-T`);
                args.push(`${values.hostname}`); // Adds the hostname to the arguments list.
                CommandHelper.runCommandGetPidAndOutput("bash", args, handleProcessData, handleProcessTermination)
                    .then(({ pid, output }) => {
                        setPid(pid);
                        setOutput(output);
                        setAllowSave(true);
                    })
                    .catch((error: any) => {
                        setLoading(false);
                        setOutput(`Error: ${error.message}`);
                    });

                break;
            // Traceroute UDP scan uses the '-U' option.
            // Syntax: traceroute -U <hostname>
            case "Traceroute UDP scan":
                args = [`/usr/share/ddt/Bash-Scripts/Tracerouteshell.sh`];
                args.push(`-U`);
                args.push(`${values.hostname}`); // Adds the hostname to the arguments list.
                CommandHelper.runCommandGetPidAndOutput("bash", args, handleProcessData, handleProcessTermination)
                    .then(({ pid, output }) => {
                        setPid(pid);
                        setOutput(output);
                        setAllowSave(true);
                    })
                    .catch((error: any) => {
                        setLoading(false);
                        setOutput(`Error: ${error.message}`);
                    });

                break;
            // Traceroute custom scan allows specifying additional options
            // Syntax: traceroute <options> <hostname>
            case "Traceroute custom scan":
                args = [`/usr/share/ddt/Bash-Scripts/Tracerouteshell.sh`];
                args.push(`${values.traceRouteOptions}`); // Adds custom options to the arguments list.
                args.push(`${values.hostname}`); // Adds the hostname to the arguments list.
                CommandHelper.runCommandGetPidAndOutput("bash", args, handleProcessData, handleProcessTermination)
                    .then(({ pid, output }) => {
                        setPid(pid);
                        setOutput(output);
                        setAllowSave(true);
                    })
                    .catch((error: any) => {
                        setLoading(false);
                        setOutput(`Error: ${error.message}`);
                    });

                break;
        }
    };

    /**
     * Clears the output displayed to the user.
     */
    const clearOutput = useCallback(() => {
        setOutput(""); // Memoized function to clear the output.
        setHasSaved(true);
        setAllowSave(false);
    }, [setOutput]);

    const handleSaveComplete = useCallback(() => {
        setHasSaved(true);
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
            <form onSubmit={form.onSubmit((values) => onSubmit({ ...values, traceRouteSwitch: selectedScanOption }))}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <TextInput label={"Hostname/IP address"} {...form.getInputProps("hostname")} />
                    <TextInput label={"Traceroute custom (optional)"} {...form.getInputProps("tracerouteOptions")} />
                    <NativeSelect
                        value={selectedScanOption}
                        onChange={(e) => setSelectedTracerouteOption(e.target.value)}
                        title={"Traceroute option"}
                        data={traceRouteSwitch}
                        required
                        placeholder={"Pick a scan option"}
                        description={"Type of scan to perform"}
                    />
                    <Button type={"submit"}>start traceroute</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Traceroute;
