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
const description = "TShark is a tool used to..."; // Description of the component.
const steps =
    "Step 1: Type in the name of your fake host.\n" +
    "Step 2: ...";
const sourceLink = ""; // Link to the source code (or Kali Tools).
const tutorial = ""; // Link to the official documentation/tutorial.
const dependencies = ["tshark"]; // Contains the dependencies required by the component.

//Variables
interface FormValuesType { //Relevant form values to be added as tshark options are added
    tsharkOptions: string;
    interface: string;
    filePath: string; 
    sniffDuration: string;
}

//TShark Options
const tsharkOptions = [ //More options to be added (version check could be kept?)
    "Version Check",
    "Sniffer"
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
            sniffDuration: ""
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
        const duration = values.sniffDuration == "" ? " -a duration:60" : ` -a duration:${values.sniffDuration}`

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

            case "Sniffer": //Sniffs for packets and outputs it to a fule, duration set to 60 as default
                let command = `tshark -i ${values.interface} -w ${values.filePath}${duration}`;

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
                <TextInput label={"Interface"} required {...form.getInputProps("interface")} />
                <TextInput label={"File/File Path"} required {...form.getInputProps("filePath")} />
                <TextInput label={"Sniff Duration (seconds)"} {...form.getInputProps("sniffDuration")} />
                <Button type={"submit"}>start tshark</Button>
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
        </RenderComponent>
    );
};

export default TShark;
