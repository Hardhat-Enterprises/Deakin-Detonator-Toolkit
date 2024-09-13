import { Button, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { RenderComponent } from "../UserGuide/UserGuide";
import { Command } from "@tauri-apps/api/shell";

interface FormValuesType {
    ip: string;
    port: string;
    speed: string;
    scripts: string;
}

const SMBEnumeration = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [selectedSpeedOption, setSelectedSpeedOption] = useState("T3");
    const [selectedScriptOption, setSelectedScriptOption] = useState("smb-enum-users");
    const [pid, setPid] = useState<string>("");
    const [loadingModal, setLoadingModal] = useState(true);
    const [opened, setOpened] = useState(false);
    const title = "SMB Enumeration"; // Title of the component
    const sourceLink = "https://nmap.org/nsedoc/scripts/"; // Source link to the official documentation for SMB enumeration scripts

    const description = `
    SMB (Server Message Block) represents a network protocol widely used to 
    provide shared access across files, printers, and serial ports within a network. 
    This tool aims to enumerate an SMB server to find potential vulnerabilities.

    How to use SMB Enumeration:
    Step 1: Enter an IP address or hostname. E.g., 127.0.0.1
    Step 2: Enter a port number. E.g., 445
    Step 3: Pick a scan speed. Note - higher speeds require a faster host network.
    T0 - Paranoid / T1 - Sneaky / T2 - Polite / T3 - Normal / T4 - Aggressive / T5 - Insane. E.g., T3
    Step 4: Select an SMB enumeration script to run against the target. E.g., smb-flood.nse
    Step 5: Click scan to commence the SMB enumeration operation.
    Step 6: View the output block below to view the results of the scan.
`;
    const steps =
        "Step 1: Enter an IP address or hostname" +
        "Step 2: Enter a port number" +
        "Step 3: Pick a scan speed. Note - higher speeds require a faster host network" +
        "Step 4: Select an SMB enumeration script to run against the target" +
        "Step 5: Click scan to commence the SMB enumeration operation" +
        "Step 6: View the output block below to view the results of the scan";
    const speeds = ["T0", "T1", "T2", "T3", "T4", "T5"];
    const scripts = [
        "smb2-capabilities.nse",
        "smb2-security-mode.nse",
        "smb2-time.nse",
        "smb2-vuln-uptime.nse",
        "smb-brute.nse",
        "smb-double-pulsar-backdoor.nse",
        "smb-enum-domains.nse",
        "smb-enum-groups.nse",
        "smb-enum-processes.nse",
        "smb-enum-services.nse",
        "smb-enum-sessions.nse",
        "smb-enum-shares.nse",
        "smb-enum-users.nse",
        "smb-flood.nse",
        "smb-ls.nse",
        "smb-mbenum.nse",
        "smb-os-discovery.nse",
        "smb-print-text.nse",
        "smb-protocols.nse",
        "smb-psexec.nse",
        "smb-security-mode.nse",
        "smb-server-stats.nse",
        "smb-system-info.nse",
        "smb-vuln-conficker.nse",
        "smb-vuln-cve2009-3103.nse",
        "smb-vuln-cve-2017-7494.nse",
        "smb-vuln-ms06-025.nse",
        "smb-vuln-ms07-029.nse",
        "smb-vuln-ms08-067.nse",
        "smb-vuln-ms10-054.nse",
        "smb-vuln-ms10-061.nse",
        "smb-vuln-ms17-010.nse",
        "smb-vuln-regsvc-dos.nse",
        "smb-vuln-webexec.nse",
        "smb-webexec-exploit.nse",
    ];
    const dependencies = ["nmap", "smbclient"];

    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setOpened(!isAvailable);
                setLoadingModal(false);
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false);
            });
    }, []);

    const form = useForm<FormValuesType>({
        initialValues: {
            ip: "",
            port: "",
            speed: selectedSpeedOption,
            scripts: selectedScriptOption,
        },
    });

    const handleProcessData = useCallback(
        (data: string) => {
            setOutput((prevOutput) => prevOutput + "\n" + data);
            if (!allowSave) setAllowSave(true);
        },
        [allowSave]
    );

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

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);
        setHasSaved(false);

        const args = [`-${values.speed}`, `--script=${values.scripts}`];

        if (values.port) {
            args.push(`-p ${values.port}`);
        }

        args.push(values.ip);

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "nmap",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any) {
            setOutput(e.toString());
        }
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setAllowSave(false);
        setHasSaved(false);
    }, []);

    const handleSaveComplete = useCallback(() => {
        setHasSaved(true);
        setAllowSave(false);
    }, []);

    return (
        <>
            <RenderComponent
                title={title}
                description={description}
                steps={steps}
                sourceLink={sourceLink}
                tutorial={""}
                children={undefined}
            />
            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description}
                    dependencies={dependencies}
                />
            )}
            <form
                onSubmit={form.onSubmit((values) =>
                    onSubmit({
                        ...values,
                        speed: selectedSpeedOption,
                        scripts: selectedScriptOption,
                    })
                )}
            >
                {LoadingOverlayAndCancelButton(loading, pid)}
                <Stack>
                    <TextInput label={"Target IP or hostname"} required {...form.getInputProps("ip")} />
                    <TextInput label={"Port"} required {...form.getInputProps("port")} placeholder={"Example: 445"} />

                    <NativeSelect
                        label={"Scan speed"}
                        value={selectedSpeedOption}
                        onChange={(e) => setSelectedSpeedOption(e.target.value)}
                        title={"scan speed"}
                        data={speeds}
                        placeholder={"Select a scan speed. Default set to T3"}
                        description={
                            "Speed of the scan, refer: https://nmap.org/book/performance-timing-templates.html"
                        }
                    />

                    <NativeSelect
                        label={"SMB script"}
                        value={selectedScriptOption}
                        onChange={(e) => setSelectedScriptOption(e.target.value)}
                        title={"SMB Enumeration Script"}
                        data={scripts}
                        required
                        placeholder={"Select an SMB Enumeration Script to run against the target"}
                        description={"NSE Scripts, refer: https://nmap.org/nsedoc/scripts/"}
                    />

                    <Button type={"submit"}>Start {title}</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </>
    );
};

export default SMBEnumeration;
