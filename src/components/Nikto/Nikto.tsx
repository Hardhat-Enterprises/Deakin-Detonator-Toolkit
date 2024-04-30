import { useState } from "react";
import { Button, Checkbox, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";

/**
 * Represents the form values for the Nikto component.
 */
interface FormValuesType {
    targetURL: string;
    sslScan: boolean;
}

/**
 * The Nikto component.
 * @returns The Nikto component.
 */
const Nikto = () => {
    // Component state variables
    const [loading, setLoading] = useState(false); // State variable to indicate loading state
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving of output
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if output has been saved
    const [sslScan, setSslScan] = useState(false); // State variable for SSL scanning

    // Component Constants
    const title = "Nikto";
    const description = "Nikto is a powerful web server scanner that can perform comprehensive tests against web servers for multiple items.";
    const steps =
    "Step 1: Provide the target URL or IP address to scan.\n" +
    "Step 2: Start the scan to gather information about potential vulnerabilities and misconfigurations.\n" +
    "Step 3: Review the scan output to identify any security issues.\n";
    const sourceLink = "https://github.com/sullo/nikto"; // Link to the source code 
    const tutorial = "https://github.com/sullo/nikto/wiki"; // Link to the official documentation/tutorial

    // Form hook to handle form input
    let form = useForm({
        initialValues: {
            targetURL: "",
            sslScan: false,
        },
    });

    /**
    * Handles form submission for the Nikto component.
    * @param {FormValuesType} values - The form values containing the target URL and SSL scan option.
    */
    const onSubmit = async (values: FormValuesType) => {
        // Set loading state to true and disallow output saving
        setLoading(true);
        setAllowSave(false);

        // Execute Nikto command with provided target URL
        try {
            // Adjusting the command arguments based on checkbox state for SSL scanning
            const args = ["-h", values.targetURL];
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

    /**
    * Handles the completion of output saving by updating state variables.
    */
    const handleSaveComplete = () => {
        setHasSaved(true); // Set hasSaved state to true
        setAllowSave(false); // Disallow further output saving
    };

    /**
    * Clears the command output and resets state variables related to output saving.
    */
    const clearOutput = () => {
        setOutput(""); // Clear the command output
        setHasSaved(false); // Reset hasSaved state
        setAllowSave(false); // Disallow further output saving
    };

    // Render component
    return (
        <RenderComponent 
            title={title}
            description={description}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {loading && <LoadingOverlay visible={true} />}
                    <TextInput label="Target URL" required {...form.getInputProps("targetURL")} />
                    <Checkbox
                        label="SSL Scan"
                        checked={sslScan}
                        onChange={(event) => setSslScan(event.currentTarget.checked)}
                    />
                    <Button type={"submit"}>Start {title}</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Nikto;
