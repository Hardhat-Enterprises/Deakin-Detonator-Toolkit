import { Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { open } from "@tauri-apps/api/dialog";
import { useCallback, useState, useEffect } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import { RenderComponent } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";
import { checkAllCommandsAvailability } from "../../utils/CommandAvailability";
import InstallationModal from "../InstallationModal/InstallationModal";
import { FilePicker } from "../FileHandler/FilePicker";
import { generateFilePath } from "../FileHandler/FileHandler";

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
    const [rainbowTablePath, setRainbowTablePath] = useState<string>("");

    const title = "RainbowCrack";
    const description =
        "RainbowCrack is a command line tool that uses rainbow tables to crack password hashes. It supports multiple hash algorithms, including LM, NTLM, MD5, SHA1 and SHA256.";
    const steps =
        "How to use RainbowCrack:\n" +
        "Step 1: Ensure that your rainbow tables (*.rt, *.rtc) are stored in the /usr/share/rainbowcrack directory. \n" +
        "Step 2: To select a rainbow table, use the rainbow table picker. \n" +
        "Step 3: Enter the hash value you want to crack in the input field.\n" +
        "Step 4: To crack multiple hashes from a file, use the hash file picker.\n" +
        "Step 5: If you have LM hashes in a pwdump file, use the hash file picker.\n" +
        "Step 6: For NTLM hashes in a pwdump file, use the hash file picker.\n" +
        "Step 7: Click the Crack " +
        title +
        " button to execute the command and display the results.";
    const sourceLink = "http://project-rainbowcrack.com/";
    const tutorial = "https://docs.google.com/document/d/16j7ejucqvkNHo1p-fcUjxTYV6aAbSPT6TQDUYRgfa_0/edit?usp=sharing";
    const binaryDependencies = ["rcrack"];
    const packageDependencies = ["rainbowcrack"];

    const form = useForm<FormValuesType>({
        initialValues: {
            hashValue: "",
        },
        validate: {
            hashValue: (value) => {
                if (fileNames.length > 0) return null; // skip validation when file is used
                const normalized = value.trim().toLowerCase();

                const isHex = /^[a-f0-9]+$/.test(normalized);

                if (!isHex) return "Hash must be hexadecimal.";

                const length = normalized.length;

                const validLengths = [32, 40, 64]; // MD5/NTLM/LM, SHA1, SHA256
                if (!validLengths.includes(length)) {
                    return "Unsupported hash length. Must be 32, 40, or 64 characters.";
                }

                return null;
            },
        },
    });

    useEffect(() => {
        checkAllCommandsAvailability(binaryDependencies)
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
            setRainbowTablePath("");
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );
    
    const pickRainbowTable = async () => {
        const selected = await open({
            defaultPath: "/usr/share/rainbowcrack", 
            filters: [{ name: "Rainbow Table", extensions: ["rt"] }],
            multiple: false,
        });
        if (typeof selected === "string") {
            const dir = selected.substring(0, selected.lastIndexOf("/"));
            setRainbowTablePath(dir);
        }
    };

    const onSubmit = async (values: FormValuesType) => {
        setLoading(true);
        setAllowSave(false);


	const args = [rainbowTablePath || "."];
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
        setRainbowTablePath("");
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
                    dependencies={packageDependencies}
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
                            error={form.errors.hashValue}
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
		
		    <div style={{ textAlign: "center" }}>
		       <div style={{ textAlign: "center", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>
		       		Select Rainbow Table
		       </div>
		       <label style={{ cursor: "pointer", display: "inline-block" }} onClick={pickRainbowTable}>
				<img
				    src="https://static-00.iconduck.com/assets.00/cloud-upload-icon-2048x2048-fej4g14p.png"
				    alt="Upload"
				    width={80}
				    height={80}
				/>
				<div style={{ fontSize: "14px", color: "#666" }}>
				    {rainbowTablePath ? rainbowTablePath : "Select path for .rt files"}
				</div>
			</label>
		    </div>                    
                    
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
