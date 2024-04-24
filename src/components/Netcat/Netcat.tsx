import { Button, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
import { UserGuide } from "../UserGuide/UserGuide";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

const title = "Netcat Tool";
const description_userguide =
    "Netcat is a powerful tool that is used to connect two machines together for communication and for other uses.\n" +
    "How to use this netcat tool:\n" +
    "- If you want to listen for connections for chat or reverse shell choose the Interactive shell/Listen option and provide \n a port number.\n" +
    "- If you want to scan for ports, provide an IP address and a port range\n" +
    "- If you want to send a file, provide the destination IP address, Port number, and File name\n" +
    "- If you want to receive a file, provide a port number and the File name.\n" +
    "- If you want to port scan a domain, provide Domain name and a Port number. \n" +
    "Note: You should only use website port scan to a domain that you own.\n" +
    "Note 2: Using the sending/receiving file option might seem like it is not working, but it is working.\n" +
    "You will need a second machine to see the file transfer\n" +
    "For more information go to the reference page and click on netcat, alternatively Google is your friend.";

//Variables
interface FormValuesType {
    ipAddress: string;
    portNumber: string;
    netcatOptions: string;
    websiteUrl: string;
    filePath: string;
}

//Netcat Options
const netcatOptions = [
    "Listen",
    "Port Scan",
    "Send File",
    "Receive File",
    "Website Port scan",
];

//Tool name must be capital or jsx will cry out errors :P
const NetcatTool = () => {
    var [output, setOutput] = useState("");
    const [selectedScanOption, setSelectedNetcatOption] = useState("");
    const [pid, setPid] = useState("");
    const [loading, setLoading] = useState(false);

    let form = useForm({
        initialValues: {
            ipAddress: "",
            portNumber: "",
            netcatOptions: "",
            websiteUrl: "",
            filePath: "",
        },
    });

    //handleProcessData for the CommandHelper.runCommandGetPidAndOutput
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Append new data to the previous output.
    }, []);

    //handleProcessTermination for the CommandHelper.runCommandGetPidAndOutput
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            // If the process was successful, display a success message.
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");

                // If the process was terminated manually, display a termination message.
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");

                // If the process was terminated with an error, display the exit and signal codes.
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }

            // Clear the child process pid reference. There is no longer a valid process running.
            setPid("");

            // Cancel the loading overlay. The process has completed.
            setLoading(false);
        },
        [handleProcessData] // Dependency on the handleProcessData callback
    );

    const onSubmit = async (values: FormValuesType) => {
        //Starts off with the IP address after netcat
        //Ex: nc <ip address>
        let args = [``];

        //Switch case
        switch (values.netcatOptions) {
            case "Listen": //Sets up nc listener, nc syntax: nc -lvp <port number>
                args = ["-lvp"];
                args.push(values.portNumber);

                CommandHelper.runCommandGetPidAndOutput("nc", args, handleProcessData, handleProcessTermination)
                    .then(({ output, pid }) => {
                // Update the UI with the results from the executed command
                    setOutput(output);
                    console.log(pid);
                    setPid(pid);
                })
                .catch((error) => {
                    // Display any errors encountered during command execution
                    setOutput(error.message);
                    // Deactivate loading state
                    setLoading(false);
                });

                break;

            case "Port Scan": //nc syntax: nc -zv <ip address/hostname> <port range>
                //addition of -n will not perform any dns or name lookups.
                args = [`-zvn`];
                args.push(`${values.ipAddress}`);
                args.push(`${values.portNumber}`);

                try {
                    let output = await CommandHelper.runCommand("nc", args);
                    setOutput(output);
                } catch (e: any) {
                    setOutput(e);
                }

                break;

            case "Send File": //Sends file from attacker to victim, syntax: nc -w 15 <Dest IP address> <Port number> < <FileName>
                args = [`-w 15`]; //I set the timeout on 15 by default, you can remove it if you want
                args.push(`${values.ipAddress} ${values.portNumber} < ${values.filePath}`);

                try {
                    let output = await CommandHelper.runCommand("nc", args);
                    setOutput(output);
                } catch (e: any) {
                    setOutput(e);
                }

                break;

            case "Receive File": //Receives file from victim to attacker, syntax: nc -l <port number> > filename.file
                args = [`-lp`];
                args.push(`${values.portNumber} > ${values.filePath}`);

                try {
                    let output = await CommandHelper.runCommand("nc", args);
                    setOutput(output);
                } catch (e: any) {
                    setOutput(e);
                }

                break;

            case "Website Port scan": //Scans a website for ports, syntax: nc -zv <hostname> <port range>
                args = [`-zv`]; //PLease only use website portscan on a website/Domain that you own
                args.push(`${values.websiteUrl}`);
                args.push(`${values.portNumber}`);

                try {
                    let output = await CommandHelper.runCommand("nc", args);
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

    //<ConsoleWrapper output={output} clearOutputCallback={clearOutput} /> prints the terminal on the tool
    return (
        <form onSubmit={form.onSubmit((values) => onSubmit({ ...values, netcatOptions: selectedScanOption }))}>
            <Stack>
                {LoadingOverlayAndCancelButton(loading, pid)}
                {UserGuide(title, description_userguide)}
                <TextInput label={"IP address"} {...form.getInputProps("ipAddress")} />
                <TextInput label={"Port number/Port range"} required {...form.getInputProps("portNumber")} />
                <TextInput label={"File path"} {...form.getInputProps("filePath")} />
                <TextInput label={"Domain name"} {...form.getInputProps("websiteUrl")} />
                <NativeSelect
                    value={selectedScanOption}
                    onChange={(e) => setSelectedNetcatOption(e.target.value)}
                    title={"Netcat option"}
                    data={netcatOptions}
                    required
                    placeholder={"Pick a scan option"}
                    description={"Type of scan to perform"}
                />
                <Button type={"submit"}>start netcat</Button>
                {SaveOutputToTextFile(output)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default NetcatTool;
