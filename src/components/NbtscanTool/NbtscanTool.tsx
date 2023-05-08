import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Nbtscan Tool";
const description_userguide =
    "Nbtscan is a command-line tool designed to scan for NetBIOS information on a network." +
    "It can help identify devices, workgroups, and NetBIOS names on a network, providing valuable " +
    "information for network reconnaissance and security assessments. Nbtscan is particularly useful" +
    "for identifying legacy systems and applications that rely on NetBIOS. The tool is easy to use " +
    "and supports scanning for multiple IP addresses or IP address ranges. More information on how " +
    "to use nbtscan, along with usage examples, can be found in its official documentation: " +
    "https://www.kali.org/docs/tools/nbtscan/";

//list of input values collected by the form
interface FormValuesType {
    subnet: string;
}

//sets the state of the tool; loading or not, what the output is
const NbtscanTool = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            subnet: "",
        },
    });

    //sets the loading state to True, provides arguments for the tool
    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = [`${values.subnet}`];

        try {
            const output = await CommandHelper.runCommand("nbtscan", args);
            setOutput(output);
        } catch (e: any) {
            setOutput(e);
        }

        setLoading(false);
    };

    //clears output without completely refreshing the tool
    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    //define user interface of the tool
    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label={"Subnet"} required {...form.getInputProps("subnet")} />
                <Button type={"submit"}>Scan Subnet</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default NbtscanTool;
