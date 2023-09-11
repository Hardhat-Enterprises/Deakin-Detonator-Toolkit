import { Button, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

const title = "DNS Mapping for Subdomains (DNSMap)";
const description_userguide =
    "DNSMap scans a domain for common subdomains using a built-in or an external wordlist (if specified using -w option). " +
    "The internal wordlist has around 1000 words in English and Spanish as ns1, firewall servicios and smtp. " +
    "So it will be possible search for smtp.example.com inside example.com automatically.\n\nInformation on the tool " +
    "can be found at: https://www.kali.org/tools/dnsmap/\n\n" +
    "Step 1: Enter a valid domain to be mapped.\n" +
    "       Eg: google.com\n\n" +
    "Step 2: Enter a delay between requests. Default is 10 (milliseconds). Can be left blank.\n" +
    "       Eg: 10\n\n" +
    "Step 3: Click Start Mapping to commence the DNSMap tools operation.\n\n" +
    "Step 4: View the Output block below to view the results of the tools execution.\n\n" +
    "Switch to Advanced Mode for further options.";

interface FormValuesType {
    domain: string;
    delay: number;
    wordlistPath: string;
    csvResultsFile: string;
    ipsToIgnore: string;
}

const DNSMap = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [checkedAdvanced, setCheckedAdvanced] = useState(false);
    const [Pid, setPid] = useState("");

    let form = useForm({
        initialValues: {
            domain: "",
            delay: 10,
            wordlistPath: "",
            csvResultsFile: "",
            ipsToIgnore: "",
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

    /**
     * onSubmit: Handler function that is triggered when the form is submitted.
     * It prepares the arguments and initiates the execution of the `dnsmap` command.
     * Upon successful execution, it updates the state with the process PID and output.
     * If an error occurs during the command execution, it updates the output with the error message.
     * @param {FormValues} values - An object containing the form input values.
     */
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = [`${values.domain}`, "-d", `${values.delay}`];

        if (values.wordlistPath) {
            args.push(`-S ${values.wordlistPath}`);
        }

        if (values.csvResultsFile) {
            args.push(`-s ${values.csvResultsFile}`);
        }

        if (values.ipsToIgnore) {
            args.push(`-t ${values.ipsToIgnore}`);
        }
        const filteredArgs = args.filter((arg) => arg !== "");
        CommandHelper.runCommandGetPidAndOutput("dnsmap", filteredArgs, handleProcessData, handleProcessTermination)
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
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            {LoadingOverlayAndCancelButton(loading, Pid)}
            <Stack>
                {UserGuide(title, description_userguide)}
                <Switch
                    size="md"
                    label="Advanced Mode"
                    checked={checkedAdvanced}
                    onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                />
                <TextInput label={"Domain"} required {...form.getInputProps("domain")} />

                <TextInput
                    label={"Random delay between requests (default 10)(milliseconds)"}
                    type="number"
                    {...form.getInputProps("delay")}
                />
                {checkedAdvanced && (
                    <>
                        <TextInput label={"Path to external wordlist file"} {...form.getInputProps("wordlistPath")} />
                        <TextInput
                            label={"CSV results file name (optional)"}
                            {...form.getInputProps("csvResultsFile")}
                        />
                        <TextInput
                            label={"IP addresses to ignore (comma-separated, up to 5 IPs)"}
                            {...form.getInputProps("ipsToIgnore")}
                        />
                    </>
                )}
                {SaveOutputToTextFile(output)}
                <Button type={"submit"}>Start Mapping</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default DNSMap;
