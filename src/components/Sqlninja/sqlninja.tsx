import { Alert, Button, Loader, NativeSelect, Stack, Switch, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useEffect, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the Sqlninja component.
 */
interface FormValuesType {
    filePath: string;
    mode: string;
    verbose: boolean;
}

/**
 * Represents the user-facing execution state.
 */
type ExecutionStatus = "idle" | "running" | "success" | "failed" | "cancelled";

/**
 * The Sqlninja component.
 * @returns The Sqlninja component.
 */
function Sqlninja() {
    // Component State Variables
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [selectedMode, setSelectedMode] = useState("test");
    const [checkedVerbose, setCheckedVerbose] = useState(false);

    // User-facing execution status.
    const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>("idle");

    // Component Constants.
    const title = "Sqlninja";

    const description =
        "Exploit SQL injection vulnerabilities on web applications that use Microsoft SQL Server as back end.";

    const steps =
        "Step 1: Select which Attack mode to use.\n" +
        "Step 2: Enter the file path for sqlninja configuration file, if no file path is input default sqlninja.conf is used.\n" +
        "Step 3: Select if you want verbose output.\n" +
        "Step 4: Click on the Start button to initiate sqlninja.";

    const sourceLink = "https://www.kali.org/tools/sqlninja/";

    const tutorial = "https://docs.google.com/document/d/1EaiwnltxhPL5TenUhU-ux9-WzP85BP7dLMfGNNv5ns8/edit?usp=sharing";

    const dependencies = ["sqlninja"];

    const attackMode = ["test", "escalation", "upload", "backscan"];

    // Form hook to handle form input.
    const form = useForm<FormValuesType>({
        initialValues: {
            filePath: "",
            mode: "",
            verbose: false,
        },
    });

    /**
     * Check if the required command is available.
     */
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
     * Handles and appends data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    /**
     * Handles process termination and updates the user-facing status.
     */
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
                setExecutionStatus("cancelled");
            } else if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
                setExecutionStatus("success");
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
                setExecutionStatus("failed");
            }

            // Process has ended, so remove the PID.
            setPid("");

            // Stop the loading state.
            setLoading(false);

            // Output is now final and can be saved.
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    /**
     * Actions taken after saving the output.
     */
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * Expand the home directory symbol (~).
     */
    function expandHomeDir(path: string) {
        if (path.startsWith("~")) {
            return path.replace("~", "/home/kali");
        }

        return path;
    }

    /**
     * Handles form submission.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Clear previous output/status.
        setOutput("");
        setExecutionStatus("running");

        // Activate loading state.
        setLoading(true);

        // Reset save state while the process is running.
        setAllowSave(false);
        setHasSaved(false);

        // Construct arguments.
        const args: string[] = [];

        if (selectedMode) {
            args.push("-m", selectedMode);
        }

        if (values.filePath) {
            args.push("-f", expandHomeDir(values.filePath));
        }

        if (checkedVerbose) {
            args.push("-v");
        }

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "sqlninja",
                args,
                handleProcessData,
                handleProcessTermination
            );

            setPid(result.pid);
            setOutput(result.output);
        } catch (error: unknown) {
            if (error instanceof Error) {
                setOutput(`Error: ${error.message}`);
            } else {
                setOutput("An unknown error occurred.");
            }

            setExecutionStatus("failed");
            setLoading(false);
            setPid("");
            setAllowSave(true);
            setHasSaved(false);
        }
    };

    /**
     * Clears the console output and resets the execution status.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setExecutionStatus("idle");
        setHasSaved(false);
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
                />
            )}

            <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                <Stack>
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, "", handleProcessData, handleProcessTermination)}

                    {executionStatus !== "idle" && (
                        <Alert
                            color={
                                executionStatus === "running"
                                    ? "blue"
                                    : executionStatus === "success"
                                    ? "green"
                                    : executionStatus === "cancelled"
                                    ? "gray"
                                    : "red"
                            }
                            radius="md"
                        >
                            {executionStatus === "running" && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                    }}
                                >
                                    <Loader size="sm" />
                                    <Text>Running...</Text>
                                </div>
                            )}

                            {executionStatus === "success" && <Text>Process completed successfully.</Text>}

                            {executionStatus === "failed" && <Text>Process failed.</Text>}

                            {executionStatus === "cancelled" && <Text>Process cancelled.</Text>}
                        </Alert>
                    )}

                    <NativeSelect
                        label="Attack Mode"
                        value={selectedMode}
                        onChange={(event) => setSelectedMode(event.currentTarget.value)}
                        data={attackMode}
                        description="Please select attack mode"
                        required
                    />

                    <TextInput
                        label="Configuration File Path"
                        placeholder="default: sqlninja.conf"
                        {...form.getInputProps("filePath")}
                    />

                    <Switch
                        label="Verbose Mode"
                        checked={checkedVerbose}
                        onChange={(event) => setCheckedVerbose(event.currentTarget.checked)}
                    />

                    <Button type="submit" disabled={loading}>
                        Start {title}
                    </Button>

                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}

                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}

export default Sqlninja;
