import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "GoldenEye";
const description_userguide =
    "GoldenEye is a HTTP DoS Test Tool, where it withholds the potential to test whether or not a site is susceptible " +
    "to a Denial of Service (DoS) attack. The tool allows for several connection in parallel against a URL to check " +
    "if the web sever is able to be compromised.\n\nFurther information can be found at: https://www.kali.org/tools/goldeneye/\n\n" +
    "Using GoldenEye:\n" +
    "Step 1: Enter a valid URL of the target.\n" +
    "       Eg: https://www.google.com\n\n" +
    "Step 2: Enter any additional options for the scan.\n" +
    "       Eg: U\n\n" +
    "Step 3: Enter any additional parameters for the scan.\n" +
    "       Eg: W 100\n\n" +
    "Step 4: Click Scan to commence GoldenEye's operation.\n\n" +
    "Step 5: View the Output block below to view the results of the tools execution.";

interface FormValues {
    url: string;
    options: string;
    param: string;
}

const GoldenEye = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            url: "",
            options: "",
            param: "",
        },
    });

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput
                    label={"Url of the target"}
                    placeholder={"Example: https://www.google.com"}
                    required
                    {...form.getInputProps("url")}
                />
                <TextInput label={"Options"} placeholder={"Example: U"} {...form.getInputProps("options")} />
                <TextInput label={"Parameters"} placeholder={""} {...form.getInputProps("param")} />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default GoldenEye;
