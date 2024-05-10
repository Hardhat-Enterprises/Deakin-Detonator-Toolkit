import { Button, LoadingOverlay, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";

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
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [loadingModal, setLoadingModal] = useState(true);
    const [opened, setOpened] = useState(!isCommandAvailable);

    const title = "metagoofil";
    const description =
        "Metagoofil is an information gathering tool designed for extracting metadata of public documents (pdf,doc,xls,ppt,docx,pptx,xlsx) belonging to a target company.";
    const steps =
        "Step 1: Enter a website URL for the tool to search.\n" +
        "Step 2: Enter the desired number of results.\n" +
        "Step 3: Enter the limit for the number of files to be downloaded\n" +
        "Step 4: Enter the file type name to be extracted.\n" +
        "Step 5: Click scan to commence the Metagoofil operation.\n" +
        "Step 6: View the Output block below to view the results of the tool's execution.";
    const sourceLink = "https://www.kali.org/tools/metagoofil/";
    const tutorial = "";
    const dependencies = ["metagoofil"];

    let form = useForm({
        initialValues: {
            webname: "",
            searchmax: "",
            filelimit: "",
            filetype: "",
            filepath: "",
        },
    });

    // Check if the command is available and set the state variables accordingly.
    useEffect(() => {
        // Check if the command is available and set the state variables accordingly.
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable); // Set the command availability state
                setOpened(!isAvailable); // Set the modal state to opened if the command is not available
                setLoadingModal(false); // Set loading to false after the check is done
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false); // Also set loading to false in case of error
            });
    }, []);

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data received to the existing output.
     *
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Append new data to the previous output.
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
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

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
    }, [setOutput]);

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
            <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                {LoadingOverlayAndCancelButton(loading, pid)}
                <Stack>
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
                    {SaveOutputToTextFile(output)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
}
export default Metagoofil;
