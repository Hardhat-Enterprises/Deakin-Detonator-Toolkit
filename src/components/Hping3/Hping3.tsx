import { Button, Stack, Switch, TextInput, NumberInput, NativeSelect } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile"; //v2
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the hping3 component.
 */
interface FormValuesType {
    ipAddress: string;
    minPort: string;
    maxPort: string;
    portNumber: string;
    toolOptions: string;
    packetCount: string;
}

//Tool options

const toolOptions = ["Scan a range of ports", "Send SYN packets to a specific port"];

/**
 * The hping3 component.
 * @returns The hping component.
 */
const Hping3 = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [selectedOption, setSelectedOption] = useState("");
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.

    // Component Constants.
    const title = "hping3"; // Title of the component.
    const description =
        "Hping3 is a network packet crafting and analysis tool. It is used for testing firewalls, network performance, port scanning, and network auditing."; // Description of the component.
    const steps =
        "Firstly, choose if you want to scan a range of ports or send SYN packets to a specific port.\n\n" +
        "If you choose to scan a range of ports:\n\n" +
        "Step 1: Enter the IP address of the machine that you want to scan.\n" +
        "Step 2: Enter the start of the port range.\n" +
        "Step 3: Select your desired channel.\n" +
        "Step 4: Enter the end of the port range. \n" +
        "Step 5: Enter the output filename if required. \n\n" +
        "If you choose to send SYN packets to a specific port:\n\n" +
        "Step 1: Enter the IP address of the machine that you want to scan.\n" +
        "Step 2: Enter the port number. \n" +
        "Step 3: Enter the number of packets to send. \n\n" +
        "Once you enter the details, do the following:\n\n" +
        "Step 1: Click Start " +
        title +
        ".\n" +
        "Step 2: Enter your password (" +
        title +
        " requires sudo privileges to run).\n" +
        "Step 3: View the results in the output block.";
    const sourceLink = "https://www.kali.org/tools/hping3/"; // Link to the source code (or Kali Tools).
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["hping3"]; // Contains the dependencies required by the component.

    // Form hook to handle form input.
    const form = useForm({
        initialValues: {
            ipAddress: "",
            minPort: "",
            maxPort: "",
            portNumber: "",
            toolOptions: "",
            packetCount: "",
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

            // Allow Saving as the output is finalised
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData], // Dependency on the handleProcessData callback
    );

    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the hping3 tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the IP address, start of port range, end of port range, port number and packet count.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        let args = [""];

        // Construct arguments for the hping3 command based on form input
        if (selectedOption == "Scan a range of ports") {
            const range = values.minPort + "-" + values.maxPort;
            args = [`-S`, `--scan`, range, values.ipAddress];
        }
        if (selectedOption == "Send SYN packets to a specific port") {
            const portNumberVariable = values.portNumber.toString();
            const countVariable = values.packetCount.toString();
            args = ["-S", values.ipAddress, "-p", portNumberVariable, "-c", countVariable];
        }

        // Execute the hping3 command via helper method and handle its output or potential errors
        CommandHelper.runCommandWithPkexec("hping3", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
                // Update the UI with the results from the executed command
                setOutput(output);
                setAllowSave(true);
                setPid(pid);
            })
            .catch((error) => {
                // Display any errors encountered during command execution
                setOutput(error.message);
                // Deactivate loading state
                setLoading(false);
                setAllowSave(true);
            });
    };

    /**
     * Clears the output state.
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
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, handleProcessData, handleProcessTermination)}
                    <NativeSelect
                        value={selectedOption}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        title={"Tool option"}
                        data={toolOptions}
                        required
                        placeholder={"Pick a tool option"}
                        description={"The option to perform using hping3."}
                    />
                    {selectedOption === "Scan a range of ports" && (
                        <>
                            <TextInput label={"IP address"} required {...form.getInputProps("ipAddress")} />
                            <TextInput label={"Start of port range"} required {...form.getInputProps("minPort")} />
                            <TextInput label={"End of port range"} required {...form.getInputProps("maxPort")} />
                        </>
                    )}
                    {selectedOption === "Send SYN packets to a specific port" && (
                        <>
                            <TextInput label={"IP address"} required {...form.getInputProps("ipAddress")} />
                            <NumberInput
                                stepHoldDelay={500}
                                stepHoldInterval={100}
                                label={"Port"}
                                required
                                {...form.getInputProps("portNumber")}
                            />
                            <NumberInput
                                stepHoldDelay={500}
                                stepHoldInterval={100}
                                label={"Packet count"}
                                required
                                {...form.getInputProps("packetCount")}
                            />
                        </>
                    )}
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type={"submit"}>Start {title}</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Hping3;
