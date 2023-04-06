import {
    Button,
    LoadingOverlay,
    Stack,
    TextInput,
    Title,
    Alert,
    Accordion,
    Text,
    Group,
    NativeSelect,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { IconAlertCircle } from "@tabler/icons";
interface FormValues {
    ip: string;
}

const Gyoithon = () => {
    const [value, setValue] = useState<string | null>("install");
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [selectedProtocolOption, setSelectedProtocolOption] = useState("");
    const protocolType = ["HTTPS", "HTTP"];
    const [selectedMLOption, setSelectedMLOption] = useState("");
    const MLType = ["Naive Bayes", "Deep Neural Network"];

    let form = useForm({
        initialValues: {
            ip: "",
            port: "",
            protocol: "",
            Ml: "",
            select_file: "",
            output_path: "",
        },
    });

    const Install = async () => {
        setLoading(true);
        const args = [`/usr/share/ddt/SMGGhostScanner.py`];
        const output = await CommandHelper.runCommand("python3", args);
        setOutput(output);
        setLoading(false);
        setValue("configure");
    };

    const Configure = async (values: FormValues) => {
        setLoading(true);
        const args = [`/usr/share/ddt/SMGGhostScanner.py`, values.ip];
        const output = await CommandHelper.runCommand("python3", args);
        setOutput(output);
        setLoading(false);
        setValue("run");
    };

    const Run = async (values: FormValues) => {
        setLoading(true);
        const args = [`/usr/share/ddt/SMGGhostScanner.py`, values.ip];
        const output = await CommandHelper.runCommand("python3", args);
        setOutput(output);
        setLoading(false);
        setValue("export");
    };

    const Export = async (values: FormValues) => {
        setLoading(true);
        const args = [`/usr/share/ddt/SMGGhostScanner.py`, values.ip];
        const output = await CommandHelper.runCommand("python3", args);
        setOutput(output);
        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <p>
            <LoadingOverlay visible={loading} />
            <Stack>
                <Title>AI-based pen-testing tool (Gyoithon)</Title>
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
                    <form onSubmit={form.onSubmit((values) => Configure(values))}>
                        <Accordion.Item value="configure">
                            <Accordion.Control>Step 2: Configure Targets</Accordion.Control>
                            <Accordion.Panel>
                                <Text align={"center"}>Add different ports in the same IP address once</Text>
                                <Group grow style={{ marginTop: 10 }}>
                                    <Button variant="outline">Show Current Targets</Button>
                                    <Button variant="outline">Clear Targets</Button>
                                </Group>
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
                            </Accordion.Panel>
                        </Accordion.Item>
                    </form>
                    <form onSubmit={form.onSubmit((values) => Run(values))}>
                        <Accordion.Item value="run">
                            <Accordion.Control>Step 3: Run The Tool</Accordion.Control>
                            <Accordion.Panel>
                                <Group grow>
                                    <NativeSelect
                                        value={selectedMLOption}
                                        onChange={(e) => setSelectedMLOption(e.target.value)}
                                        label={"ML model Type"}
                                        data={MLType}
                                        required
                                        placeholder={"Naive Bayes/ Deep Neural Network"}
                                        {...form.getInputProps("ML")}
                                    />
                                    <Button style={{ marginTop: 20 }} type={"submit"}>
                                        RUN
                                    </Button>
                                </Group>
                            </Accordion.Panel>
                        </Accordion.Item>
                    </form>
                    <form onSubmit={form.onSubmit((values) => Export(values))}>
                        <Accordion.Item value="export">
                            <Accordion.Control>Step 4: View Reports</Accordion.Control>
                            <Accordion.Panel>
                                <Group grow>
                                    <Button variant="outline">Show All Reports</Button>
                                    <Button variant="outline">Clear All Reports</Button>
                                </Group>
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
                            </Accordion.Panel>
                        </Accordion.Item>
                    </form>
                </Accordion>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </p>
    );
};

export default Gyoithon;
