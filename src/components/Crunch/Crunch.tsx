import { Button, LoadingOverlay, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the Crunch component.
 */
interface FormValuesType {
    minLength: number;
    maxLength: number;
    charset: string;
    outputFile: string;
}

/**
 * The Crunch component.
 * @returns The Crunch component.
 */
const Crunch = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);

    const title = "Crunch";
    const description =
        "Crunch is a wordlist generator where you can specify a standard character set or any set of characters to be used in generating the wordlists.";
    const steps =
        "Using Crunch:\n" +
        "Step 1: Enter a Minimum password length.\n" +
        "           Eg: 8\n\n" +
        "Step 2: Enter a Maximum password length.\n" +
        "       Eg: 8\n\n" +
        "Step 3: Enter a Character set for the password generation.\n" +
        "       Eg: abcdefghijklmnopqrstuvwxyz123456789\n\n" +
        "Step 4: (Optional) Enter the directory for an Output file.\n\n" +
        "Step 5: Click Generate Password List to commence Crunch's operation.\n\n" +
        "Step 6: View the Output block below to view the results of the tools execution.";
    const sourceLink = "https://www.kali.org/tools/crunch/";
    const tutorial = "https://docs.google.com/document/d/1NoYLod8jyXOLAIUGU-d7Zeq_-_XDzXO-XzADKLPk72I/edit?usp=sharing";
    const dependencies = ["crunch"];

    const form = useForm<FormValuesType>({
        initialValues: {
            minLength: 3,
            maxLength: 4,
            charset: "abcde",
            outputFile: "",
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
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    const onSubmit = async (values: FormValuesType) => {
        setAllowSave(false);
        setHasSaved(false);
        setOutput("");

        const minLen = Number(values.minLength);
        const maxLen = Number(values.maxLength);

        if (minLen < 1 || maxLen < 1) {
            setOutput("Error: Minimum and maximum length must be greater than 0.");
            return;
        }

        if (minLen > maxLen) {
            setOutput("Error: Minimum length cannot be greater than maximum length.");
            return;
        }

        if (maxLen > 10) {
            setOutput("Error: Maximum length cannot exceed 10 to prevent the tool from freezing.");
            return;
        }

        if (!values.charset || values.charset.trim() === "") {
            setOutput("Error: Character set is required.");
            return;
        }

        setLoading(true);

        const args = [`${minLen}`, `${maxLen}`, `${values.charset}`];

        if (values.outputFile && values.outputFile.trim() !== "") {
            args.push("-o", values.outputFile);
        }

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "crunch",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any) {
            setOutput(e.message || "An unexpected error occurred.");
            setLoading(false);
        }
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
                <LoadingOverlay visible={loading} />
                <Stack>
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, "", handleProcessData, handleProcessTermination)}
                    <LoadingOverlay visible={loading} />

                    <TextInput
                        label="Minimum password length"
                        type="number"
                        min={1}
                        required
                        {...form.getInputProps("minLength")}
                    />

                    <TextInput
                        label="Maximum password length"
                        type="number"
                        min={1}
                        required
                        {...form.getInputProps("maxLength")}
                    />

                    <TextInput
                        label="Character set (e.g. abcdefghijklmnopqrstuvwxyz0123456789)"
                        required
                        {...form.getInputProps("charset")}
                    />

                    <TextInput label="Output file (optional)" {...form.getInputProps("outputFile")} />

                    <Text color="yellow" size="sm">
                        Note: Maximum password length above 10 is restricted to prevent the application from freezing.
                    </Text>

                    <Button type="submit" disabled={loading}>
                        {loading ? "Generating..." : "Generate Password List"}
                    </Button>

                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}

                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Crunch;
