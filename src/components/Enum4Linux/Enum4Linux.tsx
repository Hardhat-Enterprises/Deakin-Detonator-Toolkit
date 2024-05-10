import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";

const title = "Enum4Linux";
const description_userguide =
    "Enum4linux is a tool used for enumerating information from Windows and Samba operating systems. " +
    "It is particularly useful for identifying the remote OS of a system and providing a list of the users " +
    "and group memberships found within the system.\n\nOptions for the tool can be found at: " +
    "https://www.kali.org/tools/enum4linux/\n\n" +
    "Using Enum4Linux:\n" +
    "Step 1: Enter a target IP address. Eg: 192.168.1.1\n\n" +
    "Step 2: Enter an option for the enumeration. Eg: U (get userlist)\n\n" +
    "Step 3: Enter any parameters. Eg: example.txt\n\n" +
    "Step 4: Enter any additional options/parameters.\n\n" +
    "Step 5: Click Scan to commence Enum4Linux's operation.\n\n" +
    "Step 6: View the output block below to view the results of the tools execution.";

interface FormValues {
    ipAddress: string;
    argumentMain: string;
    paramMain: string;
    argumentAlt: string;
    paramAlt: string;
}

const Enum4Linux = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    let form = useForm({
        initialValues: {
            ipAddress: "",
            argumentMain: "",
            paramMain: "",
            argumentAlt: "",
            paramAlt: "",
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

            // Allow Saving as the output is finalised
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    // Actions taken after saving the output
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    const onSubmit = async (values: FormValues) => {
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);
        setLoading(true);

        let temp = "-";
        const options = temp + values.argumentMain;
        let args = [];
        if (values.argumentAlt != "") {
            const options2 = temp + values.argumentAlt;
            args = [options, values.paramMain, options2, values.paramAlt, values.ipAddress];
        } else {
            args = [options, values.paramMain, values.ipAddress];
        }
        CommandHelper.runCommandGetPidAndOutput("enum4linux", args, handleProcessData, handleProcessTermination)
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
                    label={"IP Address of Target"}
                    placeholder={"Example: 192.168.1.200"}
                    required
                    {...form.getInputProps("ipAddress")}
                />
                <TextInput
                    label={"Option"}
                    placeholder={"Example: U"}
                    required
                    {...form.getInputProps("argumentMain")}
                />
                <TextInput label={"Parameters"} placeholder={"Example: o"} {...form.getInputProps("paramMain")} />
                <TextInput label={"Additional Options"} {...form.getInputProps("argumentAlt")} />
                <TextInput label={"Additional Options Parameters"} {...form.getInputProps("paramAlt")} />;
                <Button type={"submit"}>Scan</Button>
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Enum4Linux;
