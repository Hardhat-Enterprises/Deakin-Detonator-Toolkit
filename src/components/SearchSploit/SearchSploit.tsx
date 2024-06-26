import { Button, LoadingOverlay, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { Text } from "@mantine/core";
import { List } from "@mantine/core";
import { Accordion } from "@mantine/core";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";

const title = "SearchSploit";
const description_userguide =
    "SearchSploit is a command-line tool used for searching through Exploit-DB that allows an offline " +
    "copy of the exploited database to be withheld. This tool is useful for conducting security assessments " +
    "on segregated networks and provides several search options within its operation.\n\nInformation on the " +
    "tool can be found at: https://www.exploit-db.com/documentation/Offsec-SearchSploit.pdf\n\n" +
    "Using SearchSploit:\n" +
    "Step 1: Enter a Search Term followed by selecting a Search Option.\n" +
    "       Eg: data, Exact\n\n" +
    "Step 2: Select an Output type.\n" +
    "       Eg: json\n\n" +
    "Step 3: Select a Non-Searching option.\n" +
    "       Eg: Mirror\n\n" +
    "Step 4: Enter an Exploit Database ID.\n" +
    "       Eg: PLACEHOLDER (required when using the 'Path' output or Non-Search options)\n\n" +
    "Step 5: Click Scan to commence SearchSploit's operation.\n\n" +
    "Step 6: View the Output block below to view the results of the tools execution.";

interface FormValuesType {
    searchTerm: string;
    searchOption: string;
    out_put: string;
    non_search: string;
    ebd_id: string;
}

const searchOption = ["Case", "Exact", "Strict", "Title"];

const out_put = ["json", "Overflow", "Path", "Verbose", "www"];

const non_search = ["Mirror", "Examine"];

const SearchSploit = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [selectedSearchOption, setSelectedSearchOption] = useState("");
    const [selectedout_putOption, setSelectedOut_putOption] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [selectedNonSearchOption, setSelectedNonSearchOption] = useState("");
    const [pid, setPid] = useState("");

    let form = useForm({
        initialValues: {
            searchTerm: "",
            searchOption: "",
            ebd_id: "",
        },
    });

    // Uses the callback function of runCommandGetPidAndOutput to handle and save data
    // generated by the executing process into the output state variable.
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output
    }, []);
    // Uses the onTermination callback function of runCommandGetPidAndOutput to handle
    // the termination of that process, resetting state variables, handling the output data,
    // and informing the user.
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }
            // Clear the child process pid reference
            setPid("");
            // Cancel the Loading Overlay
            setLoading(false);
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );
    // Sends a SIGTERM signal to gracefully terminate the process
    const handleCancel = () => {
        if (pid !== null) {
            const args = [`-15`, pid];
            CommandHelper.runCommand("kill", args);
        }
    };
    const handleSaveComplete = useCallback(() => {
        setHasSaved(true);
        setAllowSave(false);
    }, []);

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = [""];

        if (values.searchOption === "Case") {
            args.push("-c");
        } else if (values.searchOption === "Exact") {
            args.push("-e");
        } else if (values.searchOption === "Strict") {
            args.push("-s");
        } else if (values.searchOption === "Title") {
            args.push("-t");
        }

        if (values.out_put === "json") {
            args.push("-j");
        } else if (values.out_put === "Overflow") {
            args.push("-o");
        } else if (values.out_put === "Path") {
            args.push("-p");
        } else if (values.out_put === "Verbose") {
            args.push("-v");
        } else if (values.out_put === "www") {
            args.push("-w");
        }

        if (values.non_search === "Mirror") {
            args.push("-m");
        } else if (values.non_search === "Examine") {
            args.push("-x");
        }

        args.push(values.searchTerm);

        args.push(values.ebd_id);

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "searchsploit",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any) {
            setOutput(e.message);
        }

        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setAllowSave(false);
        setHasSaved(false);
    }, [setOutput]);

    return (
        <form
            onSubmit={form.onSubmit((values) =>
                onSubmit({
                    ...values,
                    searchOption: selectedSearchOption,
                    out_put: selectedout_putOption,
                    non_search: selectedNonSearchOption,
                })
            )}
        >
            <LoadingOverlay visible={loading} />
            {loading && (
                <div>
                    <Button variant="outline" color="red" style={{ zIndex: 1001 }} onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            )}

            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label={"Search Term"} {...form.getInputProps("searchTerm")} />
                <NativeSelect
                    value={selectedSearchOption}
                    onChange={(e) => setSelectedSearchOption(e.target.value)}
                    label={"Search option"}
                    data={searchOption}
                    placeholder={"Pick a Search option"}
                    description={"Type of Search to perform"}
                />
                <NativeSelect
                    value={selectedout_putOption}
                    onChange={(e) => setSelectedOut_putOption(e.target.value)}
                    label={"Output"}
                    data={out_put}
                    placeholder={"Select an Output"}
                    description={"Type of output to display"}
                />
                <NativeSelect
                    value={selectedNonSearchOption}
                    onChange={(e) => setSelectedNonSearchOption(e.target.value)}
                    label={"Non-Searching"}
                    data={non_search}
                    placeholder={"Select an option"}
                    description={
                        "Mirror (aka copies) an exploit to the current working directory, Examine (aka opens) the exploit using $PAGER"
                    }
                />

                <TextInput
                    label={"EBD-ID"}
                    description="Exploit Database ID: Required when using the 'Path' output, or when using Non-Search options."
                    {...form.getInputProps("ebd_id")}
                />

                <Button type={"submit"}>Scan</Button>
                <Accordion>
                    <Accordion.Item value="item-1">
                        <Accordion.Control>Help:</Accordion.Control>
                        <Accordion.Panel>
                            <List>
                                <Text weight={700}>Search Term:</Text>
                                <List.Item>Case | Perform a case-sensitive search (Default is inSEnsITiVe).</List.Item>
                                <List.Item>
                                    Exact | Perform an EXACT & order match on exploit title (Default is an AND match on
                                    each term).
                                </List.Item>
                                <List.Item>
                                    Strict | Perform a strict search, so input values must exist, disabling fuzzy search
                                    for version range.
                                </List.Item>
                                <List.Item>
                                    Title | Search JUST the exploit title (Default is title AND the file's path).
                                </List.Item>
                            </List>
                            <br></br>
                            <List>
                                <Text weight={700}>Output:</Text>
                                <List.Item>json | Show result in JSON format.</List.Item>
                                <List.Item>Overflow | Exploit titles are allowed to overflow their columns.</List.Item>
                                <List.Item>
                                    Path | Show the full path to an exploit (and also copies the path to the clipboard
                                    if possible).
                                </List.Item>
                                <List.Item>Verbose | Display more information in output.</List.Item>
                                <List.Item>www | Show URLs to Exploit-DB.com rather than the local path.</List.Item>
                            </List>
                            <br></br>
                            <List>
                                <Text weight={700}>Non-Searching:</Text>
                                <List.Item>
                                    Mirror | Mirror (aka copies) an exploit to the current working directory.
                                </List.Item>
                                <List.Item>Examine | Examine (aka opens) the exploit using $PAGER.</List.Item>
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
