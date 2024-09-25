import { useState, useEffect, useCallback } from "react";
import { Button, Stack, TextInput, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile"; //v2

interface FormValuesType {
    targetInterface: string;
    attackMode: string;
    channel: string;
}

const Wifite = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [pid, setPid] = useState("");
    const [verboseMode, setVerboseMode] = useState(false);
    const [allowSave, setAllowSave] = useState(false);

    const title = "Wifite";
    const description =
        "Wifite is a Python tool for automating the process of attacking WPA and WPA2 networks. It handles the cracking of handshakes and supports multiple attack modes.";
    const steps =
        "=== Required ===\n" +
        "Step 1: Select the network interface to use for scanning.\n" +
        "Step 2: Specify the attack mode you want to use (e.g., -a 1 for deauthentication).\n" +
        "Step 3: Input the channel to scan (if applicable).\n" +
        " \n" +
        "=== Optional ===\n" +
        "Step 4: Enable verbose mode for more detailed output.\n";
    const sourceLink = ""; 
    const tutorial = ""; 
    const dependencies = ["wifite"];

    let form = useForm({
        initialValues: {
            targetInterface: "",
            attackMode: "",
            channel: "",
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

        let args = [];
        args = [values.targetInterface, "-a", values.attackMode];

        if (values.channel) {
            args.push("--channel", values.channel);
        }

        if (verboseMode) {
            args.push("-v");
        }

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
                    <LoadingOverlayAndCancelButton loading={loading} />
                    <TextInput
                        label="Network Interface"
                        required
                        {...form.getInputProps("targetInterface")}
                        placeholder="e.g. wlan0"
                    />
                    <TextInput
                        label="Attack Mode"
                        required
                        {...form.getInputProps("attackMode")}
                        placeholder="e.g. 1 for deauth"
                    />
                    <TextInput label="Channel" {...form.getInputProps("channel")} placeholder="e.g. 6" />
                    <Checkbox
                        label="Verbose Mode"
                        checked={verboseMode}
                        onChange={(event) => setVerboseMode(event.currentTarget.checked)}
                    />
                    <Button type="submit">Start {title}</Button>
                    {output && <ConsoleWrapper output={output} />}
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Wifite;
