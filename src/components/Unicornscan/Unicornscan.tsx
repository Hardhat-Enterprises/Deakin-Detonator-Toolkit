import { useState, useEffect, useCallback } from "react";
import { Button, Stack, TextInput, Checkbox, NativeSelect } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import InstallationModal from "../InstallationModal/InstallationModal";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";

/**
 * Represents the form values for the Unicornscan component.
 */
interface FormValuesType {
    targetIP: string;
    scanType: string;
}

/**
 * The Unicornscan component.
 * @returns The Unicornscan component.
 */
const Unicornscan = () => {
    // Component state variables
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [pid, setPid] = useState("");
    const [verboseMode, setVerboseMode] = useState(false);

    // New state for dropdown selection
    const [selectedScanType, setSelectedScanType] = useState("");
    const [rate, setRate] = useState("");
    const [sourcePort, setSourcePort] = useState("");
    const [sourceIP, setSourceIP] = useState("");
    const [interfaceName, setInterfaceName] = useState("");
    const [ports, setPorts] = useState("");

    // Component Constants
    const title = "Unicornscan";
    const description = "Unicornscan is a tool used to gather information about systems and services on a network.";
    const steps = "Step 1: Provide the target URL or IP address to scan.\nStep 2: Select the scan type (TCP or UDP).\nStep 3: Configure additional scan options as needed.\nStep 4: Start the scan to gather information about potential vulnerabilities and misconfigurations.\nStep 5: Review the scan output to identify any security issues.\n";
    const sourceLink = "https://github.com/dneufeld/unicornscan";
    const tutorial = "";
    const dependencies = ["unicornscan"];

    // Options for the dropdown menu
    const scanTypes = ["TCP Scan (-mT)", "UDP Scan (-mU)"];

    // Form hook to handle form input
    let form = useForm({
        initialValues: {
            targetIP: "",
        },
    });

    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable);
                setOpened(!isAvailable);
                setLoadingModal(false);
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false);
            });
    }, []);

    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data);
    }, []);

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
        },
        [handleProcessData]
    );

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        let args = [values.targetIP];

        // Add the selected scan type to the arguments
        if (selectedScanType === "TCP Scan (-mT)") {
            args.push("-mT");
        } else if (selectedScanType === "UDP Scan (-mU)") {
            args.push("-mU");
        }

        // Include additional flags if they are set
        if (rate) args.push(`-r ${rate}`);
        if (sourcePort) args.push(`-e ${sourcePort}`);
        if (sourceIP) args.push(`-g ${sourceIP}`);
        if (interfaceName) args.push(`-i ${interfaceName}`);
        if (ports) args.push(`-p ${ports}`);
        if (verboseMode) args.push("-v");

        CommandHelper.runCommandWithPkexec(
            "unicornscan",
            [...args, "-I"],
            handleProcessData,
            handleProcessTermination
        )
            .then(() => {
                setLoading(false);
            })
            .catch((error) => {
                setOutput(`Error: ${error.message}`);
                setLoading(false);
            });
        setAllowSave(true);
    };

    const handleSaveComplete = () => {
        setHasSaved(true);
        setAllowSave(false);
    };

    const clearOutput = () => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    };

    // Render component
    return (
        <RenderComponent
            title={title}
            description={description}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description}
                    dependencies={dependencies}
                />
            )}
            <form onSubmit={form.onSubmit((values) => onSubmit({ ...values, scanType: selectedScanType }))}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid)}
                    <TextInput label="IP Address" required {...form.getInputProps("targetIP")} />
                    <NativeSelect
                        label="Scan Type"
                        value={selectedScanType}
                        onChange={(e) => setSelectedScanType(e.currentTarget.value)}
                        data={scanTypes}
                        placeholder="Choose a scan type"
                        description="Select the type of scan to perform"
                    />
                    <TextInput
                        label="Rate (Packets per second)"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                    />
                    <TextInput
                        label="Source Port"
                        value={sourcePort}
                        onChange={(e) => setSourcePort(e.target.value)}
                    />
                    <TextInput
                        label="Source IP"
                        value={sourceIP}
                        onChange={(e) => setSourceIP(e.target.value)}
                    />
                    <TextInput
                        label="Interface"
                        value={interfaceName}
                        onChange={(e) => setInterfaceName(e.target.value)}
                    />
                    <TextInput
                        label="Ports"
                        value={ports}
                        onChange={(e) => setPorts(e.target.value)}
                    />
                    <Checkbox
                        label="Verbose Mode"
                        checked={verboseMode}
                        onChange={(event) => setVerboseMode(event.currentTarget.checked)}
                    />
                    <Button type={"submit"}>Start {title}</Button>
                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                    <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default Unicornscan;
