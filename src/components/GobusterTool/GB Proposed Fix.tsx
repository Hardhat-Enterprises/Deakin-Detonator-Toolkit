import { Button, Stack, TextInput, Group } from "@mantine/core";
import { useForm, isNotEmpty } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { RenderComponent } from "../UserGuide/UserGuide";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import InstallationModal from "../InstallationModal/InstallationModal";

// ================== FORM TYPE ==================
interface FormValuesType {
    url: string;
    wordlist: string;
}

const GoBusterTool = () => {
    // ================== STATE ==================
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(false);
    // FIX: Start as false and update after checking dependencies

    const [loadingModal, setLoadingModal] = useState(true);

    // ================== INFO ==================
    const title = "GoBuster";

    const description =
        "GoBuster helps find hidden files and directories on a website using a wordlist.";

    const steps =
        "Step 1: Enter a valid URL.\n" +
        "Step 2: Enter a valid wordlist path.\n" +
        "Step 3: Click Start.";

    const sourceLink = "https://www.kali.org/tools/gobuster/";

    // ================== FIX 1: TUTORIAL ==================
    // Replaced Google Docs link with official documentation (more reliable)
    const tutorial = "https://www.kali.org/tools/gobuster/";

    const dependencies = ["gobuster"];

    // ================== FORM ==================
    const form = useForm({
        initialValues: {
            url: "",
            wordlist: "",
        },
        validate: {
            url: (value) =>
                /^https?:\/\/[^\s$.?#].[^\s]*$/.test(value)
                    ? null
                    : "Invalid URL format (example: https://example.com)",

            wordlist: (value) =>
                isNotEmpty(value)
                    ? null
                    : "Wordlist path cannot be empty",
        },
    });

    // ================== CHECK DEPENDENCIES ==================
    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable);
                setOpened(!isAvailable); // show install modal if missing
                setLoadingModal(false);
            })
            .catch((error) => {
                console.error("Error checking command:", error);
                setLoadingModal(false);
            });
    }, []);

    // ================== HANDLE OUTPUT ==================
    const handleProcessData = useCallback((data: string) => {
        setOutput((prev) => prev + "\n" + data);
    }, []);

    // ================== HANDLE TERMINATION ==================
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                // FIX 2: Correct template string syntax
                handleProcessData(
                    `\nProcess terminated with exit code: ${code} and signal: ${signal}`
                );
            }

            setPid("");
            setLoading(false);
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    // ================== SUBMIT ==================
    const onSubmit = async (values: FormValuesType) => {
        if (!form.validate().hasErrors) {
            setAllowSave(false);
            setLoading(true);

            // FEATURE 1: Clear old output
            setOutput("");

            const args = ["dir", "-u", values.url, "-w", values.wordlist];

            try {
                const result = await CommandHelper.runCommandGetPidAndOutput(
                    "gobuster",
                    args,
                    handleProcessData,
                    handleProcessTermination
                );

                setPid(result.pid);
                setOutput(result.output);
            } catch (e: any) {
                // FEATURE 2: Better error message
                setOutput("Error running GoBuster: " + e.message);
            }

            setLoading(false);
        }
    };

    // ================== SAVE ==================
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    // ================== CLEAR ==================
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, []);

    return (
        <RenderComponent
            title={title}
            description={description}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
            {/* INSTALL MODAL */}
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

                    {/* URL INPUT */}
                    <TextInput
                        label="Target URL"
                        required
                        {...form.getInputProps("url")}
                    />

                    {/* FEATURE 3: WORDLIST HELP */}
                    <TextInput
                        label="Wordlist File"
                        description="Example: /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt"
                        required
                        {...form.getInputProps("wordlist")}
                    />

                    {/* BUTTONS */}
                    <Group>
                        {/* FEATURE 4: DISABLE BUTTON WHEN RUNNING */}
                        <Button type="submit" disabled={loading}>
                            {loading ? "Running..." : "Start GoBuster"}
                        </Button>

                        {/* FEATURE 5: OPEN TUTORIAL BUTTON */}
                        <Button
                            variant="outline"
                            onClick={() => window.open(tutorial, "_blank")}
                        >
                            Open Tutorial
                        </Button>
                    </Group>

                    {/* SAVE OUTPUT */}
                    {SaveOutputToTextFile_v2(
                        output,
                        allowSave,
                        hasSaved,
                        handleSaveComplete
                    )}

                    {/* OUTPUT CONSOLE */}
                    <ConsoleWrapper
                        output={output}
                        clearOutputCallback={clearOutput}
                    />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default GoBusterTool;