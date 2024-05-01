import { Button, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";

/**
 * FormValuesType defines the structure for the form values used in the TracerouteTool component.
 * @field hostname: The hostname or IP address for the traceroute operation.
 * @field portNumber:The port number to be used, currently not utilized in the traceroute operations.
 * @field tracerouteSwitch: The selected type of traceroute scan.
 * @field tracerouteOptions: Custom traceroute options provided by the user.
 */
interface FormValuesType {
    hostname: string;
    portNumber: string; // Consider implementing or removing this as it's currently unused.
    tracerouteSwitch: string;
    tracerouteOptions: string;
}

const title = "Traceroute Tool";
const description_userguide =
    "The Traceroute tool provides a utility for displaying the route that IP packets have used as they travel to a " +
    "particular network or host. For these routes, where possible, the tool will display both the IP address and hostname " +
    "for any machines visited along the route by the packets. This tool proves useful for network debugging where traceroute " +
    "will show where the issue is located along the route.\n\nFurther information can be found at: https://www.kali.org/tools" +
    "/traceroute/\n\n" +
    "Using Traceroute:\n" +
    "You will need to upgrade your terminal to a root terminal by typing your password to the terminal you used to open DDT.\n\n" +
    "If you chose one of these three scans: ICMP, TCP, or UDP, you only need to provide a hostname.\n\n" +
    "If you chose custom scan, you can type your customized traceroute option.\n" +
    "For example: -I -p 12345\n\n" +
    "Step 1: Enter a Hostname/IP address.\n" +
    "       Eg: 192.168.0.1\n\n" +
    "Step 2: (Optional) Enter any additional options.\n\n" +
    "Step 3: Select a scan option.\n" +
    "       Eg: Traceroute UDP scan\n\n" +
    "Step 4: Click Scan to commence Traceroute operation.\n\n" +
    "Step 5: View the Output block below to view the results of the tool's execution.";

//Traceroute Options
const tracerouteSwitch = [
    "Traceroute ICMP scan",
    "Traceroute TCP scan",
    "Traceroute UDP scan",
    "Traceroute custom scan",
];

//Tool name must be capital or jsx will cry out errors :P
const TracerouteTool = () => {
    var [output, setOutput] = useState("");
    const [selectedScanOption, setSelectedTracerouteOption] = useState("");

    let form = useForm({
        initialValues: {
            hostname: "",
            portNumber: "",
            tracerouteOptions: "",
        },
    });

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
        setOutput("");
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit({ ...values, tracerouteSwitch: selectedScanOption }))}>
            <Stack>
                {UserGuide(title, description_userguide)}
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
