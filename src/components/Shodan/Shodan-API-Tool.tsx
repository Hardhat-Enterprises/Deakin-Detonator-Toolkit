import { Button, Stack, TextInput, Select, Alert, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the Shodan API Tool component.
 */
interface FormValuesType {
    hostIP: string;
    shodanKey: string;
    endpoint: string;
    searchQuery: string;
}

/**
 * The Shodan API Tool component.
 * @returns The Shodan component.
 */
export function ShodanAPITool() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [loadingModal, setLoadingModal] = useState(true);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);

    // Tracks the user-facing execution state.
    const [executionStatus, setExecutionStatus] = useState<"idle" | "running" | "success" | "failed" | "cancelled">(
        "idle"
    );

    // Component Constants.
    const title = "Shodan API Tool";
    const description =
        "The Shodan API is a powerful tool that allows external network scans to be performed with use of a valid API key.";

    const steps =
        "How to use Shodan API:\n" +
        "Step 1: Obtain a valid API key by creating an account at https://account.shodan.io; once signed in, the API should be within the account's overview\n" +
        "Step 2: Enter the obtained API Key\n" +
        "Step 3: Select the desired Shodan API endpoint.\n" +
        "Step 4: Depending on the endpoint, enter a Host IP or a Search Query.\n" +
        "Step 5: Click Scan button to commence the Shodan API operation. Or click Cancel Scan to terminate scan\n" +
        "Step 6: View the Output block below to view the results of the tool's execution.\n" +
        "Step 7: Optional: to save scan results enter filename and click on the save output to file button";

    const sourceLink = "https://developer.shodan.io/api";
    const tutorial = "https://docs.google.com/document/d/1doC-ru2Ivvqx925en0SzU5E-ROQRufdi0MftiozhKgo/edit?usp=sharing";

    const dependencies = ["shodan"];

    // Form Hook to handle form input.
    const form = useForm<FormValuesType>({
        initialValues: {
            hostIP: "",
            shodanKey: "",
            endpoint: "",
            searchQuery: "",
        },
    });

    // Determine if the selected endpoint requires a search query.
    const requiresQuery = form.values.endpoint !== "host";

    // Determine if the selected endpoint requires an IP address.
    const requiresIP = form.values.endpoint === "host";

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
     * Callback to handle and append new data from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    /**
     * Handle process termination and update the execution status.
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

            setPid("");
            setLoading(false);
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    /**
     * Handle save completion.
     */
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * Handle form submission.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Reset previous execution state.
        setOutput("");
        setAllowSave(false);
        setExecutionStatus("running");
        setLoading(true);

        // Construct arguments based on selected endpoint.
        const args = [values.endpoint];

        if (requiresIP) {
            args.push(values.hostIP);
        }

        if (requiresQuery) {
            args.push(values.searchQuery);
        }

        try {
            // Initialise the Shodan CLI with the API key.
            CommandHelper.runCommand("shodan", values.shodanKey);

            const result = await CommandHelper.runCommandGetPidAndOutput(
                "shodan",
                args,
                handleProcessData,
                handleProcessTermination
            );

            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any) {
            setOutput(e.message);
            setExecutionStatus("failed");
            setLoading(false);
            setAllowSave(true);
        }
    };

    /**
     * Clear output and reset execution state.
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

            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid)}

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
                            {executionStatus === "running" && <Text>Running Shodan request...</Text>}

                            {executionStatus === "success" && <Text>Request completed successfully.</Text>}

                            {executionStatus === "failed" && <Text>Request failed.</Text>}

                            {executionStatus === "cancelled" && <Text>Request cancelled.</Text>}
                        </Alert>
                    )}

                    <TextInput label="Valid API Key" required {...form.getInputProps("shodanKey")} />

                    <Select
                        label="Select Shodan API Endpoint"
                        placeholder="Choose endpoint"
                        data={[
                            { value: "host", label: "host" },
                            { value: "count", label: "count" },
                            { value: "search", label: "search" },
                        ]}
                        required
                        {...form.getInputProps("endpoint")}
                    />

                    {requiresIP && <TextInput label="Host IP" required {...form.getInputProps("hostIP")} />}

                    {requiresQuery && (
                        <TextInput label="Search Query" required {...form.getInputProps("searchQuery")} />
                    )}

                    <Button type="submit" disabled={loading}>
                        Scan
                    </Button>

                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}

                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}
