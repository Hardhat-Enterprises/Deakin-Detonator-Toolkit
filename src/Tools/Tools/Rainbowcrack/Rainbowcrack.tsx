import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../../utils/CommandHelper";
import { RenderComponent } from "../../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../../utils/CommandAvailability";
import InstallationModal from "../../InstallationModal/InstallationModal";
import { FilePicker } from "../../FileHandler/FilePicker";
import { generateFilePath } from "../../FileHandler/FileHandler";

interface FormValuesType {
    hashValue: string;
}

const RainbowCrack = () => {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [isCommandAvailable, setIsCommandAvailable] = useState(false);
    const [opened, setOpened] = useState(!isCommandAvailable);
    const [loadingModal, setLoadingModal] = useState(true);
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [fileNames, setFileNames] = useState<string[]>([]);

    const title = "RainbowCrack";
    const description =
        "RainbowCrack is a command line tool that uses rainbow tables to crack password hashes. It supports multiple hash algorithms, including LM, NTLM, MD5, SHA1 and SHA256.";
    const steps =
        "How to use RainbowCrack:\n" +
        "Step 1: Ensure that your rainbow tables (*.rt, *.rtc) are stored in a directory.\n" +
        "Step 2: Enter the hash value you want to crack in the input field. For a single hash, use the format: ./rcrack [path to tables] -h [hash].\n" +
        "   - Example: ./rcrack . -h 5d41402abc4b2a76b9719d911017c592\n" +
        "Step 3: To crack multiple hashes from a file, use the format: ./rcrack [path to tables] -l [hash_list_file].\n" +
        "   - Example: ./rcrack . -l hash.txt\n" +
        "Step 4: If you have LM hashes in a pwdump file, use the format: ./rcrack [path to tables] -lm [pwdump_file].\n" +
        "   - Example: ./rcrack . -lm pwdump.txt\n" +
        "Step 5: For NTLM hashes in a pwdump file, use the format: ./rcrack [path to tables] -ntlm [pwdump_file].\n" +
        "   - Example: ./rcrack . -ntlm pwdump.txt\n" +
        "Step 6: Click the Crack " +
        title +
        " button to execute the command and display the results.";
    const sourceLink = "http://project-rainbowcrack.com/";
    const tutorial = "https://docs.google.com/document/d/16j7ejucqvkNHo1p-fcUjxTYV6aAbSPT6TQDUYRgfa_0/edit?usp=sharing";
    const dependencies = ["rainbowcrack"];

    const form = useForm<FormValuesType>({
        initialValues: {
            hashValue: "",
        },
    });

    useEffect(() => {
        checkAllCommandsAvailability(dependencies)
            .then((isAvailable) => {
                setIsCommandAvailable(isAvailable);
                setOpened(!isAvailable);
                setLoadingModal(false);
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                setLoadingModal(false);
            });
    }, []);

    const handleProcessData = useCallback((data: string) => {
        setOutput((prev) => prev + "\n" + data);
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
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);

        const args = ["."];
        if (fileNames.length === 0) {
            args.push("-h", values.hashValue);
        } else {
            const filePath = generateFilePath("Rainbowcrack");
            const dataUploadPath = filePath + "/" + fileNames[0];
            args.push("-l", dataUploadPath);
        }

        CommandHelper.runCommandGetPidAndOutput("rcrack", args, handleProcessData, handleProcessTermination)
            .then(({ output, pid }) => {
                setOutput(output);
                setPid(pid);
            })
            .catch((error) => {
                setOutput(error.message);
                setLoading(false);
            });
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, []);

    const handleSaveComplete = () => {
        setHasSaved(true);
    };

    const resetForm = () => {
        form.reset();
        setOutput("");
        setFileNames([]);
        setAllowSave(false);
        setHasSaved(false);
    };

    return (
        <RenderComponent
            title={title}
            description={description}
            steps={steps}
            tutorial={tutorial}
            sourceLink={sourceLink}
        >
            {!loadingModal && (
                <InstallationModal
                    isOpen={opened}
                    setOpened={setOpened}
                    feature_description={description}
                    dependencies={dependencies}
                />
            )}
            <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                <Stack>
                    {LoadingOverlayAndCancelButton(loading, pid)}

                    {fileNames.length === 0 ? (
                        <TextInput
                            label="Hash Value"
                            required
                            value={form.values.hashValue}
                            onChange={(event) => form.setFieldValue("hashValue", event.currentTarget.value)}
                        />
                    ) : (
                        <div>
                            <strong>Uploaded File:</strong> {fileNames[0]}
                        </div>
                    )}

                    <FilePicker
                        fileNames={fileNames}
                        setFileNames={setFileNames}
                        multiple={false}
                        componentName="Rainbowcrack"
                        labelText="Upload Hash File"
                    />

                    <Button type="submit">Crack</Button>
                    <Button variant="outline" color="red" onClick={resetForm}>
                        Reset
                    </Button>

                    {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}

                    <div
                        style={{
                            backgroundColor: "#1e1e1e",
                            color: "#d4d4d4",
                            padding: "1rem",
                            marginTop: "1rem",
                            borderRadius: "8px",
                            fontFamily: "monospace",
                            maxHeight: "300px",
                            overflowY: "auto",
                            whiteSpace: "pre-wrap",
                            border: "1px solid #444",
                        }}
                    >
                        {output || "Output will appear here after cracking."}
                    </div>
                </Stack>
            </form>
        </RenderComponent>
    );
};

export default RainbowCrack;
