import { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Stack, Alert, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import InstallationModal from "../InstallationModal/InstallationModal";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";

// Form type definition
interface FormValuesType {
    target: string;
}

// Component
function Nuclei() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    const [executionStatus, setExecutionStatus] = useState<"idle" | "running" | "success" | "failed" | "cancelled">(
        "idle"
    );

    const title = "Nuclei";
    const description = "Nuclei is a fast and customizable vulnerability scanner based on simple YAML-based templates.";
    const tutorial = "https://docs.google.com/document/d/1Blzt6KZLcI1J0CtPu6cZwU_P3HgEaRe1RQ1E-okEGTY/edit?usp=sharing";
    const sourceLink = "https://github.com/projectdiscovery/nuclei";
    const dependencies = ["nuclei"];

    const form = useForm<FormValuesType>({
        initialValues: {
            target: "",
        },
    });

    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable);
                setOpened(!isAvailable);
                setLoadingModal(false);
            })
            .catch((error) => {
                console.error("Error checking dependencies:", error);
                setLoadingModal(false);
            });
    }, []);

    const handleProcessData = useCallback((data: string) => {
        setOutput((prev) => prev + "\n" + data);
    }, []);

    const handleProcessTermination = useCallback(({ code, signal }: { code: number; signal: number }) => {
        if (signal === 15) {
            setOutput((prev) => prev + "\nProcess was manually terminated.");
            setExecutionStatus("cancelled");
        } else if (code === 0) {
            setExecutionStatus("success");
        } else {
            setOutput((prev) => prev + `\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            setExecutionStatus("failed");
        }

        setPid("");
        setLoading(false);
        setAllowSave(true);
        setHasSaved(false);
    }, []);

    const clearOutput = useCallback(() => {
        setOutput("");
        setExecutionStatus("idle");
        setAllowSave(false);
        setHasSaved(false);
    }, []);

    const onSubmit = async () => {
        setOutput("");
        setAllowSave(false);
        setExecutionStatus("running");
        setLoading(true);
        const args = [
            "-u",
            form.values.target,
            "-c",
            "150",
            "-rl",
            "300",
            "-timeout",
            "3",
            "-retries",
            "0",
            "mhe",
            "10",
            "-hm",
            "-it",
            "5",
            "et",
            "fuzz,headless,dos",
        ];

        try {
            const { pid, output } = await CommandHelper.runCommandGetPidAndOutput(
                "nuclei",
                args,
                handleProcessData,
                handleProcessTermination
            );

            setPid(pid);
            setOutput(output);
        } catch (error: any) {
            setOutput(`Error: ${error.message}`);
            setExecutionStatus("failed");
            setLoading(false);
            setAllowSave(true);
        }
    };

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    return (
        <RenderComponent
            title={title}
            description={description}
            steps={"1. Enter target URL.\n2. Run scan."}
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

            {LoadingOverlayAndCancelButton(loading, pid)}

            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
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
                            {executionStatus === "running" && <Text>Running Nuclei scan...</Text>}

                            {executionStatus === "success" && <Text>Scan completed successfully.</Text>}

                            {executionStatus === "failed" && <Text>Scan failed.</Text>}

                            {executionStatus === "cancelled" && <Text>Scan cancelled.</Text>}
                        </Alert>
                    )}

                    <TextInput
                        label="Target URL"
                        placeholder="https://example.com"
                        required
                        {...form.getInputProps("target")}
                    />

                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}

                    <Button type="submit" disabled={loading}>
                        Run Nuclei
                    </Button>

                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}

export default Nuclei;
