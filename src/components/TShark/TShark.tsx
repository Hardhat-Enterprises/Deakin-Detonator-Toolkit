import { Button, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useCallback } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { RenderComponent } from "../UserGuide/UserGuide";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

// Component Constants.
const title = "TShark"; // Title of the component.
const description = "TShark is a tool used to capture network traffic and write it to a capture file. The captured traffic can be view directly by opening the file, otherwise the Reader option can be used to output the file contents to the output box."; // Description of the component.
const steps =
    "Step 1: Select Sniffer mode.\n" +
    "Step 2: Specify the interface to capture traffic from such as eth0.\n" +
    "Step 3: Specify the output file path (should end with a pcap file).\n" +
    "Step 4: Input the amount of seconds that TShark should capture traffic for (Optional).\n" +
    "Step 5: Input a packet count to determine the total numbe rof packets to scan before stopping (optional).\n" +
    "Step 6: Input a traffic filter to filter for specific trraffic such as tcp (optional).\n" +
    "Step 7: Click start to sniff traffic.\n" +
    "Step 8: Switch to Reader mode.\n" +
    "Step 9: Provide the file path for the capture file and click start.";
const sourceLink = ""; // Link to the source code (or Kali Tools).
const tutorial = ""; // Link to the official documentation/tutorial.
const dependencies = ["tshark"]; // Contains the dependencies required by the component.

//Variables
interface FormValuesType { //Relevant form values to be added as tshark options are added
    tsharkOptions: string;
    interface: string;
    filePath: string; 
    sniffDuration: string;
    trafficFilter: string;
    packetCount: string;
}

//TShark Options
const tsharkOptions = [ //More options to be added (version check could be kept?)
    "Version Check",
    "Sniffer",
    "Reader"
];

const TShark = () => {
    var [output, setOutput] = useState("");
    const [selectedTSharkOption, setSelectedTSharkOption] = useState("");
    const [allowSave, setAllowSave] = useState(false); // State variable to allow saving of output
    const [hasSaved, setHasSaved] = useState(false); // State variable to indicate if output has been saved
    const [loading, setLoading] = useState(false); // State variable to indicate loading state
    const [pid, setPid] = useState("");

    let form = useForm({ //Relevant form values to be added as tshark options are added
        initialValues: {
            interface: "",
            filePath: "",
            sniffDuration: "",
            trafficFilter: "",
            packetCount: "",
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
        // Set loading state to true and disallow output saving
        setLoading(true);
        setAllowSave(false);

        let args = [``];

        //duration set to 60 as defualt if Sniff Duration field is empty
        const duration = values.sniffDuration == "" ? " -a duration:60" : ` -a duration:${values.sniffDuration}`;
        const filter = values.trafficFilter == "" ? "" : ` -f ${values.trafficFilter}`;
        const count = values.packetCount == "" ? "" : ` -c ${values.packetCount}`;

        //Switch case
        switch (values.tsharkOptions) {
            case "Version Check": //This version check option is a baseline to test that TShark functions
                args = [`-version`];

                try {
                    let output = await CommandHelper.runCommand("tshark", args);
                    setOutput(output);
                } catch (e: any) {
                    setOutput(e);
                } finally{
                    // Set loading state to false and allow output saving
                    setLoading(false);
                    setAllowSave(true);
                }

                break;

            case "Sniffer": //Sniffs for packets and outputs it to a fule, duration set to 60 as default, filter set to nothing as default
                let command = `tshark -i ${values.interface} -w ${values.filePath}${duration}${filter}${count}`;

                CommandHelper.runCommandGetPidAndOutput("bash", ["-c", command], handleProcessData, handleProcessTermination)
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
                    })
                    .finally(() => {
                        // Set loading state to false and allow output saving
                        setLoading(false);
                        setAllowSave(true);
                    });
                break;

            case "Reader": //The Reader function reads the traffic from the sniffers output file 
                args = [`-r`];
                args.push(values.filePath);

                try {
                    let output = await CommandHelper.runCommand("tshark", args);
                    setOutput(output);
                } catch (e: any) {
                    setOutput(e);
                } finally{
                    // Set loading state to false and allow output saving
                    setLoading(false);
                    setAllowSave(true);
                }

                break;
        }
    };

     /**
     * Handles the completion of output saving by updating state variables.
     */
     const handleSaveComplete = () => {
        setHasSaved(true); // Set hasSaved state to true
        setAllowSave(false); // Disallow further output saving
    };

    /**
     * Clears the command output and resets state variables related to output saving.
     */
    const clearOutput = () => {
        setOutput(""); // Clear the command output
        setHasSaved(false); // Reset hasSaved state
        setAllowSave(false); // Disallow further output saving
    };

    //<ConsoleWrapper output={output} clearOutputCallback={clearOutput} /> prints the terminal on the tool
    return (
        <RenderComponent
            title={title}
            description={description}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
        <form onSubmit={form.onSubmit((values) => onSubmit({ ...values, tsharkOptions: selectedTSharkOption }))}>
            <Stack>
            {LoadingOverlayAndCancelButton(loading, pid)}
                <NativeSelect
                    value={selectedTSharkOption}
                    onChange={(e) => setSelectedTSharkOption(e.target.value)}
                    title={"TShark option"}
                    data={tsharkOptions}
                    required
                    placeholder={"Pick a TShark option"}
                    description={"Type of action to perform"}
                />
                {selectedTSharkOption === "Sniffer" && (
                    <>
                        <TextInput label={"Interface"} required {...form.getInputProps("interface")} />
                        <TextInput label={"File/File Path"} required {...form.getInputProps("filePath")} />
                        <TextInput label={"Sniff Duration (seconds)"} {...form.getInputProps("sniffDuration")} />
                        <TextInput label={"Packet Count"} {...form.getInputProps("packetCount")} />
                        <TextInput label={"Traffic Filter"} {...form.getInputProps("trafficFilter")} />
                    </>
                )}
                {selectedTSharkOption === "Reader" && (
                    <>
                        <TextInput label={"File/File Path"} required {...form.getInputProps("filePath")} />
                    </>
                )}
                <Button type={"submit"}>start tshark</Button>
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
        </RenderComponent>
    );
};

export default TShark;