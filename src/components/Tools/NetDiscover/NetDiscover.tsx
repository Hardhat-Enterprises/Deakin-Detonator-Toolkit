import { useState, useCallback, useEffect, useRef } from "react";
import { Button, Stack, TextInput, Alert, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../../utils/CommandHelper";
import ConsoleWrapper from "../../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../../SaveOutputToFile/SaveOutputToTextFile";
import { checkAllCommandsAvailability } from "../../../utils/CommandAvailability";
import InstallationModal from "../../InstallationModal/InstallationModal";
import { RenderComponent } from "../../UserGuide/UserGuide";

interface FormValuesType {
    interface: string;
}

function NetDiscover() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [opened, setOpened] = useState(false);
    const [loadingModal, setLoadingModal] = useState(true);

    const processRef = useRef<any>(null);

    const form = useForm<FormValuesType>({
        initialValues: { interface: "" },
    });

    useEffect(() => {
        checkAllCommandsAvailability(["netdiscover"])
            .then((available) => setOpened(!available))
            .finally(() => setLoadingModal(false));
    }, []);

    const handleProcessData = useCallback((data: string) => {
        // Removes ANSI escape codes and unnecessary characters
        const cleanedData = data.replace(
            // Regex to remove ANSI escape sequences
            /\x1B\[[0-9;]*[a-zA-Z]/g,
            ""
        );

        // Prevent output of empty lines or random characters
        if (cleanedData.trim() !== "") {
            setOutput((prev) => prev + "\n" + cleanedData.trim());
        }
    }, []);

    const handleProcessTermination = useCallback(({ code, signal }: { code: number; signal: number }) => {
        setOutput(
            (prev) => prev + (signal === 2 ? "\nScanning stopped manually." : `\nNetDiscover exited (code ${code}).`)
        );
        setLoading(false);
        setAllowSave(true);
        processRef.current = null;
    }, []);

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);
        setOutput("");

        const args = ["-i", values.interface];

        processRef.current = await CommandHelper.runCommandWithPkexec(
            "netdiscover",
            args,
            handleProcessData,
            handleProcessTermination
        ).catch((error) => {
            setOutput(`Error: ${error.message}`);
            setLoading(false);
            setAllowSave(true);
        });
    };

    const cancelScan = async () => {
        if (processRef.current) {
            await CommandHelper.runCommand("pkexec", ["kill", "-9", processRef.current.pid])
                .then(() => setOutput((prev) => prev + `\nScanning manually stopped (PID: ${processRef.current.pid}).`))
                .catch((error: any) => setOutput((prev) => prev + `\nError stopping scan: ${error.message}`))
                .finally(() => {
                    setLoading(false);
                    setAllowSave(true);
                    processRef.current = null;
                });
        } else {
            setOutput((prev) => prev + `\nNo active scanning process to stop.`);
            setLoading(false);
        }
    };

    const clearOutput = () => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    };

    return (
        <>
            <RenderComponent
                title="NetDiscover Tool"
                description="NetDiscover identifies live hosts using ARP requests."
                steps={
                    "Step 1: Enter your network interface name (e.g., eth0, wlan0).\n" +
                    "Step 2: Click 'Start Scan' to begin scanning the network.\n" +
                    "Step 3: Wait for hosts to appear in the output.\n" +
                    "Step 4: Click 'Stop Scanning' when you've collected enough information. "
                }
                tutorial="https://docs.google.com/document/d/1lREkzt3XvG6iIaxcpiMjSKxQUFGR8uKUg0PESz5DqfM/edit"
                sourceLink="https://tools.kali.org/information-gathering/netdiscover"
            >
                {!loadingModal && (
                    <InstallationModal
                        isOpen={opened}
                        setOpened={setOpened}
                        feature_description="NetDiscover"
                        dependencies={["netdiscover"]}
                    />
                )}
                <form onSubmit={form.onSubmit(onSubmit)}>
                    <Stack spacing="md">
                        <TextInput label="Network Interface" required {...form.getInputProps("interface")} />

                        <Group>
                            <Button type="submit" disabled={loading}>
                                Start Scan
                            </Button>
                            <Button variant="outline" color="red" disabled={!loading} onClick={cancelScan}>
                                Stop Scanning
                            </Button>
                        </Group>

                        {loading && <Alert radius="md">Scanning on interface: {form.values.interface}</Alert>}

                        <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />

                        {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    </Stack>
                </form>
            </RenderComponent>
        </>
    );
}

export default NetDiscover;
