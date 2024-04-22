import { useState } from "react";
import { Button, Checkbox, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { UserGuide } from "../UserGuide/UserGuide";

// Define title and user guide description for the Nikto tool
const title = "Nikto";
const description_userguide =
    "Nikto is a powerful web server scanner that can perform comprehensive tests against web servers for multiple items.\n" +
    "How to use this Nikto tool:\n" +
    "- Provide the target URL or IP address to scan.\n" +
    "- Start the scan to gather information about potential vulnerabilities and misconfigurations.\n" +
    "- Review the scan output to identify any security issues.\n";

// Define the type for form values
interface FormValuesType {
    TargetURL: string;
    sslScan: boolean;
}

// Define the Nikto component
const Nikto = () => {
    // Initialize state variables
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [sslScan, setSslScan] = useState(false);

    // Initialize form state using the useForm hook
    let form = useForm<FormValuesType>({
        initialValues: {
            TargetURL: "",
            sslScan: false,
        },
    });

    // Function to handle form submission
    const onSubmit = async (values: FormValuesType) => {
        // Set loading state to true and disallow output saving
        setLoading(true);
        setAllowSave(false);

        // Execute Nikto command with provided target URL
        try {
            // Adjusting the command arguments based on checkbox state for SSL scanning
            const args = ["-h", values.TargetURL];
            if (values.sslScan) {
                args.push("-ssl"); // Add -ssl option for SSL scanning
            }
            const commandOutput = await CommandHelper.runCommand("nikto", args);
            // Update output state with command output
            setOutput(commandOutput);
        } catch (error: any) {
            setOutput(`Error: ${error.message}`);
        } finally {
            // Set loading state to false and allow output saving
            setLoading(false);
            setAllowSave(true);
        }
    };

    // Function to handle completion of output saving
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    // Function to clear command output
    const clearOutput = () => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    };

    // Render component
    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label="Target URL" required {...form.getInputProps("TargetURL")} />
                <Checkbox
                    label="SSL Scan"
                    checked={sslScan}
                    onChange={(event) => setSslScan(event.currentTarget.checked)}
                />
                <Button type="submit" disabled={loading}>
                    Start Nikto Scan
                </Button>
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Nikto;
