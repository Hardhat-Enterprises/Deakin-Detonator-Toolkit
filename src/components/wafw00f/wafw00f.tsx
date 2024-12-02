import { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Stack } from "@mantine/core";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import InstallationModal from "../InstallationModal/InstallationModal";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { RenderComponent } from "../UserGuide/UserGuide";
import { useForm } from "@mantine/form";

const Wafw00f = () => {
    const title = "WafW00f";
    const description = "A tool to identify and fingerprint Web Application Firewalls (WAFs).";
    const steps =
        "Step 1: Enter the target URL.\n" +
        "Step 2: Click 'Run WafW00f' to execute.\n" +
        "Step 3: View the results in the output section.";
    const sourceLink = "https://github.com/EnableSecurity/wafw00f";
    const dependencies = ["wafw00f"];

    // State variables
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(false);
    const [loadingModal, setLoadingModal] = useState(true);

    // Form handler
    const form = useForm({
        initialValues: {
            targetUrl: "",
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
                console.error("Error checking command availability:", error);
                setLoadingModal(false);
            });
    }, []);

    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }
            setPid("");
            setLoading(false);
            setAllowSave(true);
        },
        [handleProcessData]
    );

    const onSubmit = async (values: { targetUrl: string }) => {
        if (!values.targetUrl) {
            setOutput("Error: Please enter a valid URL.");
            return;
        }

        setAllowSave(false);
        setLoading(true);

        const args = [values.targetUrl];

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "wafw00f",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(result.pid);
            setOutput(result.output);
        } catch (error: any) {
            setOutput(error.message || "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setAllowSave(false);
        setHasSaved(false);
    }, []);

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    return (
        <RenderComponent title={title} description={description} steps={steps} sourceLink={sourceLink}>
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
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, handleProcessData, handleProcessTermination)}
                    <TextInput
                        label="Target URL"
                        placeholder="Enter target URL (e.g., https://example.com)"
                        required
                        {...form.getInputProps("targetUrl")}
                    />
                    {/* Removed the 'disabled' attribute from the button */}
                    <Button type="submit">Run {title}</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Wafw00f;
