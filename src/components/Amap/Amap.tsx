import { Button, Stack, TextInput, Alert, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect, useRef } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import AskChatGPT from "../AskChatGPT/AskChatGPT";
import ChatGPTOutput from "../AskChatGPT/ChatGPTOutput";
import AskCohere from "../AskCohere/AskCohere";
import CohereOutput from "../AskCohere/CohereOutput";

/**
 * Represents the form values for the AMAP component.
 */
interface FormValuesType {
    target: string;
    port: string;
    options: string;
    connectionTimeout: string;
    responseTimeout: string;
}

/**
 * The AMAP component.
 * @returns The AMAP component.
 */
const AMAP = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [chatGPTResponse, setChatGPTResponse] = useState(""); //ChatGPT response
    const [cohereResponse, setCohereResponse] = useState(""); // Cohere response
    const [showAlert, setShowAlert] = useState(true); // Initial state is true
    const alertTimeout = useRef<NodeJS.Timeout | null>(null);

    // Component Constants.
    const title = "AMAP"; // Title of the component.
    const description =
        "AMAP is a tool for application protocol detection and service fingerprinting. " +
        "Application protocol detection identifies the type of communication protocol used by a service, " + // Description of the component.
        "while service fingerprinting pinpoints the specific application and version running on a host. " + // Define the main functional component for the AMAP tool.
        "These processes help in understanding what services are active on a network and assessing potential vulnerabilities."; // This component handles the configuration, execution, and result display of the AMAP command-line tool.
    const steps =
        "Step 1: Enter the target host to scan.\n" +
        "Step 2: Specify the port(s) to scan.\n" +
        "Step 3: Enter connection or response timeout settings (optional). E.g-> '-A','-v' or '-o'\n" +
        "Step 4: Click 'Start Scan' to begin the process.\n" +
        "Step 5: View the output block to see the results. ";
    const sourceLink = "https://www.kali.org/tools/amap/"; // Link to the source code (or AMAP documentation).
    const tutorial = "https://docs.google.com/document/d/1jDsVS14S8DxTF_h6aMyUCGZ6KNBKTYYLRWN-rZySAUk/edit?usp=sharing"; // Link to the official documentation/tutorial.
    const dependencies = ["amap"]; // Contains the dependencies required by the component.

    // Form hook to handle form input.
    const form = useForm({
        initialValues: {
            target: "",
            port: "",
            options: "",
            connectionTimeout: "10",
            responseTimeout: "10",
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
                setLoadingModal(false);
            });

        // Set timeout to remove alert after 5 seconds on load.
        alertTimeout.current = setTimeout(() => {
            setShowAlert(false);
        }, 5000);

        return () => {
            if (alertTimeout.current) {
                clearTimeout(alertTimeout.current);
            }
        };
    }, []);

    const handleShowAlert = () => {
        setShowAlert(true);
        if (alertTimeout.current) {
            clearTimeout(alertTimeout.current);
        }
        alertTimeout.current = setTimeout(() => {
            setShowAlert(false);
        }, 5000);
    };

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
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the amap tool with the given parameters.
     * Once the command is executed, the results or errors are displayed in the output.
     *
     * @param {FormValuesType} values - The form values, containing the target host, port(s), and additional options.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Activate loading state to indicate ongoing process
        setLoading(true);

        // Construct arguments for the amap command based on form input
        const args = [
            values.target,
            "-bqv",
            values.port,
            `-T ${values.connectionTimeout}`,
            `-t ${values.responseTimeout}`,
        ];

        // Execute the amap command via helper method and handle its output or potential errors
        CommandHelper.runCommandGetPidAndOutput("amap", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
                // Update the UI with the results from the executed command
                setOutput(output);
                console.log(pid);
                setPid(pid);
            })
            .catch((error) => {
                // Display any errors encountered during command execution
                setOutput(error.message);
                // Deactivate loading state
                setLoading(false);
            });
    };

    /**
     * Clears the output state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
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
                    <Group position="right">
                    {!showAlert && <Button onClick={handleShowAlert} size="xs" variant="outline" color="gray">Show Disclaimer</Button>}
                    </Group>
                    {LoadingOverlayAndCancelButton(loading, pid)}

                    {showAlert && (
                        <Alert title="Warning: Potential Risks" color="red">
                            This tool is used to scan ports, use with caution and only on networks you own or have
                            explicit permission to test.
                        </Alert>
                    )}

                    <TextInput label={"Target Host"} required {...form.getInputProps("target")} />
                    <TextInput label={"Port(s)"} required {...form.getInputProps("port")} />
                    <TextInput
                        label={"Connection Timeout (seconds)"}
                        required
                        {...form.getInputProps("connectionTimeout")}
                    />
                    <TextInput
                        label={"Response Timeout (seconds)"}
                        required
                        {...form.getInputProps("responseTimeout")}
                    />
                    {SaveOutputToTextFile(output)}
                    <Button type={"submit"}>Start Scan</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                    <AskChatGPT toolName={title} output={output} setChatGPTResponse={setChatGPTResponse} />
                    {chatGPTResponse && (
                        <div style={{ marginTop: "20px" }}>
                            <h3>ChatGPT Response:</h3>
                            <ChatGPTOutput output={chatGPTResponse} />
                        </div>
                    )}
                    <AskCohere toolName={title} output={output} setCohereResponse={setCohereResponse} />
                    {cohereResponse && (
                        <div style={{ marginTop: "20px" }}>
                            <h3>Cohere Response:</h3>
                            <CohereOutput output={cohereResponse} />
                        </div>
                    )}
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default AMAP;
