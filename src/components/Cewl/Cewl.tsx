import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

const title = "Cewl";
const description_userguide =
    "The tool Cewl, renown for being a Custom Word List Generator, is a ruby app which spiders given URLs to " +
    "a specified depth to return a list of words that are able to be used within password crackers including " +
    " JohnTheRipper (which can be found within the DDT). This tool is particularly useful for security testing and " +
    "forensic investigation.\n\nOptions for the tool can be found at:  https://www.kali.org/tools/cewl/#:~:text=CeWL" +
    "%20(Custom%20Word%20List%20generator,\nCeWL%20can%20follow%20external%20links.\n\n" +
    "Using Cewl\n" +
    "Step 1: Enter the Maximum depth to spider to.\n" +
    "       Eg: 2\n\n" +
    "Step 2: Enter a Minimum word length.\n" +
    "       Eg: 3\n\n" +
    "Step 3: Enter a Target URL.\n" +
    "       Eg: google.com\n\n" +
    "Step 4: Click Scan to commence Cewl's operation.\n\n" +
    "Step 5: View the Output block below to view the results of the tools execution.";

interface FormValuesType {
    depth: string;
    minLength: string;
    url: string;
}

const Cewl = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");

    let form = useForm({
        initialValues: {
            depth: "",
            minLength: "",
            url: "",
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

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);

        const args = [`-d ${values.depth}`];
        args.push(`-m ${values.minLength}`);
        args.push(values.url);

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "cewl",
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
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label={"Max depth"} placeholder={"Example: 2"} required {...form.getInputProps("depth")} />
                <TextInput
                    label={"minimum word length"}
                    placeholder={"Example: 5"}
                    required
                    {...form.getInputProps("minLength")}
                />
                <TextInput label={"Target URL"} required {...form.getInputProps("url")} />
                <Button type={"submit"}>Scan</Button>
                {SaveOutputToTextFile(output)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Cewl;
