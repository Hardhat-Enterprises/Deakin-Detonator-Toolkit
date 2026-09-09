import { Button, Stack, TextInput, Checkbox, Text, Paper, List } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";

interface FormValuesType {
    url: string;
    showOnly200: boolean; // New field for -o flag
}

const Parsero = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);

    const title = "Parsero";
    const description =
        "Parsero is a free script written in Python which reads the Robots.txt file of a web server and looks at the Disallow entries. " +
        "The Disallow entries tell the search engines what directories or files hosted on a web server must not be indexed. " +
        "Parsero then checks whether those disallowed paths are still directly accessible.";
    const steps =
        "Step 1: Enter a plain hostname (e.g. www.google.com). Do not include http:// or https://.\n" +
        "Step 2: Optionally check 'Show only URLs with HTTP 200 status code' to filter results.\n" +
        "Step 3: Click Start Parsero and wait for the scan to finish (this can take 1-2 minutes).\n" +
        "Step 4: Review the results using the 'Understanding the results' panel above the console, which explains status codes and what 'available' means.";
    const sourceLink = "https://www.kali.org/tools/parsero/";
    const tutorial = "https://docs.google.com/document/d/1VxbjDGxRu-36WckaLlF7fWI_r_O6Ez2EbEnCdZfXXkA/edit?usp=sharing";
    const dependencies = ["parsero"];

    const validateHostname = (hostname: string) => {
        const hostnamePattern =
            /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
        return hostnamePattern.test(hostname);
    };

    const form = useForm<FormValuesType>({
        initialValues: {
            url: "",
            showOnly200: false, // Default value
        },
        validateInputOnBlur: true,
        validate: {
            url: (value) => {
                if (value.trim().length === 0) return "URL is required";
                if (!validateHostname(value.trim())) {
                    return "Invalid format. Use a plain hostname (e.g. www.google.com), no http:// or https://";
                }
                return null;
            },
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
        setAllowSave(true);
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

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    const onSubmit = async (values: FormValuesType) => {
        setAllowSave(false);
        setLoading(true);

        const args = ["-u", values.url];

        if (values.showOnly200) {
            args.push("-o");
        }

        CommandHelper.runCommandGetPidAndOutput("parsero", args, handleProcessData, handleProcessTermination)
            .then(({ pid, output }) => {
                setPid(pid);
                setOutput(output);
            })
            .catch((error) => {
                setLoading(false);
                setOutput(`Error: ${error.message}`);
            });
    };

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
                />
            )}
            <form onSubmit={form.onSubmit(onSubmit)}>
                {LoadingOverlayAndCancelButton(loading, pid)}
                <Stack>
                    <TextInput label={"URL"} placeholder="www.google.com" required {...form.getInputProps("url")} />
                    <Text size="xs" c="dimmed">
                        Note: "google.com" and "www.google.com" may return different results, since they can be treated
                        as separate hosts.
                    </Text>
                    <Checkbox
                        label={"Show only URLs with HTTP 200 status code"}
                        {...form.getInputProps("showOnly200", { type: "checkbox" })}
                    />
                    <Button type={"submit"} disabled={!form.isValid()}>
                        Start {title}
                    </Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Paper withBorder p="sm">
                        <Text fw={700} size="sm" mb={5}>
                            Understanding the results
                        </Text>
                        <Text size="xs" c="dimmed" mb={5}>
                            "Available" means the URL was listed as Disallowed in robots.txt, but still returned an HTTP
                            200 status, meaning it can still be accessed directly.
                        </Text>
                        <List size="xs" spacing={2}>
                            <List.Item>
                                <b>200</b> – OK: the page is accessible.
                            </List.Item>
                            <List.Item>
                                <b>301 / 302</b> – Redirected: the page has moved to another URL.
                            </List.Item>
                            <List.Item>
                                <b>403</b> – Forbidden: access to the page is blocked.
                            </List.Item>
                            <List.Item>
                                <b>404</b> – Not Found: the page does not exist.
                            </List.Item>
                        </List>
                    </Paper>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Parsero;
