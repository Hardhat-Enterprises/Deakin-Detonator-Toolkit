import { Button, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import React from "react";

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
    const [opened, setOpened] = useState(false);
    const [loadingModal, setLoadingModal] = useState(true);
    const [customMode, setCustomMode] = useState(false);

    const dependencies = ["enum4linux"];
    const title = "Enum4Linux";
    const description = "Enum4linux is a tool used for enumerating information from Windows and Samba systems.";
    const steps =
        "Step 1: Enter the Ip address of the target.\n" +
        "Step 2: Type in the option you want to do enumeration.\n" +
        "Step 3: Enter any additional parameters you want to add.";
    const sourceLink = ""; // Link to the source code (or Kali Tools).
    const tutorial = ""; // Link to the official documentation/tutorial.

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
    }, []);

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
        const options = `-${values.argumentMain}`;
        const args = values.argumentAlt
            ? [options, values.paramMain, `-${values.argumentAlt}`, values.paramAlt, values.ipAddress]
            : [options, values.paramMain, values.ipAddress];

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
                    <Switch
                        size="md"
                        label="Custom Configuration"
                        checked={customMode}
                        onChange={(e) => setCustomMode(e.currentTarget.checked)}
                    />
                    <TextInput label="IP Address of Target" required {...form.getInputProps("ipAddress")} />
                    <TextInput label="Option" required {...form.getInputProps("argumentMain")} />
                    <TextInput label="Parameters" {...form.getInputProps("paramMain")} />
                    {customMode && (
                        <>
                            <TextInput label="Additional Options" {...form.getInputProps("argumentAlt")} />
                            <TextInput label="Additional Parameters" {...form.getInputProps("paramAlt")} />
                        </>
                    )}
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type="submit">Scan</Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Enum4Linux;
