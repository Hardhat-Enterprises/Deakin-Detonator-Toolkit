import { Button, LoadingOverlay, NativeSelect, Stack, TextInput, Text, List, Accordion } from "@mantine/core"; // Import necessary Mantine components
import { useForm } from "@mantine/form"; // Import Mantine form hook
import { useCallback, useState } from "react"; // Import React hooks
import { CommandHelper } from "../../utils/CommandHelper"; // Import command helper utility
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper"; // Import console wrapper component
import { UserGuide } from "../UserGuide/UserGuide"; // Import user guide component
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile"; // Import save output component
/**
 * Interface representing the form values for SearchSploit.
 * @interface
 */
interface FormValues {
    searchTerm: string; // The term to search for in the exploit database
    searchOption: string; // The type of search to perform
    outputType: string; // The type of output to display
    nonSearch: string; // Non-searching options
    ebdId: string; // Exploit Database ID
}

// Define constant values used in the component
const TITLE = "SearchSploit"; // Tool name
const DESCRIPTION = "SearchSploit is a command-line tool used for searching through Exploit-DB."; // Tool description
const STEPS = `Step 1: Enter a Search Term followed by selecting a Search Option.
Step 2: Select an Output type.
Step 3: Select a Non-Searching option.
Step 4: Enter an Exploit Database ID.
Step 5: Click Scan to commence SearchSploit's operation.
Step 6: View the Output block below to view the results of the tool's execution.`;

const SOURCE_LINK = "https://www.exploit-db.com/documentation/Offsec-SearchSploit.pdf"; // Source documentation link
const TUTORIAL = ""; // Tutorial placeholder
const SEARCH_OPTIONS = ["Case", "Exact", "Strict", "Title"]; // Search options for the tool
const OUTPUT_TYPES = ["json", "Overflow", "Path", "Verbose", "www"]; // Output types for the tool
const NON_SEARCH_OPTIONS = ["Mirror", "Examine"]; // Non-searching options for the tool

/**
 * SearchSploit component that allows users to interact with the SearchSploit tool.
 * @returns {JSX.Element}
 */
const SearchSploit = () => {
    const [loading, setLoading] = useState(false); // Loading state for the component
    const [output, setOutput] = useState(""); // Output data from the command
    const [allowSave, setAllowSave] = useState(false); // State to control saving output
    const [hasSaved, setHasSaved] = useState(false); // State to track if output has been saved
    const [pid, setPid] = useState(""); // Process ID of the running command

    const form = useForm<FormValues>({
        initialValues: {
            searchTerm: "",
            searchOption: "",
            outputType: "",
            nonSearch: "",
            ebdId: "", // Use camelCase for variable name
        },
    });

    /**
     * Handles the process data received from the command.
     * @param {string} data - The data received from the command process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Append new data to output
    }, []);

    /**
     * Handles the termination of the process.
     * @param {{ code: number; signal: number }} terminationInfo - Information about the termination.
     */
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            const message = code === 0 
                ? "\nProcess completed successfully." 
                : `\nProcess terminated with exit code: ${code} and signal code: ${signal}`;
            handleProcessData(message); // Update output with termination message
            setPid(""); // Clear the process ID
            setLoading(false); // Stop loading
            setAllowSave(true); // Allow saving output
            setHasSaved(false); // Reset saved state
        },
        [handleProcessData]
    );

    /**
     * Cancels the running command process.
     */
    const handleCancel = () => {
        if (pid) {
            CommandHelper.runCommand("kill", ["-15", pid]); // Send SIGTERM signal to process
        }
    };

    /**
     * Handles the completion of the save action.
     */
    const handleSaveComplete = useCallback(() => {
        setHasSaved(true); // Mark output as saved
        setAllowSave(false); // Disable saving state
    }, []);

    /**
     * Submits the form and runs the SearchSploit command.
     * @param {FormValues} values - The values from the form.
     */
    const onSubmit = async (values: FormValues) => {
        setLoading(true); // Set loading state to true
        const args = [
            ...getSearchOptionArgs(values.searchOption),
            ...getOutputTypeArgs(values.outputType),
            ...getNonSearchArgs(values.nonSearch),
            values.searchTerm,
            values.ebdId // Use camelCase for variable name
        ];

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "searchsploit", 
                args, 
                handleProcessData, 
                handleProcessTermination
            );
            setPid(result.pid); // Set process ID
            setOutput(result.output); // Set output data
        } catch (e) {
            setOutput(e.message); // Set output to error message
        } finally {
            setLoading(false); // Set loading state to false
        }
    };

    /**
     * Gets the arguments for the search option.
     * @param {string} searchOption - The selected search option.
     * @returns {string[]} - An array of command line arguments for the search option.
     */
    const getSearchOptionArgs = (searchOption: string): string[] => {
        const optionMap: Record<string, string> = {
            Case: "-c",
            Exact: "-e",
            Strict: "-s",
            Title: "-t",
        };
        return [optionMap[searchOption]].filter(Boolean); // Return mapped value if exists
    };

    /**
     * Gets the arguments for the output type.
     * @param {string} outputType - The selected output type.
     * @returns {string[]} - An array of command line arguments for the output type.
     */
    const getOutputTypeArgs = (outputType: string): string[] => {
        const typeMap: Record<string, string> = {
            json: "-j",
            Overflow: "-o",
            Path: "-p",
            Verbose: "-v",
            www: "-w",
        };
        return [typeMap[outputType]].filter(Boolean); // Return mapped value if exists
    };

    /**
     * Gets the arguments for the non-searching options.
     * @param {string} nonSearch - The selected non-searching option.
     * @returns {string[]} - An array of command line arguments for the non-searching option.
     */
    const getNonSearchArgs = (nonSearch: string): string[] => {
        const nonSearchMap: Record<string, string> = {
            Mirror: "-m",
            Examine: "-x",
        };
        return [nonSearchMap[nonSearch]].filter(Boolean); // Return mapped value if exists
    };

    /**
     * Clears the output displayed in the console.
     */
    const clearOutput = useCallback(() => {
        setOutput(""); // Clear the output state
        setAllowSave(false); // Disable saving state
        setHasSaved(false); // Reset saved state
    }, []);

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <LoadingOverlay visible={loading} />
            {loading && (
                <Button variant="outline" color="red" style={{ zIndex: 1001 }} onClick={handleCancel}>
                    Cancel
                </Button>
            )}

            <Stack>
                {UserGuide(TITLE, DESCRIPTION)} {/* Render user guide */}
                <TextInput label={"Search Term"} {...form.getInputProps("searchTerm")} />
                <NativeSelect
                    {...form.getInputProps("searchOption")}
                    label={"Search Option"}
                    data={SEARCH_OPTIONS}
                    placeholder={"Pick a Search option"}
                />
                <NativeSelect
                    {...form.getInputProps("outputType")}
                    label={"Output"}
                    data={OUTPUT_TYPES}
                    placeholder={"Select an Output"}
                />
                <NativeSelect
                    {...form.getInputProps("nonSearch")}
                    label={"Non-Searching"}
                    data={NON_SEARCH_OPTIONS}
                    placeholder={"Select an option"}
                />
                <TextInput
                    label={"EBD-ID"}
                    description="Exploit Database ID: Required when using the 'Path' output or Non-Search options."
                    {...form.getInputProps("ebdId")} // Use camelCase for variable name
                />
                <Button type={"submit"}>Scan</Button>

                <Accordion>
                    <Accordion.Item value="item-1">
                        <Accordion.Control>Help:</Accordion.Control>
                        <Accordion.Panel>
                            <List>
                                <Text weight={700}>Search Options:</Text>
                                {SEARCH_OPTIONS.map(option => (
                                    <List.Item key={option}>{option}</List.Item>
                                ))}
                            </List>
                            <List>
                                <Text weight={700}>Output:</Text>
                                {OUTPUT_TYPES.map(type => (
                                    <List.Item key={type}>{type}</List.Item>
                                ))}
                            </List>
                            <List>
                                <Text weight={700}>Non-Searching:</Text>
                                {NON_SEARCH_OPTIONS.map(option => (
                                    <List.Item key={option}>{option}</List.Item>
                                ))}
                            </List>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>

                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

// Export the component as default
export default SearchSploit;
