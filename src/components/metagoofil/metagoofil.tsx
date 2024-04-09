import { Button, LoadingOverlay, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { useClickOutside } from "@mantine/hooks";

const title = "Metagoofil";
const description_userguide =
    "Metagoofil is a tool used to gather information through the extraction of metadata from publicly available documents " +
    "from a target company. The tool is capable of performing a Google search on a target to allow for all documents to be " +
    "identified and downloaded to the local disk. This tool withholds the potential to extract from documents of the following " +
    "file types: pdf, doc, xls, ppt, docx, pptx, xlsx. \n\nOptions for the tool can be found at: https://www.kali.org/tools/metagoofil/\n\n" +
    "Using the tool:\n" +
    "Step 1: Enter a website URL for the tool to search.\n" +
    "       Eg: kali.org\n\n" +
    "Step 2: Enter the desired number of results.\n" +
    "       Eg: 100\n\n" +
    "Step 3: Enter the limit for the number of files to be downloaded\n" +
    "       Eg: 25\n\n" +
    "Step 4: Enter the file type name to be extracted.\n" +
    "       Eg: pdf\n\n" +
    "Step 5: Click scan to commence the Metagoofil operation.\n\n" +
    "Step 6: View the Output block below to view the results of the tool's execution.";

interface FormValues {
    webname: string;
    searchmax: string;
    filelimit: string;
    filetype: string;
    filepath: string;
}

export function Metagoofil() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [customconfig, setCustomconfig] = useState(false);
    const [downloadconfig, setDownloadConfig] = useState(false);
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
   

    let form = useForm({
        initialValues: {
            webname: "",
            searchmax: "",
            filelimit: "",
            filetype: "",
            filepath: "",
        },
    });

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data received to the existing output.
     *
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Append new data to the previous output.
        if (!allowSave) setAllowSave(true);
    }, []);
    /**
     * handleProcessTermination: Callback to handle the termination of the child process.
     * Once the process termination is handled, it clears the process PID reference and
     * deactivates the loading overlay.
     * @param {object} param0 - An object containing information about the process termination.
     * @param {number} param0.code - The exit code of the terminated process.
     * @param {number} param0.signal - The signal code indicating how the process was terminated.
     */
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
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        setAllowSave(false); // new code
        setHasSaved(false);

        const args = [`-d`, `${values.webname}`, `-t`, `${values.filetype}`];

        //number of searches made
        values.searchmax ? args.push(`-l`, `${values.searchmax}`) : undefined;

        //number of files wanted to be downloaded
        values.filelimit ? args.push(`-n`, `${values.filelimit}`) : undefined;

        //filepath of where downloaded files are to be stored
        values.filepath ? args.push(`-o`, `${values.filepath}`, `-w`) : undefined;

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "metagoofil",
                args,
                handleProcessData,
                handleProcessTermination
            );
            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any) {
            setOutput(e.message);
        }
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setAllowSave(false);
        setHasSaved(false);
    }, [setOutput]);

    const handleSaveComplete = useCallback(() => { 
        setHasSaved(true);
        setAllowSave(false);
    }, []);


    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack>
                {UserGuide(title, description_userguide)}
                <Switch
                    size="md"
                    label="Manual Configuration"
                    checked={customconfig}
                    onChange={(e) => setCustomconfig(e.currentTarget.checked)}
                />
                <Switch
                    size="md"
                    label="Download Files"
                    checked={downloadconfig}
                    onChange={(e) => setDownloadConfig(e.currentTarget.checked)}
                />
                <TextInput label={"Enter the website for search"} required {...form.getInputProps("webname")} />
                <TextInput label={"Enter your file type"} required {...form.getInputProps("filetype")} />
                {customconfig && (
                    <>
                        <TextInput
                            label={"Enter number of results (default 100)"}
                            {...form.getInputProps("searchmax")}
                        />
                    </>
                )}
                {downloadconfig && (
                    <>
                        <TextInput
                            label={"Enter the value for Download file limit"}
                            {...form.getInputProps("filelimit")}
                        />
                        <TextInput label={"Enter file path"} {...form.getInputProps("filepath")} />
                    </>
                )}

                <Button type={"submit"}>Scan</Button>
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
export default Metagoofil;
