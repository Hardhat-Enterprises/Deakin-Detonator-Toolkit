import { Button, Stack, TextInput, Checkbox, MultiSelect, Grid } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Interface representing the form values for the TestSSL component.
 * This interface defines the structure of the form data used to configure
 * the SSL/TLS scan options.
 */
interface FormValuesType {
    target: string;
    testProtocols: boolean;
    testHttpHeaders: boolean;
    testServerPreferences: boolean;
    testForwardSecrecy: boolean;
    testVulnerabilities: boolean;
    severityLevel: string[];
    sneakyMode: boolean;
    idsFriendly: boolean;
}

const TestSSL = () => {
    // State variables
    const [loading, setLoading] = useState(false); // Controls loading state of the scan button
    const [output, setOutput] = useState(""); // Stores the command output
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // Indicates if the testssl command is available
    const [allowSave, setAllowSave] = useState(false); // Controls if saving output is allowed
    const [hasSaved, setHasSaved] = useState(false); // Indicates if output has been saved
    const [opened, setOpened] = useState(true); // Controls the visibility of the installation modal
    const [loadingModal, setLoadingModal] = useState(true); // Controls loading state of the installation modal

    // Constants
    const title = "testssl"; // Title of the component
    const description = "testssl is a tool that checks a server's SSL/TLS capabilities and vulnerabilities."; // Description of the tool
    const steps = // Steps to use the tool
        "Step 1: Enter the target website or IP address.\n" +
        "Step 2: Select the desired scan options.\n" +
        "Step 3: Click 'Start Scan' to begin the process.\n" +
        "Step 4: View the output to see the results of the SSL/TLS analysis.";
    const sourceLink = "https://github.com/drwetter/testssl.sh"; // Link to the source code
    const tutorial = ""; // Empty string as per requirement
    const dependencies = ["testssl"]; // Required package for this component

    /**
     * Initialize the form with default values and validation.
     */
    const form = useForm({
        initialValues: {
            target: "",
            testProtocols: false,
            testHttpHeaders: false,
            testServerPreferences: false,
            testForwardSecrecy: false,
            testVulnerabilities: false,
            severityLevel: [],
            sneakyMode: false,
            idsFriendly: false,
        },
        validate: {
            target: (value) => (value.trim().length > 0 ? null : "Target is required"),
        },
    });

    /**
     * Check if the required dependencies are available on component mount.
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
     * Clean the output by removing ANSI color codes and replacing special characters.
     * @param input - The raw output string to be cleaned.
     * @returns The cleaned output string.
     */
    const cleanOutput = (input: string): string => {
        // Remove ANSI color codes
        let cleaned = input.replace(/\x1B\[[0-9;]*[JKmsu]/g, "");

        // Replace special characters
        cleaned = cleaned.replace(/[\u2500-\u257F]/g, "-"); // Replace box drawing characters
        cleaned = cleaned.replace(/[►]/g, ">"); // Replace arrow

        return cleaned;
    };

    /**
     * Handle the process data by cleaning it and updating the output state.
     * @param data - The raw data received from the process.
     */
    const handleProcessData = useCallback((data: string) => {
        const cleanedData = cleanOutput(data);
        setOutput((prevOutput) => prevOutput + cleanedData);
    }, []);

    /**
     * Handle the process termination by updating the output and resetting states.
     * @param code - The exit code of the process.
     */
    const handleProcessTermination = useCallback((code: number) => {
        if (code === 0) {
            setOutput((prevOutput) => prevOutput + "\nScan completed successfully.");
        } else {
            setOutput((prevOutput) => prevOutput + `\nScan terminated with exit code: ${code}`);
        }
        setLoading(false);
        setAllowSave(true);
        setHasSaved(false);
    }, []);

    /**
     * Handle form submission by constructing and executing the testssl command.
     * @param values - The form values containing the scan configuration.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);
        setOutput("");

        const args: string[] = [];

        // Add command-line arguments based on form values
        if (values.testProtocols) args.push("-p");
        if (values.testHttpHeaders) args.push("-h");
        if (values.testServerPreferences) args.push("-s");
        if (values.testForwardSecrecy) args.push("-f");
        if (values.testVulnerabilities) args.push("-U");
        values.severityLevel.forEach((level) => {
            args.push("--severity");
            args.push(level);
        });
        if (values.sneakyMode) args.push("--sneaky");
        if (values.idsFriendly) args.push("--ids-friendly");

        // Add the target at the end of the argument list
        args.push(values.target);

        try {
            const result = await CommandHelper.runCommand("testssl", args);
            handleProcessData(result);
            handleProcessTermination(0);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            handleProcessData(errorMessage);
            handleProcessTermination(1);
        }
    };

    /**
     * Clear the output and reset related states.
     * This function resets the output to an empty string and updates the save-related states.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, []);

    /**
     * Handle the completion of saving the output.
     * This function updates the state to reflect that the output has been saved
     * and prevents further saves until new output is generated.
     */
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
                ></InstallationModal>
            )}
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    <TextInput label="Target (hostname or IP)" required {...form.getInputProps("target")} />
                    <Grid>
                        <Grid.Col span={6}>
                            <Checkbox
                                label="Test Protocols (-p)"
                                {...form.getInputProps("testProtocols", { type: "checkbox" })}
                            />
                            <Checkbox
                                label="Test HTTP Headers (-h)"
                                {...form.getInputProps("testHttpHeaders", { type: "checkbox" })}
                            />
                            <Checkbox
                                label="Test Server Preferences (-s)"
                                {...form.getInputProps("testServerPreferences", { type: "checkbox" })}
                            />
                            <Checkbox
                                label="Test Forward Secrecy (-f)"
                                {...form.getInputProps("testForwardSecrecy", { type: "checkbox" })}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Checkbox
                                label="Test Vulnerabilities (-U)"
                                {...form.getInputProps("testVulnerabilities", { type: "checkbox" })}
                            />
                            <Checkbox
                                label="Sneaky Mode (--sneaky)"
                                {...form.getInputProps("sneakyMode", { type: "checkbox" })}
                            />
                            <Checkbox
                                label="IDS-Friendly Mode (--ids-friendly)"
                                {...form.getInputProps("idsFriendly", { type: "checkbox" })}
                            />
                        </Grid.Col>
                    </Grid>
                    <MultiSelect
                        label="Severity Level (--severity)"
                        data={[
                            { value: "LOW", label: "Low" },
                            { value: "MEDIUM", label: "Medium" },
                            { value: "HIGH", label: "High" },
                            { value: "CRITICAL", label: "Critical" },
                        ]}
                        placeholder="Select severity levels"
                        {...form.getInputProps("severityLevel")}
                    />
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <Button type="submit" loading={loading}>
                        Start Scan
                    </Button>
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default TestSSL;
