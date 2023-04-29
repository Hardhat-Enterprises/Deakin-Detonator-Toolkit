import { Button, LoadingOverlay, Stack, TextInput, Group, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Fuzz Faster U Fool (ffuf)";
const description_userguide =
    "ffuf is a web directory and resource discovery tool. It takes a wordlist " +
    "and uses a brute force fuzzing technique against a target URL to attempt to discover valid files " +
    "and directories. This can reveal vulnerabilities in web applications as well generally data-mine " +
    "and map out the target. Ffuf can even be used to brute force credentials used in web authentication.\n\n" + 
    "For further information on ffuf: https://github.com/ffuf/ffufS\n\n" +
    "Wordlist directory: /src-tauri/exploits/ffuf_wordlists/\n\n" +"Basic ffuf brute force discovery:\n\n" +
    "Step 1: Enter a URL, and use FUZZ to indicate where words from wordlist will be fuzzed\n" +
    "       E.g. http://www.example.com/FUZZ\n\n" +
    "Step 2: Optionally enter a wordlist other than the default\n" +
    "       E.g. wordlist.txt\n\n" +
    "Step 3: Optionally enter extensions to be added to words. Comma separated." +
    "\n         E.g. .html,.php,.txt" +
    "\n\nStep 4: Click Scan to commence the ffuf operation.\n\n" +
    "Step 5: View the Output block below to view the results of the Scan.";

interface FormValuesType {
    wordlist: string;
    url: string;
    output: string;
    filtersize: string;
    extensions: string;
    filterwords: string;
    filterlines: string;
}

const FfufTool = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [checkedStopWhen, setCheckedStopWhen] = useState(false)
    const [checkedVerboseOutput, setCheckedVerboseOutput] = useState(false)
    const [checkedAdvanced, setCheckedAdvanced] = useState(false)    

    let form = useForm({
        initialValues: {
            wordlist: "",
            url: "",
            output: "",
            filtersize: "",
            extensions: "",
            filterwords: "",
            filterlines: ""
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        
        const args = [`-u`, `${values.url}`];

        if (values.wordlist){
            args.push(`-w`, `./exploits/ffuf_wordlists/${values.wordlist}`)
        }
        else args.push(`-w`, `./exploits/ffuf_wordlists/default_SECLIST_wordlist.txt`)

        if (values.extensions) {
            args.push(`-e`, `${values.extensions}`);
        }

        if (values.output) {
            args.push(`-o`, `${values.output}`);
        }

        if (values.filtersize) {
            args.push(`-fs`, `${values.filtersize}`);
        }

        if (values.filterwords) {
            args.push(`-fw`, `${values.filterwords}`);
        }

        if (values.filterlines) {
            args.push(`-fl`, `${values.filterlines}`);
        }

        if (checkedStopWhen){
            args.push(`-sf`)
        }

        if (checkedVerboseOutput){
            args.push(`-v`)
        }

        try {
            const output = await CommandHelper.runCommand("ffuf", args);
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
                onSubmit({ ...values})
            )}
        >
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <Switch
                    size="md"
                    label="Advanced Mode"
                    checked={checkedAdvanced} onChange={(e) => 
                    setCheckedAdvanced(e.currentTarget.checked)}
                />
                <TextInput label={"Target URL"} placeholder={"https://www.example.com/FUZZ"} required {...form.getInputProps("url")} />
                <TextInput label={"Wordlist: default is directory-list-2.3-medium.txt by SecLists"} placeholder={"wordlist.txt"} {...form.getInputProps("wordlist")} />                
                <TextInput label={"Extensions"} placeholder={".html,.txt,.php"} {...form.getInputProps("extensions")} />
                {checkedAdvanced && 
                    <>
                        <TextInput label={"Optional Output File"} {...form.getInputProps("output")} />

                        <TextInput label={"Filter HTTP response size. Comma separated list of sizes and ranges"} {...form.getInputProps("filtersize")} />
                
                        <TextInput label={"Filter by amount of words in response. Comma separated list of word counts and ranges"} {...form.getInputProps("filterwords")} />
                    
                        <TextInput label={"Filter by amount of lines in response. Comma separated list of line counts and ranges"} {...form.getInputProps("filterlines")} />
                    </> 
                }   
                <Group grow>
                    <Switch
                        size="md"
                        label="Stop when > 95% of responses return 403 Forbidden"
                        checked={checkedStopWhen} onChange={(e) => 
                        setCheckedStopWhen(e.currentTarget.checked)}
                    />
                    <Switch
                        size="md"
                        label="Verbose Output"
                        checked={checkedVerboseOutput} onChange={(e) => 
                        setCheckedVerboseOutput(e.currentTarget.checked)}
                    />                      
                </Group>
                <Button type={"submit"} style={{fontSize: "24px" ,paddingTop: "8px"}}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default FfufTool;
