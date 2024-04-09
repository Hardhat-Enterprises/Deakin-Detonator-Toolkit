import { Button, LoadingOverlay, Stack, TextInput, Alert, Accordion, Text, Group, NativeSelect } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { IconAlertCircle } from "@tabler/icons";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { UserGuide } from "../UserGuide/UserGuide";
interface FormValues {
    ip: string;
    port: string;
    protocol: string;
    Ml: string;
    select_file: string;
    import_file: string;
    export_path: string;
}

const title = "AI-based pen-testing tool (Gyoithon)";
const description_userguide =
    "Gyoithon is a tool primarily used for gathering intelligence for a Web Server. The tool allows for remote access to " +
    "be inflicted against a targeted web server to allow for products to be identified that are being operated on the server. " +
    "This may include CMS, web server software, programming language and framework. Gyoithon is further capable of automatically " +
    "executing exploitation modules designed to target these identified products. \n\nThe current version of this tool utilises " +
    "Naive Bayes and Deep Neural Network to allow for HTTP/HTTPS port detection. \n\nFurther information on the tool can be found at: " +
    "https://github.com/gyoisamurai/GyoiThon \n\nUsing the tool:\nPlease follow the steps listed within the tool.";

const Gyoithon = () => {
    const [value, setValue] = useState<string | null>("install");
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [selectedProtocolOption, setSelectedProtocolOption] = useState("");
    const protocolType = ["HTTPS", "HTTP"];
    const [selectedMLOption, setSelectedMLOption] = useState("");
    const Ml = ["Naive Bayes", "Deep Neural Network"];
    const isDNN = selectedMLOption == "Deep Neural Network";
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false); 

    let form = useForm({
        initialValues: {
            ip: "",
            port: "",
            protocol: "",
            Ml: "",
            select_file: "",
            import_file: "",
            export_path: "",
        },
    });

    const Install = async () => {
        setLoading(true);
        const args = [`install`, `-r`, `/usr/share/ddt/GyoiThon/requirements.txt`];
        const output = await CommandHelper.runCommand("pip3", args);
        setOutput(output);
        setLoading(false);
        setValue("configure");
    };

    const ShowTarget = async () => {
        setLoading(true);
        const args = [`/usr/share/ddt/GyoiThon/host.txt`];
        const output = await CommandHelper.runCommand("cat", args);
        setOutput(output);
        setLoading(false);
    };

    const ClearTarget = async () => {
        setLoading(true);
        const args = [`/usr/share/ddt/GyoiThon/configure.py`, `-clear`, `/usr/share/ddt/GyoiThon/host.txt`];
        const output = await CommandHelper.runCommand("python3", args);
        setOutput(output);
        setLoading(false);
    };

    const NextRun = async () => {
        setValue("run");
    };

    const Configure = async (values: FormValues) => {
        setLoading(true);
        const args = [
            `/usr/share/ddt/GyoiThon/configure.py`,
            `-add`,
            `/usr/share/ddt/GyoiThon/host.txt`,
            values.protocol,
            values.ip,
            values.port,
        ];
        const output = await CommandHelper.runCommand("python3", args);
        setOutput(output);
        setLoading(false);
    };

    const Import = async (values: FormValues) => {
        setLoading(true);
        const args = [
            `/usr/share/ddt/GyoiThon/configure.py`,
            `-import`,
            `/usr/share/ddt/GyoiThon/host.txt`,
            values.import_file,
        ];
        const output = await CommandHelper.runCommand("python3", args);
        setOutput(output);
        setLoading(false);
        setValue("run");
    };

    const GridSearch = async () => {
        setLoading(true);
        const args = [`/usr/share/ddt/GyoiThon/modules/Deep_Neural_Network.py`, `-grid`];
        const output = await CommandHelper.runCommand("python3", args);
        setOutput(output);
        setLoading(false);
    };

    const Run = async (values: FormValues) => {
        setLoading(true);
        const args = [`/usr/share/ddt/GyoiThon/gyoithon.py`, `-m`];
        const output = await CommandHelper.runCommand("python3", args);
        setOutput(output + "Report generated successfully!");
        setLoading(false);
        setValue("export");
    };

    const ShowReport = async () => {
        setLoading(true);
        const args = [`/usr/share/ddt/GyoiThon/report`];
        const output = await CommandHelper.runCommand("ls", args);
        setOutput(output);
        setLoading(false);
    };

    const ClearReport = async () => {
        setLoading(true);
        const args = [`/usr/share/ddt/GyoiThon/report`, `-type`, `f`, `-delete`];
        const output = await CommandHelper.runCommand("find", args);
        setOutput(output + "Reports deleted!");
        setLoading(false);
    };

    const Preview = async (values: FormValues) => {
        setLoading(true);
        const args = [`/usr/share/ddt/GyoiThon/report/` + values.select_file];
        const output = await CommandHelper.runCommand("cat", args);
        setOutput(output);
        setLoading(false);
    };

    const Export = async (values: FormValues) => {
        setLoading(true);
        const args = [`/usr/share/ddt/GyoiThon/report/` + values.select_file, values.export_path];
        const output = await CommandHelper.runCommand("cp", args);
        setOutput(output + "Report exported successfully!");
        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false); 
        setAllowSave(false); 
    }, [setOutput]);

    const handleSaveComplete = () => { 
        setHasSaved(true);
        setAllowSave(false);
    }

    return (
        <p>
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    radius="md"
                    children={"Please go through all the steps below."}
                ></Alert>
                <Accordion variant="contained" value={value} onChange={setValue}>
                    <Accordion.Item value="install">
                        <Accordion.Control>Step 1: Install Dependencies</Accordion.Control>
                        <Accordion.Panel>
                            <Group style={{ textAlign: "center", marginLeft: "auto", marginRight: "auto" }}>
                                <Text>Currently this tool can only detect HTTP/HTTPS protocol:</Text>
                                <Button variant="light" onClick={Install}>
                                    Install The Dependencies
                                </Button>
                            </Group>
                        </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="configure">
                        <Accordion.Control>Step 2: Configure Targets</Accordion.Control>
                        <Accordion.Panel>
                            <Text align={"center"}>Add different ports in the same IP address once</Text>
                            <Group grow style={{ marginTop: 10 }}>
                                <Button onClick={ShowTarget} variant="outline">
                                    Show Current Targets
                                </Button>
                                <Button onClick={ClearTarget} variant="outline">
                                    Clear Targets
                                </Button>
                                <Button onClick={NextRun} variant="outline">
                                    Next Step
                                </Button>
                            </Group>
                            <form onSubmit={form.onSubmit((values) => Configure(values))}>
                                <Group grow style={{ marginTop: 10 }}>
                                    <TextInput label={"Target IP address"} required {...form.getInputProps("ip")} />
                                    <TextInput label={"Target Port"} required {...form.getInputProps("port")} />
                                    <NativeSelect
                                        value={selectedProtocolOption}
                                        onChange={(e) => setSelectedProtocolOption(e.target.value)}
                                        label={"Protocol Type"}
                                        data={protocolType}
                                        required
                                        placeholder={"HTTP/ HTTPS"}
                                        {...form.getInputProps("protocol")}
                                    />
                                    <Button style={{ marginTop: 20 }} type={"submit"}>
                                        ADD
                                    </Button>
                                </Group>
                            </form>
                            <form onSubmit={form.onSubmit((values) => Import(values))}>
                                <Group grow>
                                    <TextInput label={"Import File"} required {...form.getInputProps("import_file")} />
                                    <Button style={{ marginTop: 20 }} type={"submit"}>
                                        IMPORT THIS FILE
                                    </Button>
                                </Group>
                            </form>
                        </Accordion.Panel>
                    </Accordion.Item>
                    <form onSubmit={form.onSubmit((values) => Run({ ...values, Ml: selectedMLOption }))}>
                        <Accordion.Item value="run">
                            <Accordion.Control>Step 3: Run The Tool</Accordion.Control>
                            <Accordion.Panel>
                                <Text align={"center"}>
                                    * Each target will takes about 5 min * Grid Search only works on DNN now
                                </Text>
                                <Group grow>
                                    <NativeSelect
                                        value={selectedMLOption}
                                        onChange={(e) => setSelectedMLOption(e.target.value)}
                                        label={"ML model Type"}
                                        data={Ml}
                                        required
                                        placeholder={"Naive Bayes/ Deep Neural Network"}
                                    />
                                    {isDNN && (
                                        <Button onClick={GridSearch} style={{ marginTop: 20 }}>
                                            Grid Search
                                        </Button>
                                    )}
                                    <Button style={{ marginTop: 20 }} type={"submit"}>
                                        RUN
                                    </Button>
                                </Group>
                            </Accordion.Panel>
                        </Accordion.Item>
                    </form>
                    <Accordion.Item value="export">
                        <Accordion.Control>Step 4: View Reports</Accordion.Control>
                        <Accordion.Panel>
                            <Group grow>
                                <Button onClick={ShowReport} variant="outline">
                                    Show All Reports
                                </Button>
                                <Button onClick={ClearReport} variant="outline">
                                    Clear All Reports
                                </Button>
                            </Group>
                            <form onSubmit={form.onSubmit((values) => Preview(values))}>
                                <Group grow style={{ marginTop: 10 }}>
                                    <TextInput
                                        label={"Target Report"}
                                        required
                                        {...form.getInputProps("select_file")}
                                    />
                                    <Button style={{ marginTop: 20 }} type={"submit"}>
                                        PREVIEW
                                    </Button>
                                </Group>
                            </form>
                            <form onSubmit={form.onSubmit((values) => Export(values))}>
                                <Group grow style={{ marginTop: 10 }}>
                                    <TextInput
                                        label={"Target Report"}
                                        required
                                        {...form.getInputProps("select_file")}
                                    />
                                    <TextInput label={"Export Path"} required {...form.getInputProps("export_path")} />
                                    <Button style={{ marginTop: 20 }} type={"submit"}>
                                        EXPORT
                                    </Button>
                                </Group>
                            </form>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)} 
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </p>
    );
};

export default Gyoithon;
