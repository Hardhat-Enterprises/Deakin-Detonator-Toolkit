import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { Child } from "@tauri-apps/api/shell";


const title = "Dnsrecon";
const description_userguide =
    "Dnsrecon is a python script that is used to find domain name servers and PLACEHOLDER . " +
    "This is a dictionary-based attack that takes place upon a web server and will analyse the PLACEHOLDER " +
    "results within this process.\n\nHow to use Dirb:\n\nStep 1: Enter a valid URL.\n PLACEHOLDER" +
    "       E.g. https://www.deakin.edu.au\n\nStep 2: Enter a file directory pathway to access PLACEHOLDER" +
    "a wordlist\n       E.g. home/wordlist/wordlist.txt\n\nStep 3: Click Scan to commence " +
    "the Dirb operation.\n\nStep 4: View the Output block below to view the results of the tool's execution.";

interface FormValues {
    url: string;
}


export function Dnsrecon() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] =useState("");

    let form = useForm({
        initialValues: {
            url: "",
        },
    });

    // call back function
    const handleProcessData  = useCallback(
        (data: String) => {
            setOutput((prevOutput) => prevOutput + "\n" + data);
        },
        []
    );
    const handleProcessTermination = useCallback(
        ({code, signal}: {code: number, signal: number}) =>{
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData('\nProcess terminated with exit code: ${code} and signal code: ${signal}');
            }    
            // clear the child process
            setPid("");
            //cancel the loading Overlay
            setLoading(false);

        },
        [handleProcessData]
    );

    // sends a Sigterm signal to terminate
    const handleCancel = () => {
        if (pid !==null) {
            const args = ['-15', pid];
            CommandHelper.runCommand("kill",args);
        }
    };
            

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = ["-d", values.url];
        try{
            const result = await CommandHelper.runCommandGetPidAndOutput("dnsrecon", args, handleProcessData, handleProcessTermination);
            setPid(result.pid);
            setOutput(result.output);
        } catch (e: any){
            setOutput(e.message);
        }    
        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <LoadingOverlay visible={loading} />
            {loading && (
                <div>
                    <Button variant="outline" color="red" style={{zIndex: 1001}} onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            )}
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label={"URL"} required {...form.getInputProps("url")} />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
export default Dnsrecon;
