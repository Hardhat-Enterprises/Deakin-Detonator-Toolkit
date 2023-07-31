import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Metagoofil";
const description_userguide =
    "Metagoofil is a tool used to gather information through the extraction of metadata from publicly available documents " +
    "from a target company. The tool is capable of performing a Google search on a target to allow for all documents to be " +
    "identified and downloaded to the local disk. This tool withholds the potential to extract from documents of the following " +
    "file types: pdf, doc, xls, ppt, docx, pptx, xlsx. \n\nOptions for the tool can be found at: https://www.kali.org/tools/metagoofil/\n\n" +
    "Using the tool:\n" +
    "Step 1: Enter a website URL for the tool to search.\n" +
    "       Eg: kali.org\n\n" +
    "Step 2: Enter the desired number of results.\n" +
    "       Eg: 100\n\n" +
    "Step 3: Enter the limit for the number of files to be downloaded\n" +
    "       Eg: 25\n\n" +
    "Step 4: Enter the file type name to be extracted.\n" +
    "       Eg: pdf\n\n" +
    "Step 5: Click scan to commence the Metagoofil operation.\n\n" +
    "Step 6: View the Output block below to view the results of the tools execution.";

interface FormValues {
    webname: string;
    searchmax: string;
    filelimit: string;
    filetype: string;
}

export function Metagoofil() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    let form = useForm({
        initialValues: {
            webname: "",
            searchmax: "",
            filelimit: "",
            filetype: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);

        const args = ["-d", values.webname, "-l", values.searchmax, "-n", values.filelimit, "-t", values.filetype];
        const output = await CommandHelper.runCommand("metagoofil", args);

        setOutput(output);
        setLoading(false);
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput label={"Enter the website for search"} required {...form.getInputProps("webname")} />
                <TextInput
                    label={"Enter number of results (default 100)"}
                    required
                    {...form.getInputProps("searchmax")}
                />
                <TextInput
                    label={"Enter the value for Download file limit)"}
                    required
                    {...form.getInputProps("filelimit")}
                />
                <TextInput label={"Enter your file type"} required {...form.getInputProps("filetype")} />
                <Button type={"submit"}>Scan</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
export default Metagoofil;
