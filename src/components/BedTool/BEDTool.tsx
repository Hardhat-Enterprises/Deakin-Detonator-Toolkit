import { Button, Select, Stack, Switch, TextInput, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect, useRef } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapperWithBuiltinOverlay";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the BEDTool component.
 */
interface FormValuesType {
    plugin: string;
    target: string;
    port: string;
    email: string;
    username: string;
    password: string;
}

/**
 * The BEDTool component.
 * @returns The BEDTool component.
 */
export function BEDTool() {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [selectedPlugin, setSelectedPlugin] = useState(""); // State variable to store the selected plugin.
    const [allowSave, setAllowSave] = useState(false); // State variable boolean to indicate save state.
    const [hasSaved, setHasSaved] = useState(false); // State variable boolean to indicate if the save has been saved.
    const [customConfig, setCustomConfig] = useState(false); // State variable to toggle custom configuration.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.
    const [showAlert, setShowAlert] = useState(true);
    const alertTimeout = useRef<NodeJS.Timeout | null>(null);

    // Component Constants.
    const title = "BEDTool"; // Title of the component.
    const description =
        "BED (Bruteforce Exploit Detector) is a sophisticated tool designed to check network services for a range of security vulnerabilities including buffer overflows and format string weaknesses."; // Description of the component.
    const steps =
        '1. Select a Service: Choose the service to test from the dropdown menu, for instance, "HTTP" to test a web server.\n' +
        '2. Input Required Fields: Fill in the fields that appear based on the selected service. For example, choosing "FTP" will prompt for additional required fields, such as username and password.\n' +
        "3. Custom Configuration (Optional): Activate 'Custom Configuration' to enter a specific target IP address and port number. If this is not enabled, the tool will default to scanning the local machine.\n" +
        "4. Start Scan: Click the 'Scan' button to begin the evaluation.";
    const sourceLink = "https://www.kali.org/tools/bed/"; // Link to the source documentation.
    const tutorial = "https://docs.google.com/document/d/1BPzqMP5b9C9OjsJuIKXfxPyMxDd6oqUhrTvwi29fOKo/edit?usp=sharing"; // Link to the official documentation/tutorial.
    const dependencies = ["bed"]; // Contains the dependencies required by the component.

    // Plugin-related constants
    const pluginList = ["FTP", "SMTP", "POP", "HTTP", "IRC", "IMAP", "PJL", "LPD", "FINGER", "SOCKS4"];
    const pluginsRequiringAuth = ["FTP", "IMAP", "POP"];
    const pluginRequiringEmail = ["SMTP"];
    const pluginsRequiringUsername = ["SOCKS4"];

    // Form hook to handle form input.
    const form = useForm<FormValuesType>({
        initialValues: {
            plugin: "",
            target: "",
            port: "",
            email: "",
            username: "",
            password: "",
        },
        validate: {
            username: (value, values) => {
                if (pluginsRequiringAuth.includes(values.plugin) || pluginsRequiringUsername.includes(values.plugin)) {
                    return /^[a-zA-Z0-9_]+$/.test(value) ? null : "Invalid username";
                }
                return null;
            },
            password: (value, values) => {
                if (pluginsRequiringAuth.includes(values.plugin)) {
                    return value.length >= 8 ? null : "Password must be at least 8 characters";
                }
                return null;
            },
            email: (value, values) => {
                if (values.plugin === "SMTP") {
                    return /^\S+@\S+\.\S+$/.test(value) ? null : "Invalid email";
                }
                return null;
            },
        },
    });

    // Check if the command is available and set the state variables accordingly.
    useEffect(() => {
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
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }
            setPid(""); // Clear the child process pid reference.
            setLoading(false); // Cancel the loading overlay.
            setAllowSave(true); // Allow Saving as the output is finalised.
            setHasSaved(false);
        },
        [handleProcessData]
    );

    /**
     * Function to handle completion of saving output to a text file.
     * Sets the hasSaved flag to true and disallows further saving.
     */
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Handler function that is triggered when the form is submitted.
     * It prepares the arguments and initiates the execution of the `bed` command.
     * @param {FormValuesType} values - An object containing the form input values.
     */
    const onSubmit = (values: FormValuesType) => {
        setAllowSave(false);
        setLoading(true);

        const baseArgs = ["-s", values.plugin];
        const conditionalArgs: string[][] = [
            customConfig ? ["-t", values.target, "-p", values.port] : [],
            pluginsRequiringAuth.includes(selectedPlugin) || selectedPlugin === "SMTP"
                ? ["-u", selectedPlugin === "SMTP" ? values.email : values.username]
                : [],
            pluginsRequiringAuth.includes(selectedPlugin) ? ["-v", values.password] : [],
        ];

        const args = baseArgs.concat(conditionalArgs.filter(Boolean).flat());

        CommandHelper.runCommandGetPidAndOutput("bed", args, handleProcessData, handleProcessTermination)
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
     * Function to clear output and reset save status.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    /**
     * Handler for selecting a service plugin from the dropdown menu.
     * @param {string} value - The selected plugin's value.
     */
    const handlePluginChange = (value: string) => {
        form.setFieldValue("plugin", value);
        setSelectedPlugin(value);
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
            <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid)}

                    {showAlert && (
                        <Alert title="Warning: Potential Risks" color="red">
                            This tool is used to perform vulnerability scans, use with caution and only on networks you own or have explicit permission to test.
                        </Alert>
                    )}

                    {!showAlert && (
                        <Button onClick={handleShowAlert}>Show Alert</Button>
                    )}

                    <Switch
                        size="md"
                        label="Manual Network Configuration"
                        checked={customConfig}
                        onChange={(e) => setCustomConfig(e.currentTarget.checked)}
                    />
                    <Select
                        label="Plugin Type"
                        placeholder="Select a plugin to test"
                        data={pluginList}
                        required
                        value={selectedPlugin}
                        onChange={handlePluginChange}
                    />
                    {pluginsRequiringAuth.includes(selectedPlugin) && (
                        <>
                            <TextInput
                                label="Username (default user is the same as your Kali Linux login)"
                                required
                                {...form.getInputProps("username")}
                            />
                            <TextInput label="Password" type="password" required {...form.getInputProps("password")} />
                        </>
                    )}
                    {pluginsRequiringUsername.includes(selectedPlugin) && (
                        <TextInput label={"username"} required {...form.getInputProps("username")} />
                    )}
                    {pluginRequiringEmail.includes(selectedPlugin) && (
                        <TextInput label="Email Address" required {...form.getInputProps("email")} />
                    )}
                    {customConfig && (
                        <>
                            <TextInput
                                label="Custom IP Address (default: localhost)"
                                required
                                {...form.getInputProps("target")}
                            />
                            <TextInput
                                label="Port Number (default: service-specific standard port)"
                                required
                                {...form.getInputProps("port")}
                            />
                        </>
                    )}
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type={"submit"}>Scan</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} pid={pid} loading={loading} />
                </Stack>
            </form>
        </RenderComponent>
    );
}

export default BEDTool;