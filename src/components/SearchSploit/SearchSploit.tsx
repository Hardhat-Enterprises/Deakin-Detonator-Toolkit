import { Button, LoadingOverlay, NativeSelect, Stack, TextInput, Text, List, Accordion } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";

interface FormValues {
    searchTerm: string;
    searchOption: string;
    outputType: string;
    nonSearch: string;
    ebdId: string;
}

const TITLE = "SearchSploit";
const DESCRIPTION = "SearchSploit is a command-line tool used for searching through Exploit-DB.";
const STEPS = `Step 1: Enter a Search Term followed by selecting a Search Option.
Step 2: Select an Output type.
Step 3: Select a Non-Searching option.
Step 4: Enter an Exploit Database ID.
Step 5: Click Scan to commence SearchSploit's operation.
Step 6: View the Output block below to view the results of the tool's execution.`;

const SOURCE_LINK = "https://www.exploit-db.com/documentation/Offsec-SearchSploit.pdf";
const TUTORIAL = "";
const SEARCH_OPTIONS = ["Case", "Exact", "Strict", "Title"];
const OUTPUT_TYPES = ["json", "Overflow", "Path", "Verbose", "www"];
const NON_SEARCH_OPTIONS = ["Mirror", "Examine"];

const SearchSploit = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [pid, setPid] = useState("");

    const form = useForm<FormValues>({
        initialValues: {
            searchTerm: "",
            searchOption: "",
            outputType: "",
            nonSearch: "",
            ebdId: "",
        },
    });

    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            const message =
                code === 0
                    ? "\nProcess completed successfully."
                    : `\nProcess terminated with exit code: ${code} and signal code: ${signal}`;
            handleProcessData(message);
            setPid("");
            setLoading(false);
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    const handleCancel = () => {
        if (pid) {
            CommandHelper.runCommand("kill", ["-15", pid]);
        }
    };

    const handleSaveComplete = useCallback(() => {
        setHasSaved(true);
        setAllowSave(false);
    }, []);

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        const args = [
            ...getSearchOptionArgs(values.searchOption),
            ...getOutputTypeArgs(values.outputType),
            ...getNonSearchArgs(values.nonSearch),
            values.searchTerm,
            values.ebdId,
        ];

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "searchsploit",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(result.pid);
            setOutput(result.output);
        } catch (e: unknown) {
            if (e instanceof Error) {
                setOutput(e.message);
            } else {
                setOutput("An unknown error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    const getSearchOptionArgs = (searchOption: string): string[] => {
        const optionMap: Record<string, string> = {
            Case: "-c",
            Exact: "-e",
            Strict: "-s",
            Title: "-t",
        };
        return [optionMap[searchOption]].filter(Boolean);
    };

    const getOutputTypeArgs = (outputType: string): string[] => {
        const typeMap: Record<string, string> = {
            json: "-j",
            Overflow: "-o",
            Path: "-p",
            Verbose: "-v",
            www: "-w",
        };
        return [typeMap[outputType]].filter(Boolean);
    };

    const getNonSearchArgs = (nonSearch: string): string[] => {
        const nonSearchMap: Record<string, string> = {
            Mirror: "-m",
            Examine: "-x",
        };
        return [nonSearchMap[nonSearch]].filter(Boolean);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setAllowSave(false);
        setHasSaved(false);
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
                {UserGuide(TITLE, DESCRIPTION)}
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
                    {...form.getInputProps("ebdId")}
                />
                <Button type={"submit"}>Scan</Button>
                <Accordion>
                    <Accordion.Item value="item-1">
                        <Accordion.Control>Help:</Accordion.Control>
                        <Accordion.Panel>
                            <List>
                                <Text weight={700}>Search Options:</Text>
                                {SEARCH_OPTIONS.map((option) => (
                                    <List.Item key={option}>{option}</List.Item>
                                ))}
                            </List>
                            <List>
                                <Text weight={700}>Output:</Text>
                                {OUTPUT_TYPES.map((type) => (
                                    <List.Item key={type}>{type}</List.Item>
                                ))}
                            </List>
                            <List>
                                <Text weight={700}>Non-Searching:</Text>
                                {NON_SEARCH_OPTIONS.map((option) => (
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

export default SearchSploit;
