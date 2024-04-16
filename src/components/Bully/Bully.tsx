import { useState } from "react";
import { Button, Checkbox, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Bully";
const description_userguide =
    "Bully is a tool for brute-forcing WPS PIN authentication.\n" +
    "To use the Bully tool for WPS attacks, follow these steps:\n" +
    "- Enter the access point (AP) interface: Specify the interface name (e.g., wlan0) of the target Wi-Fi network you want to attack.\n" +
    "- Provide the password list: Input the path to the file containing the list of passwords to be tried during the brute-force attack.\n" +
    "- Optionally, provide the MAC address (BSSID) or Extended SSID (ESSID) of the target access point.\n" +
    "- Initiate the brute-force attack: Click the 'Start Bully Attack' button to begin the attack using the provided options.\n" +
    "- Review the output: After the attack is complete, review the output to identify the cracked WPS PIN, if successful.\n";

interface FormValuesType {
    Interface: string;
    PasswordList: string;
    BSSID: string;
    ESSID: string;
}

const Bully = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    // Initialize form state using the useForm hook
    let form = useForm<FormValuesType>({
        initialValues: {
            Interface: "",
            PasswordList: "",
            BSSID: "",
            ESSID: "",
        },
    });

    // Function to handle form submission
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);

        if (!values.Interface || !values.PasswordList) {
            setOutput("Error: Please provide both the access point interface and password list.");
            setLoading(false);
            setAllowSave(true);
            return;
        }

        const args = ["-i", values.Interface, "-f", values.PasswordList];

        if (values.BSSID) {
            args.push("-b", values.BSSID);
        }

        if (values.ESSID) {
            args.push("-e", values.ESSID);
        }

        // Execute Bully command with constructed arguments
        try {
            const commandOutput = await CommandHelper.runCommand("bully", args);
            // Update output state with command output
            setOutput(commandOutput);
        } catch (error: any) {
            setOutput(`Error: ${error.message}`);
        } finally {
            // Set loading state to false and allow output saving
            setLoading(false);
            setAllowSave(true);
        }
    };

    // Function to handle completion of output saving
    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    // Function to clear command output
    const clearOutput = () => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    };

    // Render component
    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label="Access Point Interface" required {...form.getInputProps("Interface")} />
                <TextInput label="Password List" required {...form.getInputProps("PasswordList")} />
                <TextInput label="MAC Address (BSSID)" {...form.getInputProps("BSSID")} />
                <TextInput label="Extended SSID (ESSID)" {...form.getInputProps("ESSID")} />
                <Button type="submit" disabled={loading}>
                    Start Bully Attack
                </Button>
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default Bully;
