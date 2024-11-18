import { Button, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButtonPkexec } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the Photon component.
 */
interface FormValuesType {
    url: string;
    outputDir: string;
    crawlDepth: number;
    cookies: string;
    userAgent: string;
}

/**
 * The Photon component.
 * @returns The Photon component.
 */
const Photon = () => {
    // Component State Variables.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [allowSave, setAllowSave] = useState(false); // State variable to indicate if saving is allowed.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [loadingModal, setLoadingModal] = useState(true); // State variable that indicates if the modal is opened.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable to indicate loading state of the modal.

    // Component Constants.
    const title = "Photon";
    const description =
        "Photon is a fast crawler designed for extracting URLs, endpoints, and more from target websites.";
    const steps =
        "Step 1: Enter a valid target URL(eg. https://www.deakin.edu.au).\n" +
        "Step 2: Specify additional options such as output directory, cookies, and user-agent.\n" +
        "Step 3: Specify the crawl depth.\n" +
        "Step 4: Click Start " +
        title +
        " to start Photon.\n" +
        "Step 5: View the output results below.";
    const sourceLink = "https://www.kali.org/tools/photon/";
    const tutorial = "";
    const dependencies = ["photon"]; // Contains the dependencies required by the component.

    // Form hook to handle form input.
    let form = useForm({
        initialValues: {
            url: "",
            outputDir: "",
            crawlDepth: 2, // Default crawl depth.
            cookies: "",
            userAgent: "",
        },
    });

    // Check if the command is available and set the state variables accordingly.
    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable);
                setOpened(!isAvailable);
                setLoadingModal(false);
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false);
            });
    }, []);

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data received to the existing output.
     * @param {string} data - The data received from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    /**
     * handleProcessTermination: Callback to handle the termination of the child process.
     * Once the process termination is handled, it clears the process PID reference and deactivates the loading overlay.
     * @param {object} param - An object containing information about the process termination.
     * @param {number} param.code - The exit code of the terminated process.
     * @param {number} param.signal - The signal code indicating how the process was terminated.
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

            setPid("");
            setLoading(false);
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData],
    );

    /**
     * handleSaveComplete: handle state changes when saves are completed.
     * Once the output is saved, prevent duplicate saves.
     */
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    /**
     * onSubmit: Asynchronous handler for the form submission event.
     * It sets up and triggers the Photon tool with the given parameters.
     * @param {FormValuesType} values - The form values containing the url, output directory, crawl depth, cookies, and user agent.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);

        // Create the arguments array for the command
        const args = [];
        values.url ? args.push(`-u`, `${values.url}`) : undefined;
        values.outputDir ? args.push(`-o`, `${values.outputDir}`) : undefined;
        values.crawlDepth ? args.push(`-l`, `${values.crawlDepth}`) : undefined;
        values.cookies ? args.push(`-c`, `${values.cookies}`) : undefined;
        values.userAgent ? args.push(`-a`, `${values.userAgent}`) : undefined; // Changed -u to -a for userAgent

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "photon",
                args,
                handleProcessData,
                handleProcessTermination,
            );

            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any) {
            setOutput(e.message);
            setLoading(false);
        }
    };

    /**
     * Clears the output state.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
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
                />
            )}
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    {LoadingOverlayAndCancelButtonPkexec(loading, pid, handleProcessData, handleProcessTermination)}
                    <TextInput
                        label={"URL of the target"}
                        placeholder={"Example: https://example.com"}
                        required
                        {...form.getInputProps("url")}
                    />
                    <TextInput
                        label={"Output Directory"}
                        placeholder={"Specify the output directory"}
                        required
                        {...form.getInputProps("outputDir")}
                    />
                    <TextInput
                        label={"Crawl Depth"}
                        placeholder={"Specify a number (Default = 2)"}
                        {...form.getInputProps("crawlDepth")}
                    />
                    <TextInput
                        label={"Cookies"}
                        placeholder={"Specify cookies (if any)"}
                        {...form.getInputProps("cookies")}
                    />
                    <TextInput
                        label={"User Agent"}
                        placeholder={"Specify a user agent (optional)"}
                        {...form.getInputProps("userAgent")}
                    />
                    <Button type={"submit"}>Start {title}</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Photon;
