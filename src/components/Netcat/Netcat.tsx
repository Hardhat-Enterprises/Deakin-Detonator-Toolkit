import { Button, Checkbox, NativeSelect, Stack, TextInput } from "@mantine/core";
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

//Form values interface
interface FormValuesType {
    ipAddress: string;
    portNumber: string;
    netcatOptions: string;
    websiteUrl: string;
    filePath: string;
}

//Deals with the generatedfilepath unique identifier that is added at the end of a file
const cleanFileName = (filePath: string): string => {
    // Split the file name by the underscore (_) and keep the first part (before the timestamp/ID)
    const parts = filePath.split("_");

    // Keep only the base file name (before the timestamp and unique identifier)
    const baseFileName = parts[0];
    return baseFileName;
};

//Netcat Options Configuration
const netcatOptions = ["Listen", "Connect", "Port Scan", "Send File", "Receive File", "Website Port Scan"];

/**
 * The Netcat component.
 * @returns The Netcat component.
 */
//Tool name must be capital or jsx will cry out errors :P
const NetcatTool = () => {
    //Component State Variables
    var [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [selectedScanOption, setSelectedNetcatOption] = useState("");
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved
    const [checkedVerboseMode, setCheckedVerboseMode] = useState(false); // State variable to indicate whether the verbose mode is enabled.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [fileNames, setFileNames] = useState<string[]>([]); // State variable to store the file names.
    // Component Constants.
    const title = "Netcat"; // Title of the component.
    const description =
        "A simple Unix utility which reads and writes data across network connections using TCP or UDP protocol."; // Description of the component.
    const steps =
        "Step 1: If you want to listen for connections for chat or reverse shell choose the listen option and provide a port number.\n" +
        "Step 2: If you want to scan for ports, provide an IP address and a port range.\n" +
        "Step 3: If you want to send a file, provide the destination IP address, port number, and file name.\n" +
        "Step 4: If you want to receive a file, provide a port number and the file name.\n" +
        "Step 5: If you want to port scan a domain, provide domain name and a port number. \n\n" +
        "Note:   You should only use website port scan on a domain that you own.\n" +
        "Note 2: Using the sending/receiving file option might seem like it is not working, but it is working.\n" +
        "Note 3: You will need two devices for file transfer to work — one for sending and the other needs to be set up on the specified port to capture the incoming file.\n" +
        "Ensure both machines are properly configured and connected to the same network or through an accessible route (such as a VPN, or through valid public IP addresses) to complete the file transfer.\n";
    const sourceLink = "https://www.kali.org/tools/netcat/"; // Link to the source code
    const tutorial = "https://docs.google.com/document/d/1NQ-hy8NBuTTUJzHebST5UF42JPjJ3yfIvNgWbM7FPLE/edit?usp=sharing"; // Link to the official documentation/tutorial.
    const dependencies = ["nc"]; // Contains the dependencies required by the component

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

    // Form hook to handle form input.
    let form = useForm({
        initialValues: {
            ipAddress: "",
            portNumber: "",
            netcatOptions: "",
            websiteUrl: "",
            filePath: "",
        },
    });

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
     * Handles the submission of the form and executes the appropriate netcat command based on the selected options.
     *
     * @param {FormValuesType} values - The values from the form submission.
     * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true); // Activate loading overlay
        setAllowSave(false); // Disable saving until the command completes

        let args: string[] = [];
        const verboseFlag = checkedVerboseMode ? "-vn" : "-n";

        // Construct arguments based on the selected Netcat option
        switch (values.netcatOptions) {
            case "Listen":
                args = ["-l", verboseFlag, "-p", values.portNumber];
                break;
            case "Connect":
                args = [verboseFlag, values.ipAddress, values.portNumber];
                break;
            case "Port Scan":
                args = ["-z", verboseFlag, values.ipAddress, values.portNumber];
                break;
            case "Send File":
                if (!fileNames.length) {
                    setOutput("Error: No file selected for sending.");
                    setLoading(false);
                    return;
                }
                args = ["-w", "10", values.ipAddress, values.portNumber, "<", fileNames[0]];
                break;

            case "Receive File":
                if (!values.filePath) {
                    setOutput("Error: No file path provided for receiving.");
                    setLoading(false);
                    return;
                }
                args = ["-l", verboseFlag, "-p", values.portNumber, ">", values.filePath];
                break;
            case "Website Port Scan":
                args = ["-z", verboseFlag, values.websiteUrl, values.portNumber];
                break;
            default: // Deactivate loading overlay
                setOutput("Invalid Netcat option selected.");
                setLoading(false);
                return;
        }

        try {
            await CommandHelper.runCommandWithPkexec("nc", args, handleProcessData, handleProcessTermination);
        } catch (error: any) {
            console.error("Error executing command:", error.message);
            setOutput(`Error: ${error.message}`);
            setLoading(false); // Deactivate loading overlay
        }
    };

    /**
     * clearOutput: Callback function to clear the console output.
     * It resets the state variable holding the output, thereby clearing the display.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setAllowSave(false);
        setHasSaved(false);
    }, [setOutput]);

    /**
     * Callback function to handle the completion of a save operation.
     */
    const handleSaveComplete = useCallback(() => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    }, []);

    //<ConsoleWrapper output={output} clearOutputCallback={clearOutput} /> prints the terminal on the tool
    return (
        // Render the UserGuide component with component details
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
            <form onSubmit={form.onSubmit((values) => onSubmit({ ...values, netcatOptions: selectedScanOption }))}>
                <Stack>
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, handleProcessData, handleProcessTermination)}
                    <Checkbox
                        label={"Verbose Mode"}
                        checked={checkedVerboseMode}
                        onChange={(e) => setCheckedVerboseMode(e.currentTarget.checked)}
                    />
                    <NativeSelect
                        value={selectedScanOption}
                        onChange={(e) => setSelectedNetcatOption(e.target.value)}
                        title={"Netcat option"}
                        data={netcatOptions}
                        required
                        placeholder={"Pick a scan option"}
                        description={"Type of scan to perform"}
                    />
                    {selectedScanOption === "Listen" && (
                        <>
                            <TextInput label={"Port number"} required {...form.getInputProps("portNumber")} />
                        </>
                    )}
                    {selectedScanOption === "Connect" && (
                        <>
                            <TextInput label={"IP address"} required {...form.getInputProps("ipAddress")} />
                            <TextInput label={"Port number"} required {...form.getInputProps("portNumber")} />
                        </>
                    )}
                    {selectedScanOption === "Port Scan" && (
                        <>
                            <TextInput label={"IP address"} required {...form.getInputProps("ipAddress")} />
                            <TextInput
                                label={"Port number/Port range"}
                                required
                                {...form.getInputProps("portNumber")}
                            />
                        </>
                    )}
                    {selectedScanOption === "Send File" && (
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
                    {selectedScanOption === "Receive File" && (
                        <>
                            <TextInput label={"Port number"} required {...form.getInputProps("portNumber")} />
                            <TextInput label={"File path"} required {...form.getInputProps("filePath")} />
                        </>
                    )}
                    {selectedScanOption === "Website Port Scan" && (
                        <>
                            <TextInput
                                label={"Port number/Port range"}
                                required
                                {...form.getInputProps("portNumber")}
                            />
                            <TextInput label={"Domain name"} required {...form.getInputProps("websiteUrl")} />
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

export default NetcatTool;
