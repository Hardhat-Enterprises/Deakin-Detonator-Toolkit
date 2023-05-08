import { Button, LoadingOverlay, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Traceroute Tool";
const description_userguide = "How to use Traceroute tool:\n" 
+ "You will need to upgrade your terminal to a root terminal by typing your password to the terminal you used to open DDT\n"
+ "If you chose one of these three scans: ICMP, TCP, UDP you will only need to provide a hostname\n"
+ "If you chose custom scan you can type your customized traceroute option"
+ "For example: -I -p 12345";

//Variables
interface FormValuesType {
    hostname: string;
    portNumber: string;
    tracerouteSwitch: string;
    tracerouteOptions: string;
}

//Netcat Options
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

    const onSubmit = async (values: FormValuesType) => {
        let args = [``];

        //Switch case
        switch (values.tracerouteSwitch) {
            case "Traceroute ICMP scan": //traceroute syntax: traceroute -I <hostname>
                args = [`/usr/share/ddt/Tracerouteshell.sh`];
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
                args = [`/usr/share/ddt/Tracerouteshell.sh`];
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
                args = [`/usr/share/ddt/Tracerouteshell.sh`];
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
                args = [`/home/kali/Desktop/Deakin-Detonator-Toolkit/src/components/Traceroute/Tracerouteshell.sh`];
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
                <Button type={"submit"}>start netcat</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default TracerouteTool;
