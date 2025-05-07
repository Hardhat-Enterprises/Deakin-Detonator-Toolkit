import { Button, NativeSelect, Stack, TextInput, Stepper, Switch, Grid } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { FilePicker } from "../FileHandler/FilePicker";

/**
 * Represents the form values for the Netcat component.
 */
interface FormValuesType {
    ipAddress: string;
    portNumber: string;
    netcatOptions: string;
    websiteUrl: string;
    filePath: string;
}

const NetcatTool = () => {
    // Component State Variables
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved
    const [checkedVerboseMode, setCheckedVerboseMode] = useState(false); // State variable to indicate whether the verbose mode is enabled.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [fileNames, setFileNames] = useState<string[]>([]); // State variable to store the file names.
    const [active, setActive] = useState(0); // State variable for the Stepper's active step.

    // Component Constants
    const title = "Netcat"; // Title of the component.
    const description =
        "A simple Unix utility which reads and writes data across network connections using TCP or UDP protocol."; // Description of the component.
    const steps =
        "Step 1: Select the Netcat option.\n" +
        "Step 2: Provide the required inputs based on the selected option.\n" +
        "Step 3: Run the Netcat command and review results.";
    "Note 1: If you want to listen for connections for chat or reverse shell choose the listen option and provide a port number.\n" +
        "Note 2: If you want to scan for ports, provide an IP address and a port range.\n" +
        "Note 3: If you want to send/receive a file, provide the destination IP address, port number, and file name.Using the sending/receiving file option might seem like it is not working, but it is working. \n" +
        "Note 4: If you want to port scan a domain, provide domain name and a port number.You should only use website port scan on a domain that you own. \n\n" +
        "Ensure both machines are properly configured and connected to the same network or through an accessible route (such as a VPN, or through valid public IP addresses) to complete the file transfer.\n";
    const sourceLink = "https://www.kali.org/tools/netcat/"; // Link to the source code
    const tutorial = "https://docs.google.com/document/d/1NQ-hy8NBuTTUJzHebST5UF42JPjJ3yfIvNgWbM7FPLE/edit?usp=sharing"; // Link to the official documentation/tutorial.
    const dependencies = ["nc"]; // Contains the dependencies required by the component

    // Form hook to handle form input.
    const form = useForm<FormValuesType>({
        initialValues: {
            ipAddress: "",
            portNumber: "",
            netcatOptions: "",
            websiteUrl: "",
            filePath: "",
        },
    });

    // Check if the command is available and set the state variables accordingly.
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
            console.log("handleProcessTermination called with code:", code, "signal:", signal);
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }

            setPid(""); // Clear the PID reference.
            setLoading(false);
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    /**
     * Handles the submission of the form and executes the appropriate netcat command based on the selected options.
     *
     * @param {FormValuesType} values - The values from the form submission.
     * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);

        let command = "nc"; // Default command
        let args: string[] = [];
        const verboseFlag = checkedVerboseMode ? "-vn" : "-n";
        const verboseFlagWithSpaceAndDash = checkedVerboseMode ? " -v" : "";

        // Handle different netcat operations
        switch (values.netcatOptions) {
            case "Listen":
                args = ["-l", verboseFlag, "-w", "60", "-p", values.portNumber];
                break;
            case "Connect":
                args = [verboseFlag, "-w", "30", values.ipAddress, values.portNumber];
                break;
            case "Port Scan":
                args = ["-z", verboseFlag, "-w", "5", values.ipAddress, values.portNumber];
                break;
            case "Website Port Scan":
                args = ["-z", verboseFlag, "-w", "5", values.websiteUrl, values.portNumber];
                break;
            case "Send File":
                // Use bash to handle the redirection - note use of verboseFlagWithSpaceAndDash
                command = "bash";
                args = [
                    "-c",
                    `nc -w 10${verboseFlagWithSpaceAndDash} -n ${values.ipAddress} ${values.portNumber} < "${fileNames[0]}"`,
                ];
                break;
            case "Receive File":
                // Use bash to handle the redirection - note use of verboseFlagWithSpaceAndDash
                command = "bash";
                args = [
                    "-c",
                    `nc -l${verboseFlagWithSpaceAndDash} -n -w 60 -p ${values.portNumber} > "${values.filePath}"`,
                ];
                break;
            default:
                setOutput("Invalid Netcat option selected.");
                setLoading(false);
                return;
        }

        console.log(`Executing command: ${command} ${args.join(" ")}`);

        try {
            const { pid, output } = await CommandHelper.runCommandWithPkexec(
                command,
                args.filter(Boolean),
                handleProcessData,
                handleProcessTermination
            );
            setPid(pid);
            setOutput(output);

            if (values.netcatOptions === "Listen" || values.netcatOptions === "Connect") {
                handleProcessData(
                    "\nNote: This operation may keep running. The loading overlay will stop in 10 seconds."
                );

                // Safety timeout to ensure loading overlay stops
                setTimeout(() => {
                    console.log("Safety timeout triggered - stopping loading overlay");
                    setLoading(false);
                    setAllowSave(true);
                }, 10000); // 10 seconds
        } catch (error: any) {
            setOutput(`Error: ${error.message}`);
            setLoading(false); //Stop Loading state
            setAllowSave(true);
        }
    };

    /**
     * clearOutput: Callback function to clear the console output.
     * It resets the state variable holding the output, thereby clearing the display.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, []);

    /**
     * handleSaveComplete: Recognises that the output file has been saved.
     * Passes the saved status back to SaveOutputToTextFile_v2
     */
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    // Function to handle the next step in the Stepper.
    const nextStep = () => setActive((current) => (current < 2 ? current + 1 : current));

    // Function to handle the previous step in the Stepper.
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

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
                {LoadingOverlayAndCancelButtonPkexec(loading, pid, handleProcessData, handleProcessTermination)}
                <Stepper active={active} onStepClick={setActive} breakpoint="sm">
                    <Stepper.Step label="Select Option">
                        <NativeSelect
                            value={form.values.netcatOptions} // Bind to the form's netcatOptions field
                            onChange={(e) => form.setFieldValue("netcatOptions", e.target.value)} // Update the form's netcatOptions field
                            title={"Netcat option"}
                            data={[
                                { value: "", label: "Pick a Netcat option", disabled: true },
                                { value: "Listen", label: "Listen" },
                                { value: "Connect", label: "Connect" },
                                { value: "Port Scan", label: "Port Scan" },
                                { value: "Send File", label: "Send File" },
                                { value: "Receive File", label: "Receive File" },
                                { value: "Website Port Scan", label: "Website Port Scan" },
                            ]}
                            required
                        />
                    </Stepper.Step>
                    <Stepper.Step label="Provide Inputs">
                        <Stack>
                            {/* Verbose Mode Toggle */}
                            <Switch
                                label="Enable Verbose Mode"
                                checked={checkedVerboseMode}
                                onChange={(event) => setCheckedVerboseMode(event.currentTarget.checked)}
                            />

                            {form.values.netcatOptions === "Listen" && (
                                <TextInput label={"Port number"} required {...form.getInputProps("portNumber")} />
                            )}
                            {form.values.netcatOptions === "Connect" && (
                                <>
                                    <TextInput label={"IP address"} required {...form.getInputProps("ipAddress")} />
                                    <TextInput label={"Port number"} required {...form.getInputProps("portNumber")} />
                                </>
                            )}
                            {form.values.netcatOptions === "Port Scan" && (
                                <>
                                    <TextInput label={"IP address"} required {...form.getInputProps("ipAddress")} />
                                    <TextInput
                                        label={"Port number/Port range"}
                                        required
                                        {...form.getInputProps("portNumber")}
                                    />
                                </>
                            )}
                            {form.values.netcatOptions === "Send File" && (
                                <>
                                    <TextInput label={"IP address"} required {...form.getInputProps("ipAddress")} />
                                    <TextInput label={"Port number"} required {...form.getInputProps("portNumber")} />
                                    <FilePicker
                                        fileNames={fileNames}
                                        setFileNames={setFileNames}
                                        multiple={false}
                                        componentName="Netcat"
                                        labelText="File"
                                        placeholderText="Click to select file(s)"
                                    />
                                </>
                            )}
                            {form.values.netcatOptions === "Receive File" && (
                                <>
                                    <TextInput label={"Port number"} required {...form.getInputProps("portNumber")} />
                                    <TextInput label={"File path"} required {...form.getInputProps("filePath")} />
                                </>
                            )}
                            {form.values.netcatOptions === "Website Port Scan" && (
                                <>
                                    <TextInput
                                        label={"Port number/Port range"}
                                        required
                                        {...form.getInputProps("portNumber")}
                                    />
                                    <TextInput label={"Domain name"} required {...form.getInputProps("websiteUrl")} />
                                </>
                            )}
                        </Stack>
                    </Stepper.Step>
                    <Stepper.Step label="Run">
                        <Stack align="center" mt={20}>
                            <Button type="submit" disabled={loading} style={{ alignSelf: "center" }}>
                                Run Netcat
                            </Button>
                        </Stack>
                    </Stepper.Step>
                </Stepper>

                {/* Add navigation buttons */}
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
                    <Button onClick={prevStep} disabled={active === 0}>
                        Previous
                    </Button>
                    <Button onClick={nextStep} disabled={active === 2}>
                        Next
                    </Button>
                </div>
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </form>
        </RenderComponent>
    );
};

export default NetcatTool;
