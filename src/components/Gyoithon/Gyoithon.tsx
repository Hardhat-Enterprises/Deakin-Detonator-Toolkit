import { Button, LoadingOverlay, Stack, TextInput, Alert, Accordion, Text, Group, NativeSelect } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { IconAlertCircle } from "@tabler/icons";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { UserGuide } from "../UserGuide/UserGuide";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * Represents the form values for the Gyoithon component.
 */
interface FormValuesType {
    ip: string;
    port: string;
    protocol: string;
    Ml: string;
    select_file: string;
    import_file: string;
    export_path: string;
}

// Component Constants
const title = "Gyoithon"; // Contains the title of the component.
const sourceLink = "https://github.com/gyoisamurai/GyoiThon"; // Contains the link to the source code.
const description_userguide = // Contains the description of the component.
    "Gyoithon is a tool primarily used for gathering intelligence for a Web Server. The tool allows for remote access to " +
    "be inflicted against a targeted web server to allow for products to be identified that are being operated on the server. " +
    "This may include CMS, web server software, programming language and framework. Gyoithon is further capable of automatically " +
    "executing exploitation modules designed to target these identified products. \n\nThe current version of this tool utilises " +
    "Naive Bayes and Deep Neural Network to allow for HTTP/HTTPS port detection. \n\nFurther information on the tool can be found at: " +
    sourceLink + 
    "\n\nUsing the tool:\nPlease follow the steps listed within the tool.";
const steps = ""; // Contains the steps of the component.
const tutorial = ""; // Contains the link to the official documentation/tutorial.
const dependencies = ["Gyoithon"]; // Contains the dependencies required by the component.

/**
 * The Gyoithon component.
 * @returns The Gyoithon component.
 */
const Gyoithon = () => {
    const [value, setValue] = useState<string | null>("install"); // State variable to store the value of the command execution.
    const [loading, setLoading] = useState(false); // State variable to indicate loading state.
    const [output, setOutput] = useState(""); // State variable to store the output of the command execution.
    const [selectedProtocolOption, setSelectedProtocolOption] = useState(""); // State variable to indicate selected protocol option.
    const protocolType = ["HTTPS", "HTTP"]; // Protocol types supported by Gyoithon.
    const [selectedMLOption, setSelectedMLOption] = useState(""); // State variable to indicate selected ML option.
    const Ml = ["Naive Bayes", "Deep Neural Network"]; // State variable to indicate ML options.
    const isDNN = selectedMLOption == "Deep Neural Network"; // State variable to indicate selected ML option.
    const [pid, setPid] = useState(""); // State variable to store the process ID of the command execution.
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving the output to a file.
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if the output has been saved.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the modal is opened.
    const [loadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the modal.

    // Form hook to handle form input.
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

    // Check if the command is available and set the state variables accordingly.
    useEffect(() => {
        // Check if the command is available and set the state variables accordingly.
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable); // Set the command availability state
                setOpened(!isAvailable); // Set the modal state to opened if the command is not available
                setLoadingModal(false); // Set loading to false after the check is done
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false); // Also set loading to false in case of error
            });
    }, []);

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
            // If the process was terminated successfully, display a success message.
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
                // If the process was terminated due to a signal, display the signal code.
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
                // If the process was terminated with an error, display the exit code and signal code.
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }

            // Clear the child process pid reference
            setPid("");

            // Cancel the Loading Overlay
            setLoading(false);
        },
        [handleProcessData]
    );

    // Returns a text file explaining tool requirements to the Gyoithon directory on the host device.
    const Install = async () => {
        setLoading(true);
        const args = [`install`, `-r`, `/usr/share/ddt/GyoiThon/requirements.txt`];
        const output = await CommandHelper.runCommand("pip3", args);
        setOutput(output);
        setLoading(false);
        setValue("configure");
    };

    // Returns a text file with the target address to the Gyoithon directory on the host device.
    const ShowTarget = async () => {
        setLoading(true);
        const args = [`/usr/share/ddt/GyoiThon/host.txt`];
        const output = await CommandHelper.runCommand("cat", args);
        setOutput(output);
        setLoading(false);
    };

    // Locates and clears the generated target address text file at the Gyoithon directory on the host device.
    const ClearTarget = async () => {
        setLoading(true);
        const args = [`/usr/share/ddt/GyoiThon/configure.py`, `-clear`, `/usr/share/ddt/GyoiThon/host.txt`];
        const output = await CommandHelper.runCommand("python3", args);
        setOutput(output);
        setLoading(false);
    };

    // Initiates the run process of the tool.
    const NextRun = async () => {
        setValue("run");
    };

    // Configures the run process with the values allocated to each option.
    const Configure = async (values: FormValuesType) => {
        setLoading(true);
        // Specifies arg value locations and types.
        const args = [
            `/usr/share/ddt/GyoiThon/configure.py`,
            `-add`,
            `/usr/share/ddt/GyoiThon/host.txt`,
            values.protocol,
            values.ip,
            values.port,
        ];
        // Displays the output results and state.
        const output = await CommandHelper.runCommand("python3", args);
        setOutput(output);
        setLoading(false);
        setAllowSave(true);
    };

    // Returns an output from a preexisting and selected text file.
    const Import = async (values: FormValuesType) => {
        setLoading(true);
        // Specifies arg value locations and type.
        const args = [
            `/usr/share/ddt/GyoiThon/configure.py`,
            `-import`,
            `/usr/share/ddt/GyoiThon/host.txt`,
            values.import_file,
        ];
        // Displays the output results and state.
        const output = await CommandHelper.runCommand("python3", args);
        setOutput(output);
        setLoading(false);
        setValue("run");
    };

    // Returns an output by performing a grid search function on a specified document.
    const GridSearch = async () => {
        setLoading(true);
        const args = [`/usr/share/ddt/GyoiThon/modules/Deep_Neural_Network.py`, `-grid`];
        const output = await CommandHelper.runCommand("python3", args);
        setOutput(output);
        setLoading(false);
    };

    // Performs the run process of the Gyoithon tool against input values.
    const Run = async (values: FormValuesType) => {
        setLoading(true);
        const args = [`/usr/share/ddt/GyoiThon/gyoithon.py`, `-m`];
        const result = await CommandHelper.runCommandGetPidAndOutput(
            "python3",
            args,
            handleProcessData,
            handleProcessTermination
        );
        // Returns output and state of the run process
        setPid(result.pid);
        setOutput(result.output + "Report generated successfully!");
        // setOutput(output + "Report generated successfully!");
        // setLoading(false);
        setValue("export");
        setAllowSave(true);
    };

    // Returns an output document from the run process of the tool.
    const ShowReport = async () => {
        setLoading(true);
        const args = [`/usr/share/ddt/GyoiThon/report`];
        const output = await CommandHelper.runCommand("ls", args);
        setOutput(output);
        setLoading(false);
    };

    // Deletes an output document from the run process of the tool by following directory.
    const ClearReport = async () => {
        setLoading(true);
        const args = [`/usr/share/ddt/GyoiThon/report`, `-type`, `f`, `-delete`];
        const output = await CommandHelper.runCommand("find", args);
        setOutput(output + "Reports deleted!");
        setLoading(false);
    };

    // Returns a preview of the data from the output document and displays.
    const Preview = async (values: FormValuesType) => {
        setLoading(true);
        const args = [`/usr/share/ddt/GyoiThon/report/` + values.select_file];
        const output = await CommandHelper.runCommand("cat", args);
        setOutput(output);
        setLoading(false);
    };

    // Selects an output document from directory and exports to a new path
    const Export = async (values: FormValuesType) => {
        setLoading(true);
        const args = [`/usr/share/ddt/GyoiThon/report/` + values.select_file, values.export_path];
        const output = await CommandHelper.runCommand("cp", args);
        setOutput(output + "Report exported successfully!");
        setLoading(false);
    };

    /**
     * clearOutput: Callback function to clear the console output.
     * It resets the state variable holding the output, thereby clearing the display.
     */
    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    return (
        <RenderComponent
            title={title}
            description={description_userguide}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
        <p>
            {LoadingOverlayAndCancelButton(loading, pid)}
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
        </RenderComponent>
    );
};

export default Gyoithon;
