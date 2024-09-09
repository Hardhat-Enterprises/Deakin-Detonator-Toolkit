import { Button, Select, Stack, Switch, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapperWithBuiltinOverlay";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";

const plugin_list = ["FTP", "SMTP", "POP", "HTTP", "IRC", "IMAP", "PJL", "LPD", "FINGER", "SOCKS4"];
const pluginsRequiringAuth = ["FTP", "IMAP", "POP"];
const pluginRequiringEmail = ["SMTP"];
const pluginsRequiringUsername = ["SOCKS4"];

const title = "BEDTool";

const description_userguide = `
// Your description here...
`;

interface FormValues {
    plugin: string;
    target: string;
    port: string;
    email: string;
    username: string;
    password: string;
}

export function BEDTool() {
    const [loading, setLoading] = useState(false);
    const [pid, setPid] = useState("");
    const [output, setOutput] = useState("");
    const [selectedPlugin, setSelectedPlugin] = useState<string>(""); // Ensure state initialization with type
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [customconfig, setCustomconfig] = useState(false);

    const form = useForm<FormValues>({
        initialValues: {
            plugin: "",
            target: "",
            port: "",
            email: "",
            username: "",
            password: "",
        },
        validate: {
            username: (value, values) => {
                console.log("Validating Username:", value, values); // Debugging line
                if (values.plugin && (pluginsRequiringAuth.includes(values.plugin) || pluginsRequiringUsername.includes(values.plugin))) {
                    return /^[a-zA-Z0-9_]+$/.test(value) ? null : "Invalid username";
                }
                return null;
            },
            password: (value, values) => {
                console.log("Validating Password:", value, values); // Debugging line
                if (values.plugin && pluginsRequiringAuth.includes(values.plugin)) {
                    return value.length >= 8 ? null : "Password must be at least 8 characters";
                }
                return null;
            },
            email: (value, values) => {
                console.log("Validating Email:", value, values); // Debugging line
                if (values.plugin === "SMTP") {
                    return /^\S+@\S+\.\S+$/.test(value) ? null : "Invalid email";
                }
                return null;
            },
        },
    });

    const handleProcessData = useCallback((data: string) => {
        console.log("Process Data Received:", data); // Debugging line
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            console.log("Process Termination:", code, signal); // Debugging line
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
        console.log("Save Completed"); // Debugging line
        setHasSaved(true);
        setAllowSave(false);
    };

    const onSubmit = (values: FormValues) => {
        console.log("Submitting Form Values:", values); // Debugging line
        setAllowSave(false);
        setLoading(true);

        const baseArgs = ["-s", values.plugin];

        const conditionalArgs: string[][] = [
            customconfig ? ["-t", values.target, "-p", values.port] : [],
            selectedPlugin === "SMTP" ? ["-u", values.email] : [],
            pluginsRequiringAuth.includes(selectedPlugin) ? ["-u", values.username, "-v", values.password] : [],
        ];

        const args = baseArgs.concat(conditionalArgs.flat().filter(Boolean));

        CommandHelper.runCommandGetPidAndOutput("bed", args, handleProcessData, handleProcessTermination)
            .then(({ pid, output }) => {
                console.log("Command Executed Successfully:", pid, output); // Debugging line
                setPid(pid);
                setOutput(output);
            })
            .catch((error) => {
                console.error("Error Executing Command:", error); // Debugging line
                setLoading(false);
                setOutput(`Error: ${error.message}`);
            });
    };

    const clearOutput = useCallback(() => {
        console.log("Clearing Output"); // Debugging line
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, []);

    const handlePluginChange = (value: string) => {
        console.log("Plugin Changed to:", value); // Debugging line
        form.setFieldValue("plugin", value);
        setSelectedPlugin(value);
        form.setFieldValue("username", "");
        form.setFieldValue("password", "");
        form.setFieldValue("email", "");
    };

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <Stack>
                {UserGuide(title, description_userguide)}
                <Switch
                    size="md"
                    label="Manual Network Configuration"
                    checked={customconfig}
                    onChange={(e) => setCustomconfig(e.currentTarget.checked)}
                />
                <Select
                    label="Plugin Type"
                    placeholder="Select a plugin to test"
                    data={plugin_list}
                    required
                    value={selectedPlugin}
                    onChange={handlePluginChange}
                />

                {pluginsRequiringAuth.includes(selectedPlugin) && (
                    <>
                        <TextInput
                            label="Username (default user is the same as your Kali Linux login)"
                            required
                            {...form.getInputProps("username")}
                        />
                        <TextInput label="Password" type="password" required {...form.getInputProps("password")} />
                    </>
                )}
                {pluginsRequiringUsername.includes(selectedPlugin) && (
                    <>
                        <TextInput label="Username" required {...form.getInputProps("username")} />
                    </>
                )}
                {pluginRequiringEmail.includes(selectedPlugin) && (
                    <>
                        <TextInput label="Email Address" required {...form.getInputProps("email")} />
                    </>
                )}
                {customconfig && (
                    <>
                        <TextInput
                            label="Custom IP Address (default: localhost)"
                            required
                            {...form.getInputProps("target")}
                        />
                        <TextInput
                            label="Port Number (default: service-specific standard port)"
                            required
                            {...form.getInputProps("port")}
                        />
                    </>
                )}
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <Button type="submit">Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} pid={pid} loading={loading} />
            </Stack>
        </form>
    );
}

export default BEDTool;
