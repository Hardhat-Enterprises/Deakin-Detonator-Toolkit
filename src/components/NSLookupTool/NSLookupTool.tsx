import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

/**
 * Title and Description of the tool
 */
const title = "NsLookup";
const description_Userguide =
    "The NSLookup command is a tool used to query Domain Name System (DNS) servers and retrieve information about a specific domain or IP address." +
    "This command is an essential tool for network administrators and system engineers as it can be used to troubleshoot DNS issues and gather information about DNS configurations." +
    "How to use NSLookUp.\n\n" +
    "Step 1: Enter an IP or Web URL.\n" +
    "       E.g. 127.0.0.1\n\n" +
    "Step 2: View the Output block below to view the results of the Scan.";

interface FormValues {
    ipaddress: string;
}

export function NSLookup() {
    // State the Variables

    const [loading, setLoading] = useState(false);
    const [pid, setPid] = useState("");
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    // Form management by using Mantine
    const form = useForm({
        initialValues: {
            ipaddress: "",
        },
    });

    // Handling the processed data output
    // @param {string} data - Data output from the process

    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

    // Process Termination
    //@param {Object} param - Object containing the termination code and signal
    //@param {number} param.code - Termination code of the process
    //@param {number} param.signal - Signal code of the process

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

    // Handling the submitted form

    const onSubmit = (values: FormValues) => {
        const ipAddress = values.ipaddress.trim();
        if (!ipAddress) {
            setOutput("Error: No IP address or hostname provided.");
            return;
        }

        setAllowSave(false);
        setLoading(true);

        CommandHelper.runCommandGetPidAndOutput("nslookup", [ipAddress], handleProcessData, handleProcessTermination)
            .then(({ pid, output }) => {
                setPid(pid);
                setOutput(output);
            })
            .catch((error) => {
                setLoading(false);
                setOutput(`Error: ${error.message}`);
            });
    };

    // Clearing the output

    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack>
                {UserGuide(title, description_Userguide)}
                <TextInput
                    label={"Please enter the IP Address for nslookup"}
                    required
                    {...form.getInputProps("ipaddress")}
                />
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
export default NSLookup;
