import { useState, useEffect, useCallback } from "react";
import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

interface FormValuesType {
    targetURL: string;
}

function Whois() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [pid, setPid] = useState("");
    const [parsedData, setParsedData] = useState<{
        registrar?: string;
        expiry?: string;
        status?: string;
        errorMessage?: string;
    }>({});

    const title = "Whois";
    const description = "Whois is a query and response protocol...";
    const steps = "Step 1: Provide the target URL...\nStep 2...\nStep 3...";
    const sourceLink = "https://github.com/weppos/whois";
    const tutorial = "https://docs.google.com/..."; // Keep your full link
    const dependencies = ["whois"];

    const form = useForm({
        initialValues: {
            targetURL: "",
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
                console.error("Error checking command:", error);
                setLoadingModal(false);
            });
    }, []);

    const handleProcessData = useCallback((data: string) => {
        setOutput((prev) => prev + "\n" + data);
    }, []);

    function parseWhoisData(raw: string) {
        const lines = raw.split("\n");
        const parsed: { registrar?: string; expiry?: string; status?: string } = {};
        for (const line of lines) {
            if (line.toLowerCase().includes("registrar:")) {
                parsed.registrar = line.split(":")[1]?.trim();
            }
            if (line.toLowerCase().includes("expiry") || line.toLowerCase().includes("expiration")) {
                parsed.expiry = line.split(":")[1]?.trim();
            }
            if (line.toLowerCase().includes("status:")) {
                parsed.status = line.split(":")[1]?.trim();
            }
        }
        return parsed;
    }

    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                const parsed = parseWhoisData(output);
                setParsedData(parsed);
                handleProcessData("\nProcess completed successfully.");
            } else {
                handleProcessData(
                    signal === 15
                        ? "\nProcess was manually terminated."
                        : `\nProcess terminated with exit code: ${code} and signal code: ${signal}`
                );
                setParsedData({});
            }
            setPid("");
            setLoading(false);
        },
        [handleProcessData, output]
    );

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = [values.targetURL];

        CommandHelper.runCommandGetPidAndOutput("whois", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
                setOutput(output);
                setPid(pid);
            })
            .catch((error) => {
                setOutput(error.message);
                setParsedData({ errorMessage: error.message });
                setLoading(false);
            });
    };

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    const clearOutput = () => {
        setOutput("");
        setParsedData({});
        setHasSaved(false);
        setAllowSave(false);
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
                />
            )}

            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <TextInput label="Target URL" required {...form.getInputProps("targetURL")} />

                    {parsedData.registrar && <TextInput label="Registrar" value={parsedData.registrar} readOnly />}
                    {parsedData.expiry && <TextInput label="Expiry Date" value={parsedData.expiry} readOnly />}
                    {parsedData.status && <TextInput label="Status" value={parsedData.status} readOnly />}

                    <Button type="submit">Start {title}</Button>

                    <Button
                        type="button"
                        disabled={
                            !parsedData ||
                            (!parsedData.registrar &&
                                !parsedData.expiry &&
                                !parsedData.status &&
                                !parsedData.errorMessage)
                        }
                        onClick={() => {
                            console.log("Export JSON clicked!", parsedData);
                            const blob = new Blob([JSON.stringify(parsedData, null, 2)], {
                                type: "application/json",
                            });
                            const link = document.createElement("a");
                            link.href = URL.createObjectURL(blob);
                            link.download = "whois_parsed_data.json";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                    >
                        Export JSON
                    </Button>

                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}

export default Whois;
