import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

const title = "CloudBrute";
const description_userguide =
    "CloudBrute is a tool for cloud enumeration and infrastructure discovery in various cloud providers." +
    "How to use CloudBrute:\n\n" +
    "Step 1: Enter the target domain.\n" +
    "Step 2: Enter a keyword for URL generation.\n" +
    "Step 3: Specify the path to the wordlist file.\n" +
    "Step 4: Click 'Run CloudBrute' to start the scan.\n" +
    "Step 5: View the Output block below to see the results of the scan.";

interface FormValues {
    domain: string;
    keyword: string;
    wordlist: string;
}

export function CloudBrute() {
    const [loading, setLoading] = useState(false);
    const [pid, setPid] = useState("");
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    let form = useForm({
        initialValues: {
            domain: "",
            keyword: "",
            wordlist: "/usr/share/dirb/wordlists/common.txt",
        },
    });

    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

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

    const onSubmit = (values: FormValues) => {
        setAllowSave(false);
        setLoading(true);
        const args = ["-d", values.domain, "-k", values.keyword, "-w", values.wordlist];
        CommandHelper.runCommandGetPidAndOutput("cloudbrute", args, handleProcessData, handleProcessTermination)
            .then(({ pid, output }) => {
                setPid(pid);
                setOutput(output);
            })
            .catch((error) => {
                setLoading(false);
                setOutput(`Error: ${error.message}`);
            });
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput
                    label="Target Domain"
                    required
                    placeholder="e.g., google.com"
                    {...form.getInputProps("domain")}
                />
                <TextInput label="Keyword" required placeholder="e.g., test" {...form.getInputProps("keyword")} />
                <TextInput
                    label="Path to Wordlist"
                    required
                    placeholder="/usr/share/dirb/wordlists/common.txt"
                    {...form.getInputProps("wordlist")}
                />
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <Button type="submit">Run CloudBrute</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}

export default CloudBrute;
