import { useState, useEffect, useCallback } from "react";
import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile"; // v2

/**
 * Represents the form values for the Wifite component.
 */
interface FormValuesType {
    target: string;
}

/**
 * The Wifite component.
 * @returns The Wifite component.
 */
const Wifite = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [pid, setPid] = useState("");

    const title = "Wifite";
    const description = "Wifite is a tool for automating the process of cracking WEP and WPA/WPA2 encryption.";
    const steps =
        "Step 1: Specify the target network's BSSID or the ESSID.\n" +
        "Step 2: Click the Start " +
        title +
        " button and view the output block for the result.";
    const sourceLink = "https://www.kali.org/tools/wifite/";
    const dependencies = ["wifite"];
    const tutorial = "https://docs.google.com/document/d/1sbLdAH7QMHSUwM-tCZ1rBrq1v4-AeI8Qd55G7DJBcxk/edit?usp=sharing";

    const form = useForm({
        initialValues: {
            target: "",
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

        const args = [values.target];

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
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, handleProcessData, handleProcessTermination)}
                    <TextInput
                        label="Target Network (BSSID/ESSID)"
                        required
                        {...form.getInputProps("target")}
                        placeholder="e.g. 00:11:22:33:44:55 or myNetwork"
                    />
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type="submit">Start {title}</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Wifite;
