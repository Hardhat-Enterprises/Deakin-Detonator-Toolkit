import { useState, useEffect, useCallback } from "react";
import { Button, Stack, TextInput, Checkbox, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../../utils/CommandHelper";
import ConsoleWrapper from "../../ConsoleWrapper/ConsoleWrapper";
import { LoadingOverlayAndCancelButtonPkexec } from "../../OverlayAndCancelButton/OverlayAndCancelButton";
import { RenderComponent } from "../../UserGuide/UserGuide";
import InstallationModal from "../../InstallationModal/InstallationModal";
import { checkAllCommandsAvailability } from "../../../utils/CommandAvailability";
import { SaveOutputToTextFile_v2 } from "../../SaveOutputToFile/SaveOutputToTextFile";

/**
 * Represents the form values for the Wifite component.
 */
interface FormValuesType {
    target: string;
    dictPath: string;
    timeout: number;
    power: number;
    wpsOnly: boolean;
    wepOnly: boolean;
    pmkid: boolean;
    noWpa: boolean;
    skipCrack: boolean;
}

const Wifite2 = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [pid, setPid] = useState("");

    const title = "Wifite2";
    const description =
        "Wifite2 automates the process of testing and cracking WEP, WPA/WPA2, and WPS encryption using advanced attack techniques.";
    const steps =
        "Step 1: Fill in optional attack options like WPS-only or dictionary path.\n" +
        "Step 2: Specify the BSSID/ESSID.\n" +
        "Step 3: Click 'Start Wifite2' and monitor the output.\n" +
        "Step 4: Save output if required.";
    const sourceLink = "https://github.com/derv82/wifite2";
    const dependencies = ["wifite"];
    const tutorial = "https://docs.google.com/document/d/1sbLdAH7QMHSUwM-tCZ1rBrq1v4-AeI8Qd55G7DJBcxk/edit?usp=sharing";

    const form = useForm<FormValuesType>({
        initialValues: {
            target: "",
            dictPath: "",
            timeout: 0,
            power: 0,
            wpsOnly: false,
            wepOnly: false,
            pmkid: false,
            noWpa: false,
            skipCrack: false,
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
        ({ code, signal }: { code: number; signal: number | null }) => {
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 2) {
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

        const args: string[] = [];

        if (values.target) args.push(values.target);
        if (values.dictPath) args.push("--dict", values.dictPath);
        if (values.timeout > 0) args.push("--timeout", values.timeout.toString());
        if (values.power > 0) args.push("--power", values.power.toString());
        if (values.wpsOnly) args.push("--wps-only");
        if (values.wepOnly) args.push("--wep-only");
        if (values.pmkid) args.push("--pmkid");
        if (values.noWpa) args.push("--no-wpa");
        if (values.skipCrack) args.push("--skip-crack");

        CommandHelper.runCommandWithPkexec("wifite", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
                setOutput(output);
                setAllowSave(true);
                setPid(pid);
            })
            .catch((error) => {
                setOutput(`Error: ${error.message}`);
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
            sourceLink={sourceLink}
            tutorial={tutorial}
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
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, "", handleProcessData, handleProcessTermination)}

                    <TextInput
                        label="Target Network (BSSID/ESSID)"
                        required
                        placeholder="e.g. 00:11:22:33:44:55 or myNetwork"
                        {...form.getInputProps("target")}
                    />

                    <TextInput
                        label="Custom Dictionary Path (optional)"
                        placeholder="/usr/share/wordlists/rockyou.txt"
                        {...form.getInputProps("dictPath")}
                    />

                    <NumberInput label="Timeout (in seconds, optional)" min={0} {...form.getInputProps("timeout")} />

                    <NumberInput label="Power Threshold (optional)" min={0} {...form.getInputProps("power")} />

                    <Checkbox label="WPS Only" {...form.getInputProps("wpsOnly", { type: "checkbox" })} />
                    <Checkbox label="WEP Only" {...form.getInputProps("wepOnly", { type: "checkbox" })} />
                    <Checkbox label="PMKID Attack Only" {...form.getInputProps("pmkid", { type: "checkbox" })} />
                    <Checkbox label="No WPA Attacks" {...form.getInputProps("noWpa", { type: "checkbox" })} />
                    <Checkbox
                        label="Skip Cracking Captures"
                        {...form.getInputProps("skipCrack", { type: "checkbox" })}
                    />

                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type="submit">Start {title}</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Wifite2;
