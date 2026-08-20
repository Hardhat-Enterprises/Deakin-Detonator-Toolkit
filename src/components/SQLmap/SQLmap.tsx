import { useState, useCallback, useEffect } from "react";
import { Button, Stack, TextInput, Checkbox, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the SQLmap component.
 */
interface FormValuesType {
    targetURL: string;
    detectionLevel: string;
    riskLevel: string;

    // NEW: Allows users to provide a session cookie
    // for authenticated SQLMap scans.
    sessionCookie: string;

    banner: boolean;
    dbs: boolean;
    passwords: boolean;
}

/**
 * The SQLmap component.
 * @returns The SQLmap component.
 */
function SQLmap() {
    // Component state variables
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [pid, setPid] = useState("");

    // Component Constants
    const title = "SQLmap";
    const description =
        "SQLmap is a tool to detect and exploit SQL injection flaws and the taking over of database servers.";

    const steps =
        "Step 1: Provide the target database URL or IP to analyse for vulnerabilities.\n" +
        "Step 2: Start the process.\n" +
        "Step 3: Review the output for further analysis.\n";

    const sourceLink = "https://github.com/sqlmapproject/sqlmap";

    const tutorial =
        "https://docs.google.com/document/d/1O0yp3_vazO2UsnUBcbSyeuYJXq9x7Vcsjjsfw_LLhEc/edit?usp=sharing";

    const dependencies = ["sqlmap"];

    // Form hook to handle form input
    const form = useForm({
        initialValues: {
            targetURL: "",
            detectionLevel: "1",
            riskLevel: "1",

            // NEW:
            // Stores a session cookie such as:
            // PHPSESSID=abc123; security=low
            sessionCookie: "",

            banner: false,
            dbs: false,
            passwords: false,
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

    /**
     * Handles command output.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    /**
     * Handles command termination.
     */
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(
                    `\nProcess terminated with exit code: ${code} and signal code: ${signal}`
                );
            }

            setPid("");
            setLoading(false);
        },
        [handleProcessData]
    );

    /**
     * Handles form submission for SQLMap.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);

        // Base SQLMap arguments
        const args = [
            "-u",
            values.targetURL,
            `--level=${values.detectionLevel}`,
            `--risk=${values.riskLevel}`,
        ];

        // NEW:
        // If a cookie was supplied, pass it to SQLMap.
        // This enables testing authenticated targets.
        if (values.sessionCookie.trim() !== "") {
            args.push(`--cookie=${values.sessionCookie}`);
        }

        if (values.banner) {
            args.push("--banner");
        }

        if (values.dbs) {
            args.push("--dbs");
        }

        if (values.passwords) {
            args.push("--passwords");
        }

        CommandHelper.runCommandGetPidAndOutput(
            "sqlmap",
            [...args],
            handleProcessData,
            handleProcessTermination
        )
            .then(() => {
                setLoading(false);
            })
            .catch((error) => {
                setOutput(`Error: ${error.message}`);
                setLoading(false);
            });
    };

    /**
     * Handles output save completion.
     */
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * Clears command output.
     */
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

                    <TextInput
                        label="Target database URL"
                        required
                        {...form.getInputProps("targetURL")}
                    />

                    {/* NEW:
                        Visible session cookie field requested in
                        Improvement Request #1614.
                        Example:
                        PHPSESSID=abc123; security=low
                    */}
                    <TextInput
                        label="Session Cookie"
                        placeholder="PHPSESSID=abc123; security=low"
                        description="Optional cookie used when scanning authenticated targets"
                        {...form.getInputProps("sessionCookie")}
                    />

                    <Select
                        label="Detection Level"
                        placeholder="Choose detection level (1-5)"
                        {...form.getInputProps("detectionLevel")}
                        data={[
                            { value: "1", label: "1 (Default)" },
                            { value: "2", label: "2" },
                            { value: "3", label: "3" },
                            { value: "4", label: "4" },
                            { value: "5", label: "5" },
                        ]}
                    />

                    <Select
                        label="Risk Level"
                        placeholder="Choose risk level (1-3)"
                        {...form.getInputProps("riskLevel")}
                        data={[
                            { value: "1", label: "1 (Default)" },
                            { value: "2", label: "2" },
                            { value: "3", label: "3" },
                        ]}
                    />

                    <Checkbox
                        label="Retrieve Database Banner"
                        {...form.getInputProps("banner", {
                            type: "checkbox",
                        })}
                    />

                    <Checkbox
                        label="List All Databases"
                        {...form.getInputProps("dbs", {
                            type: "checkbox",
                        })}
                    />

                    <Checkbox
                        label="Retrieve Password Hashes"
                        {...form.getInputProps("passwords", {
                            type: "checkbox",
                        })}
                    />

                    <Button type="submit">Start {title}</Button>

                    {SaveOutputToTextFile_v2(
                        output,
                        allowSave,
                        hasSaved,
                        handleSaveComplete
                    )}

                    <ConsoleWrapper
                        output={output}
                        clearOutputCallback={clearOutput}
                    />
                </Stack>
            </form>
        </RenderComponent>
    );
}

export default SQLmap;
