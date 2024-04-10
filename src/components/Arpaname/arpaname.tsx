import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

const title = "Arpaname Tool";
const description_userguide =
    "Arpaname translates IP addresses (IPv4 and IPv6) to the corresponding IN-ADDR.ARPA or IP6.ARPA names.";

interface FormValuesType {
    ipAddress: string;
}

const ArpanameTool = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    let form = useForm<FormValuesType>({
        initialValues: {
            ipAddress: "",
        },
    });

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

    const validateIPAddress = (ip: string) => {
        const ipPattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/
        return ipPattern.test(ip);
    };

    const onSubmit = async (values: FormValuesType) => {
        if (!validateIPAddress(values.ipAddress)) {
            setOutput("The input is not a valid IP address. Please try again.");
            return;
        }
        
        setLoading(true);
        const args = [values.ipAddress];
      
        try {
          const result = await CommandHelper.runCommandGetPidAndOutput(
            "arpaname",
            args,
            handleProcessData,
            handleProcessTermination
          );
          setOutput(result.output);
          setPid(result.pid);
        } catch (e: any) {
          setOutput(`An error occurred: ${e.message}`);
          setPid("");
        } finally {
          setLoading(false);
        }
      };

    const clearOutput = useCallback(() => {
        setOutput("");
        setErrorMessage("");
    }, [setOutput, setErrorMessage]);

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack spacing="lg">
                {UserGuide(title, description_userguide)}
                <TextInput
                    label={"IP Address"}
                    placeholder={"Enter IP Address"}
                    required
                    error={errorMessage}
                    {...form.getInputProps("ipAddress")}
                />
                <Button type={"submit"}>Lookup</Button>
                {SaveOutputToTextFile(output)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default ArpanameTool;
