import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the RainbowCrack component.
 */
interface FormValuesType {
    hashValue: string;
}

/**
 * NEW: Validates if the hash input matches one of the supported formats.
 * @param hash - The hash string entered by the user.
 * @returns A string if invalid, or null if valid.
 */
const validateHashFormat = (hash: string): string | null => {
    const patterns: { [key: string]: RegExp } = {
        LM: /^[A-F0-9]{32}$/,
        NTLM: /^[a-fA-F0-9]{32}$/,
        MD5: /^[a-fA-F0-9]{32}$/,
        SHA1: /^[a-fA-F0-9]{40}$/,
        SHA256: /^[a-fA-F0-9]{64}$/,
    };

    for (const regex of Object.values(patterns)) {
        if (regex.test(hash)) return null;
    }

    return "Invalid hash format. Supported: LM, NTLM, MD5, SHA1, SHA256.";
};

/**
 * The RainbowCrack component.
 * @returns The RainbowCrack component.
 */
const RainbowCrack = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    const title = "RainbowCrack";
    const description =
        "RainbowCrack is a computer program which utilises rainbow tables to be used in password cracking.";
    const steps =
        "How to use RainbowCrack \n" +
        "Step 1: Enter a hash value. (E.g. 5d41402abc4b2a76b9719d911017c592) \n" +
        "Step 2: Simply tap on the crack button to crack the hash key. \n" +
        "The user can even save the output to a file by assigning a file-name under 'save output to file' option.";
    const sourceLink = "";
    const tutorial = "";
    const dependencies = ["rcrack"];

    /**
     * NEW: Form hook with validation logic for hash input
     */
    const form = useForm<FormValuesType>({
        initialValues: {
            hashValue: "",
        },
        validate: {
            hashValue: (value) => validateHashFormat(value),
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
        const args = [values.hashValue];

        CommandHelper.runCommandGetPidAndOutput("rcrack", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
                setOutput(output);
                console.log(pid);
                setPid(pid);
            })
            .catch((error) => {
                setOutput(error.message);
                setLoading(false);
            });
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    const handleSaveComplete = () => {
        setHasSaved(true);
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
                    {LoadingOverlayAndCancelButton(loading, pid)}

                    {/* NEW: Validating hash input and showing error message if invalid */}
                    <TextInput
                        label="Hash Value"
                        required
                        {...form.getInputProps("hashValue", { validateInputOnBlur: true })}
                    />

                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}

                    {/* NEW: Disable submit button if form is invalid */}
                    <Button type="submit" disabled={!form.isValid()}>
                        Crack
                    </Button>

                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default RainbowCrack;
