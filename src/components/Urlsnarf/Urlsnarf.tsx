import { Button, LoadingOverlay, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { RenderComponent } from "../UserGuide/UserGuide";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the Urlsnarf component.
 */
interface FormValuesType {
    listenerInputType: string;
    listenerArgs: string;
    versusMode: string;
}

/**
 * Renders the Urlsnarf component.
 * @returns The rendered Urlsnarf component.
 */
const Urlsnarf = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [selectedListenerInput, setSelectedListenerInput] = useState(""); // State variable to store the selected listener input.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.

    // Component constants.
    const listeners = ["Interface", "Packet capture file"]; // List of listener settings.
    const isListenerInterface = selectedListenerInput === "Interface"; // Check if the selected listener input is an interface.
    const isListenerFile = selectedListenerInput === "Packet capture file"; // Check if the selected listener input is a file.
    const title = "Urlsnarf"; // Title of the component.
    const description =
        "Urlsnarf outputs all requested URLs sniffed from HTTP traffic in Common Log Format, used by almost all web servers."; // Description of the component.
    const steps =
        "Step 1: Select the Listener settings.\n" +
        "Step 2: Input the Interface.\n" +
        "Step 3: Enter any Exclusion details within the sniff.\n" +
        "Step 4: Click Sniff to start Urlsnarf.\n" +
        "Step 5: View the Output block to see the results.";
    const sourceLink = "https://linux.die.net/man/8/urlsnarf"; // Link to the source code (or Kali Tools).
    const tutorial = ""; // Link to the official documentation/tutorial.
    const dependencies = ["dsniff"]; // Contains the dependencies required by the component.

    // Form hook to handle form input.
    let form = useForm({
        initialValues: {
            listenerInputType: "",
            listenerArgs: "",
            versusMode: "",
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
     * handleSaveComplete: Callback to handle the completion of the file saving process.
     * It updates the state by indicating that the file has been saved and deactivates the save button.
     */
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the JohnTheRipper tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the filepath, hash, crack mode, and other options.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        // Start the Loading Overlay
        setLoading(true);

        const args = [];
        if (selectedListenerInput === "Interface") {
            args.push(`-i`, `${values.listenerArgs}`);
        } else if (selectedListenerInput === "Packet capture file") {
            args.push(`-p`, `${values.listenerArgs}`);
        }
        args.push(`-v`, `${values.versusMode}`);

        if (selectedListenerInput === "Interface") {
            setLoading(false); // TODO - Have loading state only be true while inputting password
            CommandHelper.runCommandWithPkexec("urlsnarf", args, handleProcessData, handleProcessTermination)
                .then(({ output, pid }) => {
                    // Update the UI with the results from the executed command
                    setOutput(output);
                    setPid(pid);
                })
                .catch((error) => {
                    // Display any errors encountered during command execution
                    setOutput(error.message);
                    // Deactivate loading state
                });
        } else if (selectedListenerInput === "Packet capture file") {
            CommandHelper.runCommandGetPidAndOutput("urlsnarf", args, handleProcessData, handleProcessTermination)
                .then(({ output, pid }) => {
                    // Update the UI with the results from the executed command
                    setOutput(output);
                    setPid(pid);
                })
                .catch((error) => {
                    // Display any errors encountered during command execution
                    setOutput(error.message);
                    // Deactivate loading state
                    setLoading(false);
                });
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
            <form
                onSubmit={form.onSubmit((values) =>
                    onSubmit({
                        ...values,
                        listenerInputType: selectedListenerInput,
                    })
                )}
            >
                {LoadingOverlayAndCancelButton(loading, pid)}
                <Stack>
                    <NativeSelect
                        value={selectedListenerInput}
                        onChange={(e) => setSelectedListenerInput(e.target.value)}
                        label={"listener settings"}
                        data={listeners}
                        required
                        placeholder={"Interface or PCAP file"}
                    />
                    {isListenerInterface && (
                        <TextInput
                            {...form.getInputProps("listenerArgs")}
                            label={"Interface"}
                            placeholder={"eg: eth0"}
                            required
                        />
                    )}
                    {isListenerFile && (
                        <TextInput
                            {...form.getInputProps("listenerArgs")}
                            label={"File path"}
                            placeholder={"eg: /home/kali/Desktop/pcap.pcapng"}
                            required
                        />
                    )}
                    <TextInput
                        {...form.getInputProps("versusMode")}
                        label={"Exclusion details"}
                        placeholder={"eg: POST ; show every packet that excludes POST"}
                    />
                    <Button type={"submit"} color="cyan">
                        Sniff
                    </Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Urlsnarf;
