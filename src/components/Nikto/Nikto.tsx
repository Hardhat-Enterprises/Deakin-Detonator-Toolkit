import React, { useState } from 'react';
import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Nikto";
const description_userguide =
    "Nikto is a powerful web server scanner that can perform comprehensive tests against web servers for multiple items.\n" +
    "How to use this Nikto tool:\n" +
    "- Provide the target URL or IP address to scan.\n" +
    "- Start the scan to gather information about potential vulnerabilities and misconfigurations.\n" +
    "- Review the scan output to identify any security issues.\n";

interface FormValuesType {
    TargetURL: string;
}

const Nikto = () => {
// Initialize state for output and form
const [loading, setLoading] = useState(false);
const [output, setOutput] = useState("");
const form = useForm<FormValuesType>({
    initialValues: {
        TargetURL: "",
    },
});

// Define form submission function
const onSubmit = async (values: FormValuesType) => {
    // Disable save button during execution
    setLoading(true);

    // Run Nikto command with provided target URL
    try {
        const args = ['-h', values.TargetURL];
        const commandOutput = await CommandHelper.runCommand("nikto", args);
        setOutput(commandOutput);
    } catch (error: any) {
        setOutput(`Error: ${error.message}`);
    } finally {
        // Enable save button after execution
        setLoading(false);
    }
};
return (
    <form onSubmit={form.onSubmit((values) => onSubmit(values))}></form>
);

}

export default Nikto;