import { Button, Stack, TextInput, Alert, Group, Title, Card, Table, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";

// Tauri helpers for pickers, fs checks, opening results, and sending SIGTERM
import { open as openDialog } from "@tauri-apps/api/dialog";
import { exists, readTextFile, readBinaryFile } from "@tauri-apps/api/fs";
import { join, basename } from "@tauri-apps/api/path";
import { open as shellOpen, Command as ShellCommand } from "@tauri-apps/api/shell";

/**
 * Represents the form values for the EyeWitness component.
 */
interface FormValuesType {
    filePath: string;
    directory: string;
    timeout: string;
}

// Simple parser for a clean summary card (optional, additive)
function parseSummary(raw: string) {
    const lines = raw.split(/\r?\n/);
    const get = (rx: RegExp) => (lines.find((l) => rx.test(l)) || "").split(":").slice(1).join(":").trim();
    return {
        Targets: get(/(Input|File|URLs)\s*:/i) || "",
        Output: get(/(Report|Output|Directory)\s*:/i) || "",
        Screenshots: get(/(Screenshots|Captured)\s*:/i) || "",
        Errors: lines.filter((l) => /error/i.test(l)).length.toString(),
    };
}

/** Minimal binary sniff: blocks obvious non-text (e.g., PNG) before running EyeWitness */
async function isProbablyTextFile(path: string): Promise<boolean> {
    try {
        const buf = await readBinaryFile(path);
        if (!buf || buf.length === 0) return true; // empty handled later
        // PNG magic: 89 50 4E 47
        if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return false;
        const sample = Math.min(buf.length, 4096);
        let nonText = 0;
        for (let i = 0; i < sample; i++) {
            const b = buf[i];
            const isWhitespace = b === 9 || b === 10 || b === 13;
            const isPrintable = b >= 32 && b <= 126;
            if (!(isWhitespace || isPrintable)) {
                if (++nonText > 16) return false; // looks binary
            }
        }
        return true;
    } catch {
        // If we can't read binary, don't block here; later checks will surface permissions.
        return true;
    }
}

const title = "EyeWitness";
const description =
    "EyeWitness takes screenshots of websites, provides information about the server header, and identifies default credentials (if known). It presents this information in a HTML report.";
const steps =
    "Step 1: Create a plain text file on your local drive and add URLs to it. Each URL must be on its own line. Add the file path to the text file in the first field. \n\n" +
    "Step 2: Add the file path for where you want the output saved in the second field.\n\n" +
    "Step 3: Add a number in the third field for the maximum number of seconds for EyeWitness to try and screenshot a webpage, e.g. 20. \n\n" +
    "Step 4: Press the scan button. ";
const sourceLink = "https://www.kali.org/tools/eyewitness/#eyewitness";
const tutorial = "https://docs.google.com/document/d/1V4lIQbeIbKwNiLQqSXvJZ0HM34q5FDxe2HHP2t6d8mA/edit?usp=sharing";
const dependencies = ["eyewitness"];

function Eyewitness() {
    // State Variables
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [showAlert, setShowAlert] = useState(true);
    const alertTimeout = useRef<NodeJS.Timeout | null>(null);

    // UX & validation state
    const [friendlyError, setFriendlyError] = useState<string | null>(null);
    const [canRun, setCanRun] = useState(false);
    const [resultsPath, setResultsPath] = useState<string | null>(null);

    // NEW: auto-cancel (Bug #3) — 15 min guard with SIGTERM
    const AUTO_CANCEL_MINUTES = 15;
    const autoCancelTimerRef = useRef<number | null>(null);
    const pidRef = useRef<string>("");

    const form = useForm<FormValuesType>({
        initialValues: {
            filePath: "",
            directory: "",
            timeout: "",
        },
    });

    useEffect(() => {
        // Check if the command is available and set the state variables accordingly.
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

        // Set timeout to remove alert after 5 seconds on load.
        alertTimeout.current = setTimeout(() => {
            setShowAlert(false);
        }, 5000);

        return () => {
            if (alertTimeout.current) {
                clearTimeout(alertTimeout.current);
            }
            if (autoCancelTimerRef.current) {
                clearTimeout(autoCancelTimerRef.current);
                autoCancelTimerRef.current = null;
            }
        };
    }, []);

    const handleShowAlert = () => {
        setShowAlert(true);
        if (alertTimeout.current) {
            clearTimeout(alertTimeout.current);
        }
        alertTimeout.current = setTimeout(() => {
            setShowAlert(false);
        }, 5000);
    };

    /** File picker for input (.txt) */
    const pickInputFile = async () => {
        const selected = await openDialog({
            multiple: false,
            directory: false,
            filters: [{ name: "Text", extensions: ["txt", "list"] }],
        });
        if (typeof selected === "string") {
            form.setFieldValue("filePath", selected);
            await validatePaths();
        }
    };

    /** Directory picker for output */
    const pickOutputDir = async () => {
        const selected = await openDialog({ multiple: false, directory: true });
        if (typeof selected === "string") {
            form.setFieldValue("directory", selected);
            await validatePaths();
        }
    };

    /** Validate inputs and produce friendly errors */
    const validatePaths = useCallback(async () => {
        setFriendlyError(null);
        setCanRun(false);

        const input = form.values.filePath.trim();
        const outdir = form.values.directory.trim();

        if (!input || !outdir) return;

        // input file exists?
        const fileExists = await exists(input);
        if (!fileExists) {
            setFriendlyError(`File not found: ${input}`);
            return;
        }

        // block obvious binary (e.g., PNG) up front
        const looksText = await isProbablyTextFile(input);
        if (!looksText) {
            setFriendlyError("Unsupported input type. Please select a plain text (.txt) file containing URLs.");
            return;
        }

        // readable + not empty?
        try {
            const content = await readTextFile(input);
            if (!content || content.trim().length === 0) {
                setFriendlyError("Input file is empty");
                return;
            }
        } catch {
            setFriendlyError("Unreadable file (permission denied)");
            return;
        }

        // output dir exists?
        const dirExists = await exists(outdir);
        if (!dirExists) {
            setFriendlyError(`Output folder not found: ${outdir}`);
            return;
        }

        // block same location (common slip)
        try {
            const inputDir = await basename(input);
            const outDirName = await basename(outdir);
            if (input.startsWith(outdir)) {
                setFriendlyError("Input file and output folder cannot be the same location.");
                return;
            }
            // also block if literally equal (unlikely but safe)
            if (input === outdir || inputDir === outDirName) {
                setFriendlyError("Input file and output folder cannot be the same location.");
                return;
            }
        } catch {
            // ignore
        }

        setFriendlyError(null);
        setCanRun(true);
    }, [form.values.filePath, form.values.directory]);

    useEffect(() => {
        // re-validate on changes
        validatePaths();
    }, [form.values.filePath, form.values.directory, validatePaths]);

    // Handles streaming output
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => (prevOutput ? prevOutput + "\n" : "") + data);
    }, []);

    // Helper: send SIGTERM to PID (for auto-cancel)
    const killProcess = useCallback(async (thePid: string) => {
        try {
            if (!thePid) return;
            const cmd = new ShellCommand("kill", ["-15", thePid]);
            await cmd.execute();
            setOutput((prev) =>
                prev
                    ? prev + `\nAuto-cancel: sent SIGTERM to PID ${thePid}.`
                    : `Auto-cancel: sent SIGTERM to PID ${thePid}.`
            );
        } catch {
            // best-effort
        }
    }, []);

    // Termination handler with friendly errors + results detection
    const handleProcessTermination = useCallback(
        async ({ code, signal }: { code: number; signal: number }) => {
            // clear any pending auto-cancel timer
            if (autoCancelTimerRef.current) {
                clearTimeout(autoCancelTimerRef.current);
                autoCancelTimerRef.current = null;
            }

            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");

                // Try to find a report to open
                try {
                    const outdir = form.values.directory.trim();
                    const indexHtml = await join(outdir, "index.html");
                    const reportHtml = await join(outdir, "report.html");

                    const hasIndex = await exists(indexHtml);
                    const hasReport = !hasIndex && (await exists(reportHtml));

                    if (hasIndex) setResultsPath(indexHtml);
                    else if (hasReport) setResultsPath(reportHtml);
                    else setResultsPath(outdir);

                    setFriendlyError(null);
                } catch {
                    // ignore best-effort report discovery
                }
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                // Friendly mapping using raw output
                const raw = (output || "").toLowerCase();
                if (/permission denied/.test(raw)) setFriendlyError("Unreadable file (permission denied)");
                else if (/no such file|cannot open|not found/.test(raw))
                    setFriendlyError(`File not found: ${form.values.filePath}`);
                else if (/empty file|zero length/.test(raw)) setFriendlyError("Input file is empty");
                else if (/unicode|decode|invalid start byte/.test(raw))
                    setFriendlyError("Unsupported input type. Please use a plain text (.txt) file.");
                else setFriendlyError("Execution failed. Please check inputs and try again.");
            }

            setPid(""); // Clear PID
            setLoading(false); // Cancel overlay
            setAllowSave(true); // Allow save after finalised
            setHasSaved(false); // Reset save status
        },
        [handleProcessData, form.values.directory, form.values.filePath, output]
    );

    // Actions taken after saving the output
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * Handles form submission, executes the EyeWitness tool, and updates the state.
     */
    const onSubmit = async (values: FormValuesType) => {
        setAllowSave(false);
        setLoading(true);
        setFriendlyError(null);
        setResultsPath(null);
        setOutput("");

        // final preflight validation
        await validatePaths();
        if (!canRun) {
            setLoading(false);
            return;
        }

        const args = [
            "-f",
            values.filePath,
            "--web",
            "-d",
            values.directory,
            "--timeout",
            `${values.timeout}`,
            "--no-prompt",
        ];

        CommandHelper.runCommandGetPidAndOutput("eyewitness", args, handleProcessData, handleProcessTermination)
            .then(({ pid, output }) => {
                setPid(pid);
                pidRef.current = pid; // track for auto-cancel
                setOutput(output);
            })
            .catch((error) => {
                setLoading(false);
                setFriendlyError("Execution failed. Please try again.");
                setOutput(`Error: ${error.message}`);
            });

        // NEW: schedule auto-cancel after a safe max runtime
        if (autoCancelTimerRef.current) clearTimeout(autoCancelTimerRef.current);
        autoCancelTimerRef.current = window.setTimeout(async () => {
            if (pidRef.current) {
                setFriendlyError(`Run exceeded ${AUTO_CANCEL_MINUTES} minutes and was auto-cancelled.`);
                await killProcess(pidRef.current);
            }
        }, AUTO_CANCEL_MINUTES * 60 * 1000);
    };

    /**
     * Clears the output data and resets the save state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
        setFriendlyError(null);
        setResultsPath(null);
    }, []);

    // Simple clean summary (optional, additive)
    const summary = useMemo(() => (output ? parseSummary(output) : null), [output]);

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
                ></InstallationModal>
            )}
            <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                {LoadingOverlayAndCancelButton(loading, pid)}
                <Stack>
                    <Group position="right">
                        {!showAlert && (
                            <Button onClick={handleShowAlert} size="xs" variant="outline" color="gray">
                                Show Disclaimer
                            </Button>
                        )}
                    </Group>
                    {showAlert && (
                        <Alert title="Warning: Potential Risks" color="red">
                            This tool is used to perform website enumeration, use with caution and only on targets you
                            own or have explicit permission to test.
                        </Alert>
                    )}

                    <p>{description}</p>

                    {/* Input file with picker */}
                    <Group grow>
                        <TextInput
                            label={"Enter the file name or path containing URLs:"}
                            placeholder={"Example: /home/kali/Desktop/filename.txt"}
                            required
                            {...form.getInputProps("filePath")}
                            onBlur={validatePaths}
                        />
                        <Button variant="outline" mt={24} onClick={pickInputFile}>
                            Choose File
                        </Button>
                    </Group>

                    {/* Output folder with picker */}
                    <Title order={5} mt="md">
                        Output folder
                    </Title>
                    <Group grow>
                        <TextInput
                            label={
                                "Enter the directory name where you want to save screenshots or define path of directory:"
                            }
                            placeholder={"Example: /home/kali/Desktop"}
                            required
                            {...form.getInputProps("directory")}
                            onBlur={validatePaths}
                        />
                        <Button variant="outline" mt={24} onClick={pickOutputDir}>
                            Choose Folder
                        </Button>
                    </Group>

                    <TextInput
                        label={"Timeout (seconds)"}
                        placeholder={"e.g. 20"}
                        required
                        {...form.getInputProps("timeout")}
                    />

                    {friendlyError && (
                        <Alert color="red" mt="sm">
                            {friendlyError}
                        </Alert>
                    )}

                    {/* Optional clean summary card */}
                    {output && !friendlyError && summary && (
                        <Card withBorder radius="md" padding="md">
                            <Title order={5} mb="sm">
                                Summary
                            </Title>
                            <Table withTableBorder withColumnBorders>
                                <Table.Tbody>
                                    {Object.entries(summary).map(([k, v]) => {
                                        if (!v) return null;
                                        return (
                                            <Table.Tr key={k}>
                                                <Table.Td width="30%">
                                                    <Text fw={600}>{k}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text style={{ whiteSpace: "pre-wrap" }}>{v}</Text>
                                                </Table.Td>
                                            </Table.Tr>
                                        );
                                    })}
                                </Table.Tbody>
                            </Table>
                        </Card>
                    )}

                    {/* Save, Run, Open results */}
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}

                    <Button type={"submit"} disabled={!canRun}>
                        Scan
                    </Button>
                    {resultsPath && (
                        <Button
                            variant="light"
                            onClick={() => shellOpen(resultsPath)}
                            title="Open EyeWitness results"
                            mt="sm"
                        >
                            Open results
                        </Button>
                    )}

                    {/* Raw output console */}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}
export default Eyewitness;
