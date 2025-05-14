import { Button, Stack, NativeSelect, Tooltip, TextInput, Switch, Alert, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect, useRef } from "react";
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
 * Represents the form values for the Enum4Linux component.
 */
interface FormValuesType {
    ipAddress: string;
    argumentMain: string;
    paramMain: string;
    argumentAlt: string;
    paramAlt: string;
}

/**
 * The Enum4Linux component.
 */
const Enum4Linux = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [customMode, setCustomMode] = useState(false);
    const [selectedOption, setselectedOption] = useState("M");
    const [chatGPTResponse, setChatGPTResponse] = useState("");
    const [showAlert, setShowAlert] = useState(true);
    const alertTimeout = useRef<NodeJS.Timeout | null>(null);

    const dependencies = ["enum4linux"];
    const title = "Enum4Linux";
    const description = "Enum4linux is a tool used for enumerating information from Windows and Samba systems.";
    const steps =
        "Step 1: Enter the IP address of the target.\n" +
        "Step 2: Select the option you want for enumeration. Options for enumerating machines, users and shared directories.\n" +
        "Step 3: Enter any additional parameters you want to add, like specific credentials.\n" +
        "Step 4: Click the Start " +
        title +
        " button and view the output block to see the results. ";
    const sourceLink = "https://www.kali.org/tools/enum4linux/"; // Link to the source code (or Kali Tools).
    const tutorial = "https://docs.google.com/document/d/1F4F-CGdQoedHk3A4nSthafHocbhTwKZv8GnBCtghouQ/edit?usp=sharing"; // Link to the official documentation/tutorial.
    const [osinfo, setInfo] = useState(false);
    const form = useForm({
        initialValues: {
            ipAddress: "",
            argumentMain: "",
            paramMain: "",
            argumentAlt: "",
            paramAlt: "",
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
            let message = `Process terminated with exit code: ${code} and signal code: ${signal}`;
            if (code === 0) {
                message = "\nProcess completed successfully.";
            } else if (signal === 15) {
                message = "\nProcess was manually terminated.";
            }
            handleProcessData(message);
            setPid("");
            setLoading(false);
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);
        let options = `-${selectedOption}`;

        if (osinfo) options = options.concat(" -o");

        let args = []; //Making args mutable, need to check if parameters are provided.

        args.push(options);

        if (values.paramMain) args.push(values.paramMain);

        if (values.paramAlt) args.push(values.paramAlt);

        args.push(values.ipAddress);

        CommandHelper.runCommandGetPidAndOutput("enum4linux", args, handleProcessData, handleProcessTermination)
            .then(({ pid, output }) => {
                setPid(pid);
                setOutput(output);
                setAllowSave(true);
            })
            .catch((error) => {
                setOutput(`Error: ${error.message}`);
                setLoading(false);
                setAllowSave(true);
            });
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, []);

    const handleSaveComplete = () => {
        setHasSaved(true);
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
                {LoadingOverlayAndCancelButton(loading, pid)}
                <Stack>
                    <Group position="right">
                        {!showAlert && (
                            <Button onClick={handleShowAlert} size="xs" variant="outline" color="gray">
                                Show Disclaimer
                            </Button>
                        )}
                    </Group>
                    {showAlert && (
                        <Alert title="Warning: Potential Risks" color="red">
                            This tool is used to perform information gathering, use with caution and only on targets you
                            own or have explicit permission to test.
                        </Alert>
                    )}
                    <Switch
                        size="md"
                        label="Custom Configuration"
                        checked={customMode}
                        onChange={(e) => setCustomMode(e.currentTarget.checked)}
                    />
                    <Switch
                        size="md"
                        label="Include OS Information"
                        checked={osinfo}
                        onChange={(e) => setInfo(e.currentTarget.checked)}
                    />

                    <Tooltip
                        label="Enter the IP address of the target system you want to enumerate."
                        position="right"
                        withArrow
                    >
                        <TextInput
                            label="IP Address of Target"
                            required
                            {...form.getInputProps("ipAddress")}
                            placeholder="Example: 192.168.1.1"
                        />
                    </Tooltip>

                    <Tooltip label="Choose the enumeration option" position="right" withArrow>
                        <NativeSelect
                            label="Options"
                            value={selectedOption}
                            onChange={(e) => {
                                setselectedOption(e.target.value);
                            }}
                            title="Select Options"
                            data={[
                                { label: "Machine List", value: "M" },
                                { label: "User List", value: "U" },
                                { label: "Share List", value: "S" },
                            ]}
                            required
                        />
                    </Tooltip>

                    <Tooltip
                        label="Parameter for the chosen option like username or password if required."
                        position="right"
                        withArrow
                    >
                        <TextInput
                            label="Parameters"
                            {...form.getInputProps("paramMain")}
                            placeholder="Example: -u <username> "
                        />
                    </Tooltip>
                    {customMode && (
                        <>
                            <Tooltip
                                label="Additional parameter for the chosen option like password if required."
                                position="right"
                                withArrow
                            >
                                <TextInput
                                    label="Additional Parameters"
                                    {...form.getInputProps("paramAlt")}
                                    placeholder="Example: -p <password> "
                                />
                            </Tooltip>
                        </>
                    )}
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
};

export default Enum4Linux;
