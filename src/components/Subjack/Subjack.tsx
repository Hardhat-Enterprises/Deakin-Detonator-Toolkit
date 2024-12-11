import { Button, Stack, TextInput } from "@mantine/core";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { RenderComponent } from "../UserGuide/UserGuide";

/**
 * Form values structure for the Subjack component.
 */
interface FormValuesType {
    targetDomain: string;
    wordlist: string;
}

/**
 * Main Subjack component to handle subdomain takeover checks.
 * @returns The Subjack component with form and output.
 */
const Subjack = () => {
    // State variables to manage the component's state
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);

    // Constants for component details like title and description
    const title = "Subjack";
    const description =
        "Subjack is a tool to detect subdomain takeovers. It identifies vulnerable subdomains that could be hijacked.";
    const steps =
        "Step 1: Enter the target domain.\n" +
        "Step 2: Provide the path to your wordlist.\n" +
        "Step 3: Click 'Start Subjack' to begin the scanning process.\n" +
        "Step 4: Analyze the results in the output.";
    const sourceLink = "https://github.com/haccer/subjack";
    const tutorial = "https://github.com/haccer/subjack";
    const dependencies = ["subjack"];

    // Form hook to manage input fields
    const form = useForm<FormValuesType>({
        initialValues: {
            targetDomain: "",
            wordlist: "",
        },
    });

    // Use effect hook to check the availability of necessary commands (Subjack)
    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable);
                setOpened(!isAvailable); // Show installation modal if command is not available
                setLoadingModal(false);
            })
            .catch((error) => {
                console.error("Error checking command availability:", error);
                setLoadingModal(false);
            });
    }, []);

    // Debugging output for raw data
    const debugOutput = useCallback((data: string) => {
        console.log("Raw Subjack Output:", data); // Log the output for debugging
    }, []);

    /**
     * Handles the data processing and output formatting from Subjack.
     * It formats each line of the output and appends the target domain.
     */
    const handleProcessData = useCallback(
        (data: string) => {
            debugOutput(data); // Output the raw data for inspection

            // Return if the data is empty or only spaces
            if (!data.trim()) {
                return;
            }

            // Process the data line by line
            const lines = data.split("\n").filter((line) => line.trim() !== ""); // Filter out empty lines
            const updatedOutput = lines
                .map((line) => {
                    // Clean the line by removing unnecessary characters
                    const cleanLine = line.replace(/[\n\r]+/g, "").trim();

                    // Split the line to extract status and subdomain parts
                    const parts = cleanLine.split(" ").filter(Boolean);

                    // If the line has status and subdomain parts, format it
                    if (parts.length >= 2) {
                        const [status, ...subdomainParts] = parts;

                        // Join the subdomain parts and append the domain
                        const subdomain = subdomainParts.join(" ").trim();
                        const fullFQDN = `${subdomain}.${form.values.targetDomain}`;

                        return `[${status}] ${fullFQDN}`;
                    }

                    // Handle cases where it's not a valid subdomain line
                    if (cleanLine.includes("Process completed")) {
                        return cleanLine;
                    }

                    return `Unprocessed Output: ${cleanLine}`; // Handle any unexpected output
                })
                .join("\n");

            // Update the component's output with the newly processed data
            setOutput((prevOutput) => prevOutput + "\n" + updatedOutput);
        },
        [form.values.targetDomain, debugOutput]
    );

    // Handle process termination
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

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    // Handles the form submission for Subjack scanning
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);

        // Define arguments for the Subjack command
        const args = [
            "-w",
            values.wordlist, // Path to the wordlist
            "-d",
            values.targetDomain, // Target domain
            "-c",
            "/usr/share/subjack/fingerprints.json", // Configuration file
            "-v",
            "-ssl", // SSL flag
        ];

        try {
            // Run the Subjack command and pass the data for processing
            await CommandHelper.runCommandGetPidAndOutput("subjack", args, handleProcessData, handleProcessTermination);
        } catch (error: unknown) {
            // Cast error to Error type for proper message handling
            if (error instanceof Error) {
                setOutput(`Error while running Subjack: ${error.message}`);
            } else {
                setOutput("An unknown error occurred.");
            }
            setLoading(false);
        }
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

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
                    <TextInput label="Target Domain" required {...form.getInputProps("targetDomain")} />
                    <TextInput label="Wordlist Path" required {...form.getInputProps("wordlist")} />
                    <Button type="submit">Start {title}</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Subjack;
