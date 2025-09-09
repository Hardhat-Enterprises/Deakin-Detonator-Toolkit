import { Button, Stack, TextInput, Alert, Group, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect, useRef } from "react";
import { showNotification } from "@mantine/notifications";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import AskChatGPT from "../AskChatGPT/AskChatGPT";
import ChatGPTOutput from "../AskChatGPT/ChatGPTOutput";

/**
 * Represents the form values for the Amass component.
 */
interface FormValuesType {
    domain: string;
}

export function Amass() {
    // Component State Variables.
    const [loading, setLoading] = useState(false);
    const [pid, setPid] = useState("");
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [chatGPTResponse, setChatGPTResponse] = useState("");
    const [showAlert, setShowAlert] = useState(true);
    const alertTimeout = useRef<NodeJS.Timeout | null>(null);

    // Component Constants.
    const title = "Amass";
    const description =
        "Amass is an open source network mapping and attack surface discovery tool that uses information gathering and other techniques to create maps of network infrastructures.";
    const steps =
        "Step 1: Enter a domain name, e.g. example.com.\n" +
        "Step 2: Click 'Start " +
        title +
        "' to start the enumeration.\n" +
        "Step 3: View the Output block below to see the results of the scan.";
    const sourceLink = "https://www.kali.org/tools/amass/";
    const tutorial = "https://docs.google.com/document/d/1t7YrU1qMx9agtTsxorAkk__OZ88UIq9V4M3CVkDqmxE/edit?usp=sharing";
    const dependencies = ["amass"];

    // Pattern implemented for validation process.
    const domainPatternString = "^(?!-)(?:[a-zA-Z0-9-]{1,63}\\.)+[a-zA-Z]{2,}$";
    const domainRegex = new RegExp(domainPatternString);

    // Form hook to handle form input with validation.
    let form = useForm<FormValuesType>({
        initialValues: {
            domain: "",
        },
        validate: {
            domain: (value) => {
                const raw = String(value ?? "");
                const trimmed = raw.trim().toLowerCase();

                // Checks for internal whitespace and throws error when detected.
                if (/\s/.test(trimmed)) {
                    return "Error: Domain contains spaces! Remove all internal spaces and try again!";
                }
                // Checks trimmed trimmed input against the designated pattern.
                if (!domainRegex.test(trimmed)) {
                    return "Error: Invalid domain format! Please enter a valid domain!";
                }

                return null;
            },
        },
    });

    // Check if the command is available and set the state variables accordingly.
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
            setHasSaved(false);
        },
        [handleProcessData]
    );

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    // Removes whitespace and forces lowercase.
    const normalize = (s?: string) =>
        String(s ?? "")
            .trim()
            .toLowerCase();

    // Rebuilt with input validation in place.
    const onSubmit = (values: FormValuesType) => {
        // In place as a secondary check to ensure no invalid input passes from the input form.
        const raw = String(values.domain ?? "");
        const domain = raw.trim().toLowerCase();

        // Runs Amass if the validation process is successful.
        setAllowSave(false);
        setLoading(true);
        const args = ["enum", "-d", domain];

        CommandHelper.runCommandGetPidAndOutput("amass", args, handleProcessData, handleProcessTermination)
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

    // Notes the domain props for input handling.
    const domainProps = form.getInputProps("domain");

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
                <Group position="right">
                    {!showAlert && (
                        <Button onClick={handleShowAlert} size="xs" variant="outline" color="gray">
                            Show Disclaimer
                        </Button>
                    )}
                </Group>
                {LoadingOverlayAndCancelButton(loading, pid)}

                {showAlert && (
                    <Alert title="Warning: Potential Risks" color="red">
                        This tool is used to enumerate subdomains, use with caution and only on networks you own or have
                        explicit permission to test.
                    </Alert>
                )}

                <Stack>
                    <TextInput
                        label="Enter the domain to scan"
                        required
                        {...domainProps}
                        placeholder="example.com"
                        inputProps={{
                            pattern: domainPatternString,
                            title: "Please enter a valid domain!",
                        }}
                    />
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type="submit">Start {title}</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                    <AskChatGPT toolName={title} output={output} setChatGPTResponse={setChatGPTResponse} />
                    {chatGPTResponse && (
                        <div style={{ marginTop: "20px" }}>
                            <h3>ChatGPT Response:</h3>
                            <ChatGPTOutput output={chatGPTResponse} />
                        </div>
                    )}
                </Stack>
            </form>
        </RenderComponent>
    );
}

export default Amass;
