import { useState, useEffect, useCallback } from "react";
import { Button, Checkbox, Stack, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

/**
 * Represents the form values for the Whois component.
 */
interface FormValuesType {
    targetURL: string;
}

/**
 * The Whois component.
 * @returns The Whois component.
 */
function Whois() {
    // Component state variables
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [parsedData, setParsedData] = useState<{
        registrar?: string;
        expiry?: string;
        status?: string;
        errorMessage?: string;
    }>({});
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [pid, setPid] = useState("");

    // Component Constants
    const title = "Whois";
    const description =
        "Whois is a query and response protocol that is used for querying databases that store an internet resource's registered users or assignees.";
    const steps =
        "Step 1: Provide the target URL or IP address to scan.\n" +
        "Step 2: Start the scan to gather information about potential vulnerabilities and misconfigurations.\n" +
        "Step 3: Review the scan output to identify any security issues.\n";
    const sourceLink = "https://github.com/weppos/whois";
    const tutorial = "https://docs.google.com/document/d/1n-QxEXGDOdOlYZ13OGQPV7QdnOEsJF4vPtObGy0vYbs/edit?usp=sharing";
    const dependencies = ["whois"];

    let form = useForm({
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
                console.error("An error occurred:", error);
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
        },
        [handleProcessData]
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
                setLoading(false);
            });
    };

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    const clearOutput = () => {
        setOutput("");
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
                    <Button type={"submit"}>Start {title}</Button>
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
                            try {
                                console.log("export JSON clicked!", parsedData);
                                const blob = new Blob([JSON.stringify(parsedData, null, 2)], {
                                    type: "application/json",
                                });
                                const link = document.createElement("a");
                                link.href = URL.createObjectURL(blob);
                                link.download = "whois_parsed_data.json";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);

                                showNotification({
                                    title: "Success",
                                    message: "JSON exported successfully!",
                                    color: "green",
                                    icon: <IconCheck size="1.1rem" />,
                                });
                            } catch (err) {
                                showNotification({
                                    title: "Error",
                                    message: "Failed to export JSON.",
                                    color: "red",
                                    icon: <IconX size="1.1rem" />,
                                });
                            }
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
