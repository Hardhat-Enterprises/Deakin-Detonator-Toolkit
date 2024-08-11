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
const title = "NSLookup";
const description_Userguide =
    "The NSLookup command is a tool used to query Domain Name System (DNS) servers and retrieve information about a specific domain or IP address." +
    "This command is an essential tool for network administrators and system engineers as it can be used to troubleshoot DNS issues and gather information about DNS configurations." +
    "How to use NSLookUp.\n\n" +
    "Step 1: Enter an IP or Web URL.\n" +
    " E.g. 127.0.0.1\n\n" +
    "Step 2: View the Output block below to view the results of the Scan.";

// Form Value Interface
interface FormValuesType {
    ipAddress: string; // Ip Address that needs to be looked up
    tutorial: string; //Tutorial Text
}

export function NSLookup() {
    // State the Variables

    const [loading, setLoading] = useState(false); // Indication of running the process
    const [pid, setPid] = useState(""); // Process ID
    const [output, setOutput] = useState(""); // Output
    const [allowSave, setAllowSave] = useState(false); // Looking whether the process can be saved
    const [hasSaved, setHasSaved] = useState(false); // Indication of saved process

    // Form management by using Mantine
    const form = useForm({
        initialValues: {
            ipAddress: "", // Initial Value of IP address
            tutorial: "", // Initial Value of Tutorial
        },
    });

    // Handling the processed data output
    // @param {string} data - Data output from the process

    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []); // Handles the termination and provides the apporpritate message

    // Process Termination
    //Once the process termination is handled, it clears the process PID reference and deactivates the loading overlay.
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
            setPid(""); // Reset the Process ID
            setLoading(false); // Stop loading
            setAllowSave(true); // Allows the saving of output
            setHasSaved(false); // Reset save status
        },
        [handleProcessData]
    );

    // Updating the state of Saving the output

    const handleSaveComplete = () => {
        setHasSaved(true); // Mark output as saved
        setAllowSave(false); // Disabling the Save option
    };

    // Handling the submitted form

    const onSubmit = (values: FormValuesType) => {
        const ipAddress = values.ipAddress.trim(); // Removing the extra white space
        if (!ipAddress) {
            setOutput("Error: No IP address or hostname provided."); // Error Message
            return;
        }

        setAllowSave(false); // Disabling the save option before start
        setLoading(true); // Show loading indication

        CommandHelper.runCommandGetPidAndOutput("nslookup", [ipAddress], handleProcessData, handleProcessTermination)
            .then(({ pid, output }) => {
                setPid(pid); // Setting the Process ID
                setOutput(output); // Setting the command output
            })
            .catch((error) => {
                setLoading(false); //Stop Loading
                setOutput(`Error: ${error.message}`); // Display the error message
            });
    };

    // Clearing the output

    const clearOutput = useCallback(() => {
        setOutput(""); // Clears output
        setHasSaved(false); // Reset save status
        setAllowSave(false); // Disable saving
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack>
                {UserGuide(title, description_Userguide)}
                <TextInput
                    label={"Please enter the IP Address for NSLookup"}
                    required
                    {...form.getInputProps("ipAddress")}
                />

                <TextInput label={"Tutorial"} {...form.getInputProps("tutorial")} />

                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
export default NSLookup;
