import { Button, Checkbox, Stack, TextInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

const title = "Sherlock Tool";
const description_guide =
    "Sherlock is a tool used for searching social networks for specified usernames.\n\n" +
    "Further information can be found at: https://www.kali.org/tools/sherlock/\n\n" +
    "Using Sherlock:\n\n" +
    "*Note: For multiple usernames, add a space in between. E.g. 'Greg John Billy'*\n\n" +
    "Step 1: Input the username you wish to search for in the Username field.\n" +
    "       Eg: socialperson38\n\n" +
    "Step 2: Click Start Searching to commence Sherlock's operation.\n\n" +
    "Step 3: View the Output block below to view the results of the tool's execution.";

interface FormValuesType {
    username: string;
    site: string;
    timeout: number;
}

const Sherlock = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [checkedAdvanced, setCheckedAdvanced] = useState(false);
    const [checkedVerbose, setCheckedVerbose] = useState(false);
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    let form = useForm({
        initialValues: {
            username: "",
            site: "",
            timeout: 60,
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

            // Allow Saving as the output is finalised
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    // Actions taken after saving the output
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    const onSubmit = async (values: FormValuesType) => {
        // Makes the Loading Overlay visible
        setLoading(true);

        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        const args = [];

        if (checkedVerbose) {
            args.push("--verbose");
        }

        if (values.site) {
            args.push("--site", `${values.site}`);
        }

        if (values.timeout) {
            args.push("--timeout", `${values.timeout}`);
        }

        args.push(...values.username.split(" "));

        try {
            const result = await CommandHelper.runCommandGetPidAndOutput(
                "sherlock",
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
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack>
                {UserGuide(title, description_guide)}
                <Switch
                    size="md"
                    label="Advanced Mode"
                    checked={checkedAdvanced}
                    onChange={(e) => setCheckedAdvanced(e.currentTarget.checked)}
                />
                <TextInput
                    label={"Username"}
                    placeholder="For multiple user, leave space between username."
                    required
                    {...form.getInputProps("username")}
                />
                {checkedAdvanced && (
                    <>
                        <TextInput
                            label={"Timeout"}
                            placeholder={"Time (in seconds) to wait for response to requests. Default is 60"}
                            {...form.getInputProps("timeout")}
                        />
                        <TextInput
                            label={"Site"}
                            placeholder={"Specific social networking to search on"}
                            {...form.getInputProps("site")}
                        />
                        <Checkbox
                            label={"Display detailed information about the search process."}
                            checked={checkedVerbose}
                            onChange={(e) => setCheckedVerbose(e.currentTarget.checked)}
                        />
                    </>
                )}
                <Button type={"submit"}>Start Searching!</Button>
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Sherlock;
