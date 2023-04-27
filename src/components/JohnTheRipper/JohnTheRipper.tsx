import { Button, LoadingOverlay, NativeSelect, Stack, TextInput} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { writeTextFile, BaseDirectory } from "@tauri-apps/api/fs";

import{ UserGuide} from"../UserGuide/UserGuide";
const title="John the Ripper tool"
const descritpion_userguide= "John the Ripper is a popular and powerful open-source password cracking tool used to test the strength of passwords. It can be used by system administrators and security professionals to audit the passwords on their systems. John the Ripper is available for multiple platforms, including Unix, Windows, macOS, and DOS. It uses various techniques to crack passwords, such as dictionary attacks, brute-force attacks, and hybrid attacks. The tool is highly customizable and has a command-line interface, making it suitable for advanced users. John the Ripper is widely regarded as one of the most effective and efficient password cracking tools available."+"\n\nHow to use John the Ripper:\n\nStep 1: Specify the filepath to the password file that you wish to crack. \nE.g /home/user/passwords.txt\n\nStep 2: Specify the hash that is utilized in the password file. This field is mandatory, as you must specify the hash in order for John the Ripper to crack the password. A wide range of hashes are supported by the tool. \nE.g md5\n\nStep 3: This specifies the format of the password file. A variety of file extensions are supported, including Unix password files, Windows SAM files, and more. This is necessary so as to enable John the Ripper to correctly read the file. \nE.g rar\n\nStep 4: Click crack to commence the tool's execution.\n\nStep 5: View the output block below to view the results of the tool's execution.";



interface FormValuesType {
    filePath: string;
    hash: string;
    fileType: string;
}

const fileTypes = ["zip", "rar"];

const JohnTheRipper = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [selectedFileTypeOption, setSelectedFileTypeOption] = useState("");

    let form = useForm({
        initialValues: {
            filePath: "",
            hash: "",
            fileType: "",
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);

        //if hash is not specified
        if (values.hash.length === 0) {
            const args = [`${values.filePath}`];

            try {
                const result = await CommandHelper.runCommand(`${values.fileType}2john`, args);
                await writeTextFile("hash.txt", result, { dir: BaseDirectory.Temp });
                setOutput(result);
            } catch (e: any) {
                setOutput(e);
            }

            try {
                const args = [`--format=${values.fileType}`, "/tmp/hash.txt"];
                const result = await CommandHelper.runCommand("john", args);
                setOutput(output + "\n" + result);
            } catch (e: any) {
                setOutput(e);
            }

            setLoading(false);
            //if hash is specified
        } else {
            const args = [`--format=${values.fileType}`, `${values.hash}`];
            try {
                const result = await CommandHelper.runCommand("john", args);
                setOutput(output + "\n" + result);
            } catch (e: any) {
                setOutput(e);
            }

            setLoading(false);
        }
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit({ ...values, fileType: selectedFileTypeOption }))}>
            <LoadingOverlay visible={loading} />
            <Stack>
                {UserGuide(title, descritpion_userguide)}
                <TextInput label={"Filepath"} required {...form.getInputProps("filePath")} />
                <TextInput label={"Hash (if known)"} {...form.getInputProps("hash")} />
                <NativeSelect
                    value={selectedFileTypeOption}
                    onChange={(e) => setSelectedFileTypeOption(e.target.value)}
                    title={"File Type"}
                    data={fileTypes}
                    required
                    placeholder={"File Type"}
                    description={"Please select the type of file you want to crack"}
                />
                <Button type={"submit"}>Crack</Button>
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default JohnTheRipper;
