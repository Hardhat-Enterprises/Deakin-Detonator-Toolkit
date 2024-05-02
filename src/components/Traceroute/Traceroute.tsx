import { Button, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useEffect, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";

/**
 * FormValuesType defines the structure for the form values used in the TracerouteTool component.
 * @field hostname: The hostname or IP address for the traceroute operation.
 * @field portNumber:The port number to be used, currently not utilized in the traceroute operations.
 * @field tracerouteSwitch: The selected type of traceroute scan.
 * @field tracerouteOptions: Custom traceroute options provided by the user.
 */
interface FormValuesType {
    hostname: string;
    portNumber: string;
    tracerouteSwitch: string;
    tracerouteOptions: string;
}

const title = "Traceroute"; //Title of the tool.
const description = // Description of the component
    "The Traceroute tool provides a utility for displaying the route that IP packets have used as they travel to a particular network or host.";
const steps =
    "Step 1: Enter a Hostname/IP address.\n" +
    "Step 2: (Optional) Enter any additional options.\n" +
    "Step 3: Select a scan option.\n" +
    "Step 4: Click Scan to commence Traceroute operation.\n" +
    "Step 5: View the Output block below to view the results of the tool's execution.";
const sourceLink = "https://www.kali.org/tools/"; //Link to the source code(or kali tools).
const tutorial = ""; //Link to the official documentation/tutorial.
const dependencies = ["traceroute"]; //Contains the dependencies required by the component.

const TracerouteTool = () => {
    var [output, setOutput] = useState(""); //State to store the output from the traceroute command

    const [selectedScanOption, setSelectedTracerouteOption] = useState(""); // State to store the selected scan type.
    const [isCommandAvailable, setIsCommandAvailable] = useState(false); // State variable to check if the command is available.
    const [opened, setOpened] = useState(!isCommandAvailable); // State variable that indicates if the model is opened.
    const [LoadingModal, setLoadingModal] = useState(true); // State variable to indicate loading state of the model.

    // Form hook to handle form input.
    let form = useForm({
        initialValues: {
            hostname: "",
            portNumber: "",
            tracerouteOptions: "",
        },
    });

    // Check is the command is avaliable and set the state variables accordingly.
    useEffect(() => {
        // Check if the command is available and set the state variables accordingly.
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable); // Set the command availability state.
                setOpened(!isAvailable); // Set the modal state to opened if the command is not available.
                setLoadingModal(false); // Set loading to false after check is done.
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false);
            });
    }, []);

    /**
     * handleProcessData: Callback to handle and append new data from the child process to the output.
     * It updates the state by appending the new data recieved to the existing output.
     * @param {string} data - The data recieved from the child process.
     */
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); //Append new data to the previous output.
    }, []);

    //Traceroute Options
    const tracerouteSwitch = [
        "Traceroute ICMP scan",
        "Traceroute TCP scan",
        "Traceroute UDP scan",
        "Traceroute custom scan",
    ]; // Options for different types of traceroute scans

    /**
     * Executes the traceroute command based on user inputs and updates the output state.
     * @param values The form value containing user inputs.
     */
    const onSubmit = async (values: FormValuesType) => {
        let args = [``];

        //Switch case
        switch (values.tracerouteSwitch) {
            case "Traceroute ICMP scan": //traceroute syntax: traceroute -I <hostname>
                args = [`/usr/share/ddt/Bash-Scripts/Tracerouteshell.sh`];
                args.push(`-I`);
                args.push(`${values.hostname}`);
                try {
                    let output = await CommandHelper.runCommand("bash", args);
                    setOutput(output);
                } catch (e: any) {
                    setOutput(e);
                }

                break;

            case "Traceroute TCP scan": //traceroute syntax: traceroute -T <hostname>
                args = [`/usr/share/ddt/Bash-Scripts/Tracerouteshell.sh`];
                args.push(`-T`);
                args.push(`${values.hostname}`);
                try {
                    let output = await CommandHelper.runCommand("bash", args);
                    setOutput(output);
                } catch (e: any) {
                    setOutput(e);
                }

                break;

            case "Traceroute UDP scan": //traceroute syntax: traceroute -U <hostname>
                args = [`/usr/share/ddt/Bash-Scripts/Tracerouteshell.sh`];
                args.push(`-U`);
                args.push(`${values.hostname}`);
                try {
                    let output = await CommandHelper.runCommand("bash", args);
                    setOutput(output);
                } catch (e: any) {
                    setOutput(e);
                }

                break;

            case "Traceroute custom scan": //traceroute syntax: traceroute <options> <hostname>
                args = [`/usr/share/ddt/Bash-Scripts/Tracerouteshell.sh`];
                args.push(`${values.tracerouteOptions}`);
                args.push(`${values.hostname}`);
                try {
                    let output = await CommandHelper.runCommand("bash", args);
                    setOutput(output);
                } catch (e: any) {
                    setOutput(e);
                }

                break;
        }
    };

    /**
     * Clears the output displayed to the user.
     */
    const clearOutput = useCallback(() => {
        setOutput(""); //Memoized function to clear the output.
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit({ ...values, tracerouteSwitch: selectedScanOption }))}>
            <Stack>
                {UserGuide(title, description)}
                <TextInput label={"Hostname/IP address"} {...form.getInputProps("hostname")} />
                <TextInput label={"Traceroute custom (optional)"} {...form.getInputProps("tracerouteOptions")} />
                <NativeSelect
                    value={selectedScanOption}
                    onChange={(e) => setSelectedTracerouteOption(e.target.value)}
                    title={"Traceroute option"}
                    data={tracerouteSwitch}
                    required
                    placeholder={"Pick a scan option"}
                    description={"Type of scan to perform"}
                />
                <Button type={"submit"}>start traceroute</Button>
                {SaveOutputToTextFile(output)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default TracerouteTool;
