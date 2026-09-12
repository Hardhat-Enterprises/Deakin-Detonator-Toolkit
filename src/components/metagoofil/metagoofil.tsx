import { Button, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect, useRef } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";

/**
 * Represents the form values for the Metagoofil component.
 */
interface FormValuesType {
    webName: string;
    searchMax: string;
    fileLimit: string;
    fileType: string;
    filePath: string;
}

/**
 * The Metagoofil component.
 * @returns The Metagoofil component.
 */
function Metagoofil() {
    // Component State Variables.
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [customConfig, setCustomConfig] = useState(false);
    const [downloadConfig, setDownloadConfig] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [loadingModal, setLoadingModal] = useState(true);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    /**
     * Used to remember whether Metagoofil received a search-provider error.
     *
     * A ref is used instead of normal state because process output and process
     * termination can happen very quickly. This ensures that the termination
     * callback always sees the latest error state.
     */
    const searchProviderErrorRef = useRef(false);

    // Component Constants.
    const title = "Metagoofil";

    const description =
        "Metagoofil is an information gathering tool designed for extracting metadata " +
        "from public documents (pdf, doc, xls, ppt, docx, pptx, xlsx) that belong to a target company.";

    const steps =
        "Step 1: Enter a website/domain for the tool to search.\n" +
        "Step 2: Enter the required file type, for example pdf.\n" +
        "Step 3: Enable Manual Configuration if you want to change the maximum number of results.\n" +
        "Step 4: Enable Download Files if you want Metagoofil to download discovered files.\n" +
        "Step 5: Click Scan to start the Metagoofil operation.\n" +
        "Step 6: View the Output block below to see the results or any search-provider errors.";

    const sourceLink = "https://www.kali.org/tools/metagoofil/";

    const tutorial = "https://docs.google.com/document/d/10RQ82QbVrjiS6-MdZpbV3r32dhhPSMtD0c6nQOP3RoY/edit?usp=sharing";

    const dependencies = ["metagoofil"];

    /**
     * Form hook to handle form input.
     */
    const form = useForm<FormValuesType>({
        initialValues: {
            webName: "",
            searchMax: "",
            fileLimit: "",
            fileType: "",
            filePath: "",
        },

        validate: {
            webName: (value) => (value.trim().length === 0 ? "Please enter a website/domain." : null),

            fileType: (value) => (value.trim().length === 0 ? "Please enter a file type." : null),

            searchMax: (value) => {
                if (!value) {
                    return null;
                }

                const number = Number(value);

                if (!Number.isInteger(number) || number <= 0) {
                    return "Number of results must be a positive whole number.";
                }

                return null;
            },

            fileLimit: (value) => {
                if (!value) {
                    return null;
                }

                const number = Number(value);

                if (!Number.isInteger(number) || number <= 0) {
                    return "Download limit must be a positive whole number.";
                }

                return null;
            },
        },
    });

    /**
     * Check whether Metagoofil is installed.
     */
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
     * Normalises the domain entered by the user.
     *
     * Examples:
     *
     * https://www.nasa.gov/documents -> nasa.gov
     * http://nasa.gov                -> nasa.gov
     * www.nasa.gov                   -> nasa.gov
     * nasa.gov                       -> nasa.gov
     */
    const normalizeDomain = (domain: string): string => {
        return domain
            .trim()
            .replace(/^https?:\/\//i, "")
            .replace(/^www\./i, "")
            .replace(/\/.*$/, "");
    };

    /**
     * Normalises the file type entered by the user.
     *
     * Examples:
     *
     * .pdf -> pdf
     * PDF  -> pdf
     * pdf  -> pdf
     */
    const normalizeFileType = (fileType: string): string => {
        return fileType.trim().replace(/^\./, "").toLowerCase();
    };

    /**
     * Handles output received from the Metagoofil child process.
     */
    const handleProcessData = useCallback((data: string) => {
        let displayData = data;

        /**
         * Metagoofil relies on automated Google searches.
         *
         * Google may rate-limit these requests and return HTTP 429.
         * Detect this situation and clearly inform the user that it is
         * an external search-provider restriction.
         */
        if (
            data.includes("HTTP Error 429") ||
            data.includes("429: Too Many Requests") ||
            data.includes("Too Many Requests") ||
            data.includes("Google is blocking you")
        ) {
            searchProviderErrorRef.current = true;

            displayData =
                data +
                "\n\n[DDT] Search provider rate limit detected." +
                "\n[DDT] Google rejected Metagoofil's automated search request (HTTP 429)." +
                "\n[DDT] This is a Metagoofil/search-provider restriction rather than a DDT execution error." +
                "\n[DDT] Please wait before trying the search again.";
        }

        /**
         * Metagoofil may also return zero results without explicitly returning
         * HTTP 429. Warn the user that zero results do not always mean that
         * the target website contains no matching documents.
         */
        if (!searchProviderErrorRef.current && /Results:\s*0\s+\.\w+\s+files found/i.test(data)) {
            displayData =
                data +
                "\n\n[DDT] No matching files were returned by Metagoofil." +
                "\n[DDT] This can occur because modern search engines restrict automated searches." +
                "\n[DDT] Zero results do not necessarily mean the target domain contains no matching files.";
        }

        setOutput((prevOutput) => prevOutput + "\n" + displayData);
        setAllowSave(true);
    }, []);

    /**
     * Handles termination of the Metagoofil process.
     */
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            /**
             * Metagoofil can sometimes catch a search-provider error internally
             * and still exit with code 0.
             *
             * Therefore we check searchProviderErrorRef before displaying
             * "Process completed successfully".
             */
            if (code === 0) {
                if (searchProviderErrorRef.current) {
                    handleProcessData(
                        "\n[DDT] Metagoofil finished, but the search request was blocked by the search provider."
                    );
                } else {
                    handleProcessData("\nProcess completed successfully.");
                }
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }

            // Clear the running process PID.
            setPid("");

            // Remove the loading overlay.
            setLoading(false);

            // Allow the completed output to be saved.
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData],
    );

    /**
     * Handles submission of the Metagoofil form.
     */
    const onSubmit = async (values: FormValuesType) => {
        // Reset previous provider-error status.
        searchProviderErrorRef.current = false;

        // Activate loading state.
        setLoading(true);

        // Reset output from any previous execution.
        setOutput("");

        // Disable saving while the new process is running.
        setAllowSave(false);
        setHasSaved(false);

        /**
         * Normalise user input before constructing the command.
         */
        const normalizedDomain = normalizeDomain(values.webName);
        const normalizedFileType = normalizeFileType(values.fileType);

        /**
         * Additional validation after normalisation.
         */
        if (!normalizedDomain) {
            setOutput("Please enter a valid website/domain.");
            setLoading(false);
            return;
        }

        if (!normalizedFileType) {
            setOutput("Please enter a valid file type.");
            setLoading(false);
            return;
        }

        /**
         * Construct Metagoofil arguments.
         *
         * -d = target domain
         * -t = file type
         * -e = delay between searches
         *
         * A 60-second delay is used to reduce the chance of triggering
         * search-provider rate limiting.
         */
        const args = ["-d", normalizedDomain, "-t", normalizedFileType, "-e", "60"];

        /**
         * Add the maximum number of search results if the user enabled
         * manual configuration and supplied a value.
         */
        if (customConfig && values.searchMax) {
            args.push("-l", values.searchMax.trim());
        }

        /**
         * Configure downloading if the user enabled Download Files.
         */
        if (downloadConfig) {
            if (values.fileLimit) {
                args.push("-n", values.fileLimit.trim());
            }

            if (values.filePath) {
                args.push("-o", values.filePath.trim(), "-w");
            }
        }

        /**
         * Display the cleaned search parameters.
         *
         * This helps debugging while avoiding exposing shell execution logic.
         */
        setOutput(
            `[DDT] Starting Metagoofil scan...\n` +
                `[DDT] Domain: ${normalizedDomain}\n` +
                `[DDT] File type: ${normalizedFileType}\n`
        );

        try {
            /**
             * Execute Metagoofil using CommandHelper.
             */
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "metagoofil",
                args,
                handleProcessData,
                handleProcessTermination,
            );

            // Store process ID so the process can be cancelled.
            setPid(result.pid);

            /**
             * Some CommandHelper implementations return initial output here
             * while later output arrives through handleProcessData.
             *
             * Only replace the output if result.output contains useful data.
             */
            if (result.output && result.output.trim().length > 0) {
                setOutput((previousOutput) => previousOutput + "\n" + result.output);
            }

            console.log("Metagoofil PID:", result.pid);
        } catch (e: any) {
            const errorMessage =
                e instanceof Error ? e.message : "An unknown error occurred while executing Metagoofil.";

            /**
             * Detect 429 errors that may be returned through the promise
             * rejection instead of process stdout/stderr.
             */
            if (
                errorMessage.includes("HTTP Error 429") ||
                errorMessage.includes("429: Too Many Requests") ||
                errorMessage.includes("Too Many Requests") ||
                errorMessage.includes("Google is blocking you")
            ) {
                searchProviderErrorRef.current = true;

                setOutput(
                    `${errorMessage}\n\n` +
                        "[DDT] Search provider rate limit detected.\n" +
                        "[DDT] Google rejected Metagoofil's automated search request (HTTP 429).\n" +
                        "[DDT] This is a Metagoofil/search-provider restriction rather than a DDT execution error.\n" +
                        "[DDT] Please wait before trying again."
                );
            } else {
                setOutput(`An error occurred while running Metagoofil:\n${errorMessage}`);
            }

            // Process is no longer running.
            setPid("");

            // Deactivate loading state.
            setLoading(false);

            // Allow error output to be saved.
            setAllowSave(true);
            setHasSaved(false);
        }
    };

    /**
     * Clears the output state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
        searchProviderErrorRef.current = false;
    }, []);

    /**
     * Called after output has successfully been saved.
     */
    const handleSaveComplete = useCallback(() => {
        setHasSaved(true);
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
                        label="Manual Configuration"
                        checked={customConfig}
                        onChange={(e) => setCustomConfig(e.currentTarget.checked)}
                    />

                    <Switch
                        size="md"
                        label="Download Files"
                        checked={downloadConfig}
                        onChange={(e) => setDownloadConfig(e.currentTarget.checked)}
                    />

                    <TextInput
                        label="Enter the website for search"
                        placeholder="Example: nasa.gov"
                        required
                        {...form.getInputProps("webName")}
                    />

                    <TextInput
                        label="Enter your file type"
                        placeholder="Example: pdf"
                        required
                        {...form.getInputProps("fileType")}
                    />

                    {customConfig && (
                        <TextInput
                            label="Enter number of results (default 100)"
                            placeholder="Example: 10"
                            {...form.getInputProps("searchMax")}
                        />
                    )}

                    {downloadConfig && (
                        <>
                            <TextInput
                                label="Enter the value for Download file limit"
                                placeholder="Example: 10"
                                {...form.getInputProps("fileLimit")}
                            />

                            <TextInput
                                label="Enter file path"
                                placeholder="Example: /home/kali/Desktop/metagoofil-output"
                                {...form.getInputProps("filePath")}
                            />
                        </>
                    )}

                    <Button type="submit" disabled={loading}>
                        Scan
                    </Button>

                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}

                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}

export default Metagoofil;
