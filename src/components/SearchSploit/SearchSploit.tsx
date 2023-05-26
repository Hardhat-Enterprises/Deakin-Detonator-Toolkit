import { Button, LoadingOverlay, NativeSelect, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { Text } from "@mantine/core";
import { List } from "@mantine/core";
import { Accordion } from "@mantine/core";
import { UserGuide } from "../UserGuide/UserGuide";

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
    const [selectedNonSearchOption, setSelectedNonSearchOption] = useState("");

    let form = useForm({
        initialValues: {
            searchTerm: "",
            searchOption: "",
            ebd_id: "",
        },
    });

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
            const output = await CommandHelper.runCommand("searchsploit", args);
            setOutput(output);
        } catch (e: any) {
            setOutput(e);
        }

        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
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
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default SearchSploit;
