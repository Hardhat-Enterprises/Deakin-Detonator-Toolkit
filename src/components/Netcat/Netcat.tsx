import { Button, NativeSelect, Stack, TextInput,LoadingOverlay } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
import { UserGuide } from "../UserGuide/UserGuide";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";

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
    "Port Scan",
    "Send File",
    "Receive File",
    "Website Port scan",
    "Interactive terminal/Listen (for chat or reverse shell) [Beta]",
];

//Tool name must be capital or jsx will cry out errors :P
const NetcatTool = () => {
    var [output, setOutput] = useState("");
    const [selectedScanOption, setSelectedNetcatOption] = useState("");
    const [pid, setPid] = useState("");
    const [loading, setLoading] = useState(false);
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    let form = useForm({
        initialValues: {
            ipAddress: "",
            portNumber: "",
            netcatOptions: "",
            websiteUrl: "",
            filePath: "",
        },
    });

    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output
    }, []);
    // Uses the onTermination callback function of runCommandGetPidAndOutput to handle
    // the termination of that process, resetting state variables, handling the output data,
    // and informing the user.
    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }
            // Clear the child process pid reference
            setPid("");
            // Cancel the Loading Overlay
            setLoading(false);

            // Allow Saving as the output is finalised
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    // Sends a SIGTERM signal to gracefully terminate the process
    const handleCancel = () => {
        if (pid !== null) {
            const args = [`-15`, pid];
            CommandHelper.runCommand("kill", args);
        }
    };

    // Actions taken after saving the output
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };


    const onSubmit = async (values: FormValuesType) => {
        
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);
        setLoading(true);
        //Starts off with the IP address after netcat

        //Ex: nc <ip address>
        let args = [``];

        //Switch case
        switch (values.netcatOptions) {
            case "Port Scan": //nc syntax: nc -zv <ip address/hostname> <port range>
                //addition of -n will not perform any dns or name lookups.
                args = [`-zvn`];
                args.push(`${values.ipAddress}`);
                args.push(`${values.portNumber}`);

                try {
                    let result = await CommandHelper.runCommandGetPidAndOutput("nc", args,handleProcessData,handleProcessTermination);
                    setPid(result.pid);
                    setOutput(result.output);
                } catch (e: any) {
                    setOutput(e.message);
                }
                

                break;

            case "Send File": //Sends file from attacker to victim, syntax: nc -w 15 <Dest IP address> <Port number> < <FileName>
                args = [`-w 15`]; //I set the timeout on 15 by default, you can remove it if you want
                args.push(`${values.ipAddress} ${values.portNumber} < ${values.filePath}`);

                try {
                    let result = await CommandHelper.runCommandGetPidAndOutput("nc", args,handleProcessData,handleProcessTermination);
                    setPid(result.pid);
                    setOutput(result.output);
                } catch (e: any) {
                    setOutput(e.message);
                }

                break;

            case "Receive File": //Receives file from victim to attacker, syntax: nc -l <port number> > filename.file
                args = [`-lp`];
                args.push(`${values.portNumber} > ${values.filePath}`);

                try {
                    let result = await CommandHelper.runCommandGetPidAndOutput("nc", args,handleProcessData,handleProcessTermination);
                    setPid(result.pid);
                    setOutput(result.output);
                } catch (e: any) {
                    setOutput(e.message);
                }

                break;

            case "Website Port scan": //Scans a website for ports, syntax: nc -zv <hostname> <port range>
                args = [`-zv`]; //PLease only use website portscan on a website/Domain that you own
                args.push(`${values.websiteUrl}`);
                args.push(`${values.portNumber}`);

                try {
                    let result = await CommandHelper.runCommandGetPidAndOutput("nc", args,handleProcessData,handleProcessTermination);
                    setPid(result.pid);
                    setOutput(result.output);
                } catch (e: any) {
                    setOutput(e.message);
                }

                break;

            case "Interactive terminal/Listen (for chat or reverse shell) [Beta]":
                //Beta stage
                //The script executes a separate qterminal session that runs netcat listen command
                //The script runs like the normal netcat listen where the user can communicate between the attacker (kali) and the victim (VM2)
                //Not sure how to add output to the tool
                args = [`/usr/share/ddt/Bash-Scripts/netcatTerminal.sh`];
                args.push(`${values.portNumber}`);

                try {
                    let result = await CommandHelper.runCommandGetPidAndOutput("nc", args,handleProcessData,handleProcessTermination);
                    setPid(result.pid);
                    setOutput(result.output);
                } catch (e: any) {
                    setOutput(e.message);
                }

                break;
        }
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    //<ConsoleWrapper output={output} clearOutputCallback={clearOutput} /> prints the terminal on the tool
    return (
        <form onSubmit={form.onSubmit((values) => onSubmit({ ...values, netcatOptions: selectedScanOption }))}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <LoadingOverlay visible={loading} />
            <Stack>
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
                
                {SaveOutputToTextFile_v2 (output, allowSave, hasSaved, handleSaveComplete)}
                <Button type={"submit"}>start netcat</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default NetcatTool;
