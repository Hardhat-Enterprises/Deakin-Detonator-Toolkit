import { Button, LoadingOverlay, NativeSelect, NumberInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";

interface FormValuesType {
    ip: string;
    port: string;
    databaseOption: string;
    scripts: string;
}
const scripts = ["vulscan/vulscan.nse"];
const databaseOptions = [
    "All",
    "scipvuldb",
    "cve",
    "securityfocus",
    "xforce",
    "exploitdb",
    "openvas",
    "securitytracker",
    "osvdb",
];

const VulscanTool = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [selectedDatabaseOption, setSelectedDatabaseOption] = useState("");

    let form = useForm({
        initialValues: {
            ip: "",
            port: "",
            databaseOption: "All",
            scripts: "vulscan/vulscan.nse",
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        const args = ["-sV", `--script=${scripts}`, `--script-args`];

        if (values.databaseOption === "All") {
            args.push("");
        } else if (values.databaseOption === "scipvuldb") {
            args.push("vulscandb=scipvuldb.csv");
        } else if (values.databaseOption === "cve") {
            args.push("vulscandb=cve.csv");
        } else if (values.databaseOption === "securityfocus") {
            args.push("vulscandb=securityfocus.csv");
        } else if (values.databaseOption === "xforce") {
            args.push("vulscandb=xforce.csv");
        } else if (values.databaseOption === "exploitdb") {
            args.push("vulscandb=exploitdb.csv");
        } else if (values.databaseOption === "openvas") {
            args.push("vulscandb=openvas.csv");
        } else if (values.databaseOption === "securitytracker") {
            args.push("vulscandb=securitytracker.csv");
        } else if (values.databaseOption === "osvdb") {
            args.push("vulscandb=osvdb.csv");
        }

        if (values.port) {
            args.push(`-p${values.port}`);
        }
        args.push(values.ip);

        try {
            const output = await CommandHelper.runCommand("nmap", args);
            setOutput(output);
        } catch (e: any) {
            setOutput(e);
        }

        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form
            onSubmit={form.onSubmit((values) =>
                onSubmit({
                    ...values,
                    databaseOption: selectedDatabaseOption,
                })
            )}
        >
            <LoadingOverlay visible={loading} />
            <Stack>
                <Title>Vulscan - Vulnerability Scanning with Nmap</Title>
                <TextInput label={"IP or Hostname"} required {...form.getInputProps("ip")} />
                {<TextInput label={"Port"} {...form.getInputProps("port")} />}

                <NativeSelect
                    value={selectedDatabaseOption}
                    onChange={(e) => setSelectedDatabaseOption(e.target.value)}
                    title={"Database option"}
                    data={databaseOptions}
                    required
                    placeholder={"Pick a database option"}
                    description={"Type of vulnerability database to use"}
                />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default VulscanTool;
