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
    const [paramError, setParamError] = useState("");
    const alertTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const dependencies = ["enum4linux"];
    const title = "Enum4Linux";
    const description = "Enum4linux is a tool used for enumerating information from Windows and Samba systems.";
    const steps =
        "How to use Enum4Linux:\n\n" +
        "Step 1: Enter the IP address of the target.\n" +
        "       E.g. 192.168.1.10\n\n" +
        "Step 2: Select the main enumeration option (Machine List, User List, or Share List).\n" +
        "       These correspond to -M, -U, and -S flags respectively.\n\n" +
        "Step 3: Enter additional parameters as needed:\n" +
        "       • u username p password - for authentication\n" +
        "       • d v - for detailed verbose output\n" +
        "       • r - for RID cycling to enumerate users\n" +
        "       • G P - for groups and password policy\n" +
        "       • a - for all simple enumeration\n\n" +
        "Step 4: Enable 'Custom Configuration' for advanced options like:\n" +
        "       • R 500-1000 - custom RID range\n" +
        "       • A - aggressive enumeration\n" +
        "       • s filename - share name bruteforcing\n\n" +
        "Step 5: Toggle 'Include OS Information' to add -o flag for OS details.\n\n" +
        "Step 6: Click 'Start Enum4Linux' and view results in the output section.";
    const sourceLink = "https://www.kali.org/tools/enum4linux/";
    const tutorial = "https://docs.google.com/document/d/1F4F-CGdQoedHk3A4nSthafHocbhTwKZv8GnBCtghouQ/edit?usp=sharing";
    const [osinfo, setInfo] = useState(false);

    // Valid enum4linux parameters for validation
    const validParams = [
        // Basic enumeration options
        "U", // get userlist
        "M", // get machine list
        "S", // get sharelist
        "P", // get password policy information
        "G", // get group and member list
        "d", // be detailed, applies to -U and -S
        "u", // specify username to use
        "p", // specify password to use

        // Additional options
        "a", // Do all simple enumeration (-U -S -G -P -r -o -n -i)
        "h", // Display help message and exit
        "r", // enumerate users via RID cycling
        "R", // RID ranges to enumerate (default: 500-550,1000-1050, implies -r)
        "K", // Keep searching RIDs until n consecutive RIDs don't correspond to a username
        "l", // Get some (limited) info via LDAP 389/TCP (for DCs only)
        "s", // brute force guessing for share names
        "k", // User(s) that exists on remote system
        "o", // Get OS information
        "i", // Get printer information
        "w", // Specify workgroup manually
        "n", // Do an nmblookup (similar to nbtstat)
        "v", // Verbose. Shows full commands being run
        "A", // Aggressive. Do write checks on shares etc
    ];

    const form = useForm({
        initialValues: {
            ipAddress: "",
            argumentMain: "",
            paramMain: "",
            argumentAlt: "",
            paramAlt: "",
        },
        validate: {
            ipAddress: (value) => {
                const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/;
                return !ipRegex.test(value) ? "Please enter a valid IP address or hostname" : null;
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
                console.error("Error checking command availability:", error);
                setLoadingModal(false);
            });
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

    // Function to validate and format parameters
    const validateAndFormatParameter = (param: string): { isValid: boolean; formatted: string; error: string } => {
        if (!param.trim()) {
            return { isValid: true, formatted: "", error: "" };
        }

        // Remove any existing dashes and spaces
        const cleanParam = param.replace(/^-+/, "").trim();

        // Check for multiple parameters (like "u username p password")
        const parts = cleanParam.split(/\s+/);
        let formattedParams = [];
        let invalidParams = [];

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            // If it's a single letter parameter
            if (part.length === 1 && validParams.includes(part)) {
                formattedParams.push(`-${part}`);
                // Check if next part is a value for this parameter
                if (i + 1 < parts.length && !validParams.includes(parts[i + 1])) {
                    formattedParams.push(parts[i + 1]);
                    i++; // Skip the next part as it's a value
                }
            } else if (part.length === 1 && !validParams.includes(part)) {
                invalidParams.push(part);
            } else if (part.length > 1) {
                // Multi-character parameters like "username", "password", etc.
                formattedParams.push(part);
            }
        }

        if (invalidParams.length > 0) {
            return {
                isValid: false,
                formatted: "",
                error: `Invalid parameter(s): ${invalidParams.join(", ")}. Valid options: ${validParams.join(", ")}`,
            };
        }

        return {
            isValid: true,
            formatted: formattedParams.join(" "),
            error: "",
        };
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
        // Clear previous parameter errors
        setParamError("");

        // Validate main parameters
        const mainParamResult = validateAndFormatParameter(values.paramMain);
        if (!mainParamResult.isValid) {
            setParamError(`Main Parameters: ${mainParamResult.error}`);
            return;
        }

        // Validate additional parameters if in custom mode
        let altParamResult = { isValid: true, formatted: "", error: "" };
        if (customMode) {
            altParamResult = validateAndFormatParameter(values.paramAlt);
            if (!altParamResult.isValid) {
                setParamError(`Additional Parameters: ${altParamResult.error}`);
                return;
            }
        }

        setLoading(true);
        setAllowSave(false);

        // Build options string
        let options = `-${selectedOption}`;
        if (osinfo) options = options.concat(" -o");

        let args = [];
        args.push(options);

        // Add formatted parameters
        if (mainParamResult.formatted) {
            args.push(mainParamResult.formatted);
        }

        if (customMode && altParamResult.formatted) {
            args.push(altParamResult.formatted);
        }

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

                    {paramError && (
                        <Alert title="Parameter Error" color="yellow">
                            {paramError}
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
                        label="Enter parameters like 'u username p password' or 'd v' for detailed verbose output. Don't include dashes - they'll be added automatically."
                        position="right"
                        withArrow
                    >
                        <TextInput
                            label="Parameters"
                            {...form.getInputProps("paramMain")}
                            placeholder="Example: u admin p password123 d v"
                            description="Valid options: U (userlist), S (sharelist), G (groups), P (password policy), d (detailed), v (verbose), r (RID cycling), etc."
                        />
                    </Tooltip>

                    {customMode && (
                        <>
                            <Tooltip
                                label="Additional parameters for advanced options like 'R 500-600' for RID range or 's shares.txt' for share bruteforce."
                                position="right"
                                withArrow
                            >
                                <TextInput
                                    label="Additional Parameters"
                                    {...form.getInputProps("paramAlt")}
                                    placeholder="Example: R 500-1000 K 10 A"
                                    description="Advanced options: R (RID range), K (RID search limit), A (aggressive), s (share bruteforce), w (workgroup)"
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
