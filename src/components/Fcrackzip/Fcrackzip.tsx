import { Button, Stack, TextInput, NativeSelect, Checkbox, Alert, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useCallback, useState, useRef } from "react";
import { tempDir, join } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/plugin-shell";
import { open } from "@tauri-apps/plugin-dialog";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import InstallationModal from "../InstallationModal/InstallationModal";

// Define the form values interface
interface FormValuesType {
    dictionary: string;
    zip: string;
    minLength?: number;
    maxLength?: number;
    charSet: string;
}

/**
 * Fcrackzip component for cracking password-protected zip files.
 * @returns {JSX.Element} The Fcrackzip component.
 */
const Fcrackzip = () => {
    // Component state variables
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [attackMethod, setAttackmethod] = useState("Dictionary");
    const [checkedUnzip, setCheckedUnzip] = useState(true);
    const [pid, setPid] = useState("");
    const [useCharsetUppercase, setCharsetUppercase] = useState(false);
    const [useCharsetLowercase, setCharsetLowercase] = useState(false);
    const [useCharsetNumeric, setCharsetNumeric] = useState(false);
    const [checkedVerbose, setCheckedVerbose] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [showAlert, setShowAlert] = useState(true);
    const alertTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dictionaryLinkRef = useRef<string | null>(null);

    // Define the attack methods
    const methods = ["Dictionary", "BruteForce"];

    // Component title
    const title = "Fcrackzip";

    // Description of the component
    const description_guide = "Fcrackzip is a tool for cracking the password of a protected zip file.";

    // Additional props for the RenderComponent
    const steps =
        "Step 1: Input path of the zip file.\n" +
        "Step 2: Select an Attack Mode (Dictionary or Brute Force)\n" +
        "Step 3: You can save output by checking 'Save Output to File'\n" +
        "Step 4: Click start cracking!";

    // Link to the tutorial
    const tutorial = "https://docs.google.com/document/d/1m8kmNbdI3uq5Qzxaw7K3bg9b1lfOXpWC_z4_jR_rG7M/edit?tab=t.0";

    // Link to the source code
    const sourceLink = "https://www.kali.org/tools/fcrackzip/";

    const isDictionary = attackMethod === "Dictionary";
    const isBruteForce = attackMethod === "BruteForce";
    const dependencies = ["fcrackzip"];

    // Initialize form hook
    const form = useForm({
        initialValues: {
            dictionary: "",
            zip: "",
            minLength: 1,
            maxLength: 3,
            charSet: "",
        },

        validate: {
            minLength: (value, values) => {
                if (attackMethod !== "BruteForce") return null;

                const str = String(value).trim();

                if (str === "") return "Minimum length is required";
                if (!/^\d+$/.test(str)) return "Minimum length must be a positive whole number";
                if (parseInt(str, 10) < 1) return "Minimum length must be at least 1";
                if (values.maxLength && parseInt(str, 10) > Number(values.maxLength)) {
                    return "Minimum length must be less than or equal to maximum length";
                }

                return null;
            },

            maxLength: (value, values) => {
                if (attackMethod !== "BruteForce") return null;

                const str = String(value).trim();

                if (str === "") return "Maximum length is required";
                if (!/^\d+$/.test(str)) return "Maximum length must be a positive whole number";
                if (parseInt(str, 10) < 1) return "Maximum length must be at least 1";

                if (values.minLength && parseInt(str, 10) < Number(values.minLength)) {
                    return "Maximum length must be greater than or equal to minimum length";
                }

                return null;
            },
        },
    });

    // Open a file picker to select a ZIP file.
    const pickZipFile = async () => {
        try {
            const selected = await open({
                title: "Select ZIP File",
                multiple: false,
                directory: false,
                filters: [{ name: "ZIP Files", extensions: ["zip"] }],
            });

            if (typeof selected === "string") {
                form.setFieldValue("zip", selected);
            }
        } catch (error) {
            console.error("Failed to select ZIP file:", error);
        }
    };

    // Open a file picker to select a dictionary file.
    const pickDictionaryFile = async () => {
        try {
            const selected = await open({
                title: "Select Dictionary File",
                multiple: false,
                directory: false,
            });

            if (typeof selected === "string") {
                form.setFieldValue("dictionary", selected);
            }
        } catch (error) {
            console.error("Failed to select dictionary file:", error);
        }
    };

    // Check if the command is available and set the state variables accordingly.
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

        alertTimeout.current = setTimeout(() => {
            setShowAlert(false);
        }, 5000);

        return () => {
            if (alertTimeout.current) {
                clearTimeout(alertTimeout.current);
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

    /**
     * Callback function to handle process data.
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + data);
    }, []);

    const createShortDictionaryLink = async (dictionaryPath: string): Promise<string> => {
        const temporaryDirectory = await tempDir();

        const linkName = `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
        const linkPath = await join(temporaryDirectory, linkName);

        if (new TextEncoder().encode(linkPath).length > 40) {
            throw new Error("Could not generate a temporary dictionary path within Fcrackzip's 40-byte limit.");
        }

        const command = Command.create("bash", [
            "-c",
            'target=$(realpath -e -- "$1") || exit 1; if [ ! -f "$target" ] || [ ! -r "$target" ]; then echo "Dictionary must be a readable file." >&2; exit 1; fi; ln -s -- "$target" "$2"',
            "ddt-create-link",
            dictionaryPath,
            linkPath,
        ]);

        const result = await command.execute();

        if (result.code !== 0) {
            throw new Error(result.stderr.trim() || "Failed to create temporary dictionary link.");
        }

        return linkPath;
    };

    const cleanupDictionaryLink = useCallback(async () => {
        const linkPath = dictionaryLinkRef.current;

        if (!linkPath) return;

        dictionaryLinkRef.current = null;

        try {
            const command = Command.create("bash", ["-c", 'rm -f -- "$1"', "ddt-cleanup", linkPath]);

            const result = await command.execute();

            if (result.code !== 0) {
                console.error("Failed to remove temporary dictionary link:", result.stderr);
            }
        } catch (error) {
            console.error("Failed to remove temporary dictionary link:", error);
        }
    }, []);

    /**
     * Callback function to handle process termination.
     */
    const handleProcessTermination = useCallback(() => {
        setPid("");
        setLoading(false);

        void cleanupDictionaryLink();

        setAllowSave(true);
        setHasSaved(false);
    }, [cleanupDictionaryLink]);

    /**
     * Function to handle form submission.
     * @param {FormValuesType} values - The form values.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);

        const args = [];
        if (attackMethod === "Dictionary") {
            args.push("-D", "-v", "-p", values.dictionary.trim(), "-u");
        } else if (attackMethod === "BruteForce") {
            args.push("-b");

            if (checkedVerbose) args.push("-v");

            let charSet = "";

            if (useCharsetLowercase) charSet += "a";
            if (useCharsetUppercase) charSet += "A";
            if (useCharsetNumeric) charSet += "1";

            if (charSet) args.push("-c", charSet);

            if (values.maxLength && values.minLength) {
                args.push("-l", `${values.minLength}-${values.maxLength}`);
            }

            if (checkedUnzip) args.push("-u");
        }

        if (values.zip) {
            args.push(values.zip);
        }

        setOutput("");

        try {
            const executionArgs = [...args];

            if (attackMethod === "Dictionary") {
                const dictionaryPath = values.dictionary.trim();

                if (new TextEncoder().encode(dictionaryPath).length > 40) {
                    const shortDictionaryPath = await createShortDictionaryLink(dictionaryPath);

                    dictionaryLinkRef.current = shortDictionaryPath;

                    const dictionaryPathIndex = executionArgs.indexOf("-p");

                    if (dictionaryPathIndex === -1 || !executionArgs[dictionaryPathIndex + 1]) {
                        throw new Error("Dictionary path argument was not found.");
                    }

                    executionArgs[dictionaryPathIndex + 1] = shortDictionaryPath;
                }
            }

            const command = Command.create("fcrackzip", executionArgs);

            let processFinished = false;
            let commandOutput = "";

            const stripAnsi = (data: string) =>
                data.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9- A-ORZcf-nqry=><]/g, "");

            // Capture output while displaying it in the console.
            const appendCommandOutput = (data: string) => {
                const cleaned = stripAnsi(data);

                commandOutput += cleaned;
                handleProcessData(cleaned);
            };

            command.stdout.on("data", (data) => {
                appendCommandOutput(data.toString());
            });

            command.stderr.on("data", (data) => {
                appendCommandOutput(data.toString());
            });

            // Check the result after Fcrackzip finishes.
            command.on("close", ({ code, signal }) => {
                processFinished = true;

                if (signal) {
                    handleProcessData(
                        signal === 15
                            ? "\n\nSearch cancelled before completion. No final result is available."
                            : `\n\nSearch stopped by signal ${signal}.`,
                    );
                } else if (/no usable files found/i.test(commandOutput)) {
                    handleProcessData("\n\nThe ZIP may be unencrypted, unsupported, or invalid.");
                } else if (/PASSWORD FOUND!!!!/i.test(commandOutput)) {
                    handleProcessData("\n\nPassword found and verified successfully.");
                } else if (/possible pw found:/i.test(commandOutput)) {
                    handleProcessData(
                        "\n\nPossible password candidate(s) found. Enable 'Show cracked password' to verify candidates.",
                    );
                } else if (code === 0) {
                    const message =
                        attackMethod === "Dictionary"
                            ? "\n\nNo matching password was found in the selected dictionary."
                            : "\n\nNo matching password was found within the selected character set and length range.";

                    handleProcessData(message);
                } else {
                    handleProcessData(
                        `\n\nFcrackzip failed with exit code ${code ?? "unknown"}. Check the ZIP file, dictionary file, and output above.`,
                    );
                }

                handleProcessTermination();
            });

            command.on("error", (error) => {
                handleProcessData(`\nCommand error: ${String(error)}`);
            });

            const child = await command.spawn();

            if (!processFinished) {
                setPid(child.pid.toString());
            }
        } catch (error) {
            await cleanupDictionaryLink();

            setOutput((prevOutput) => prevOutput + `\nFailed to start Fcrackzip: ${String(error)}`);

            setPid("");
            setLoading(false);
            setAllowSave(true);
        }
    };

    /**
     * Function to clear output.
     */
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
            description={description_guide}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description_guide}
                    dependencies={dependencies}
                ></InstallationModal>
            )}

            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid)}

                    <Group position="right">
                        {!showAlert && (
                            <Button onClick={handleShowAlert} size="xs" variant="outline" color="gray">
                                Show Disclaimer
                            </Button>
                        )}
                    </Group>

                    {showAlert && (
                        <Alert title="Warning: Potential Risks" color="red">
                            This tool is used to crack passwords, use with caution and only on files you own or have
                            explicit permission to test.
                        </Alert>
                    )}

                    {/* ZIP file input with Browse button */}
                    <Group spacing="sm" style={{ alignItems: "flex-end" }}>
                        <TextInput
                            style={{ flex: 1 }}
                            label="Zip file"
                            placeholder="Specify the zip file."
                            required
                            {...form.getInputProps("zip")}
                        />
                        <Button type="button" variant="outline" onClick={pickZipFile}>
                            Browse
                        </Button>
                    </Group>

                    <NativeSelect
                        value={attackMethod}
                        onChange={(e) => setAttackmethod(e.target.value)}
                        label="Attack Method"
                        data={methods}
                        required
                    />

                    {isDictionary && (
                        /* Dictionary input with Browse button */
                        <Group spacing="sm" style={{ alignItems: "flex-end" }}>
                            <TextInput
                                style={{ flex: 1 }}
                                label="Dictionary"
                                placeholder="Path file of the dictionary."
                                required
                                {...form.getInputProps("dictionary")}
                            />
                            <Button type="button" variant="outline" onClick={pickDictionaryFile}>
                                Browse
                            </Button>
                        </Group>
                    )}

                    {isBruteForce && (
                        <>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <span style={{ marginRight: "10px" }}>Charset List:</span>

                                <Checkbox
                                    label="Use Lowercase Character"
                                    checked={useCharsetLowercase}
                                    onChange={(e) => setCharsetLowercase(e.currentTarget.checked)}
                                />

                                <span style={{ margin: "0 10px" }}></span>

                                <Checkbox
                                    label="Use Uppercase Character"
                                    checked={useCharsetUppercase}
                                    onChange={(e) => setCharsetUppercase(e.currentTarget.checked)}
                                />

                                <span style={{ margin: "0 10px" }}></span>

                                <Checkbox
                                    label="Use Numeric Character"
                                    typeof="number"
                                    checked={useCharsetNumeric}
                                    onChange={(e) => setCharsetNumeric(e.currentTarget.checked)}
                                />
                            </div>

                            <div style={{ display: "flex", alignItems: "center" }}>
                                <TextInput
                                    label="Min Length"
                                    type="number"
                                    required
                                    {...form.getInputProps("minLength")}
                                />

                                <span style={{ margin: "0 10px" }}></span>

                                <TextInput
                                    label="Max Length"
                                    type="number"
                                    required
                                    {...form.getInputProps("maxLength")}
                                />
                            </div>

                            <Checkbox
                                label="Verbose Mode: Generates extended information of files inside zip. (eg. name, size, etc.)"
                                checked={checkedVerbose}
                                onChange={(e) => setCheckedVerbose(e.currentTarget.checked)}
                            />

                            <Checkbox
                                label="Show cracked password."
                                checked={checkedUnzip}
                                onChange={(e) => setCheckedUnzip(e.currentTarget.checked)}
                            />
                        </>
                    )}

                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}

                    <Button type="submit">Start Cracking!</Button>

                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Fcrackzip;
