import { TextInput, Checkbox, Button, Alert } from "@mantine/core";
import { BaseDirectory, writeTextFile, createDir } from "@tauri-apps/api/fs";
import { save } from "@tauri-apps/api/dialog";
import { useState } from "react";

export function SaveOutputToTextFile(outputToSave: string) {
    const [checkedSaveOutputToFile, setCheckedSaveOutputToFile] = useState(false);
    const [filename, setFilename] = useState("");

    const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFilename = e.currentTarget.value;
        setFilename(newFilename);
    };

    if (outputToSave && filename && checkedSaveOutputToFile) {
        const outputDir = `./Deakin-Detonator-Toolkit/OutputFiles/`;
        createDir(outputDir, { dir: BaseDirectory.Home, recursive: true });
        writeTextFile(outputDir + filename, outputToSave, { dir: BaseDirectory.Home });
    }

    return (
        <>
            <Checkbox
                label={"Save Output To File"}
                checked={checkedSaveOutputToFile}
                onChange={(e) => setCheckedSaveOutputToFile(e.currentTarget.checked)}
            />
            {checkedSaveOutputToFile && (
                <TextInput
                    label={"Output filename"}
                    placeholder={"output.txt"}
                    value={filename}
                    onChange={handleFilenameChange}
                />
            )}
        </>
    );
}

export function SaveOutputToTextFile_v2(
    outputToSave: string,
    allowSave: boolean,
    hasSaved: boolean,
    onSave: () => void
) {
    const [filename, setFilename] = useState("");
    const [showError, setShowError] = useState(false);
    const [savedPath, setSavedPath] = useState("");

    const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFilename = e.currentTarget.value;
        setFilename(newFilename);
        // Clear error when user starts typing
        if (showError && newFilename.trim()) {
            setShowError(false);
        }
    };

    const handleSave = async () => {
        // Check if filename is empty or just whitespace
        if (!filename.trim()) {
            setShowError(true);
            return;
        }

        if (outputToSave && filename && allowSave) {
            try {
                // Ensure filename has .txt extension
                let finalFilename = filename.trim();
                if (!finalFilename.toLowerCase().endsWith(".txt")) {
                    finalFilename += ".txt";
                }

                // Open save dialog with default filename
                const filePath = await save({
                    defaultPath: finalFilename,
                    filters: [
                        {
                            name: "Text Files",
                            extensions: ["txt"],
                        },
                    ],
                });

                // If user didn't cancel the dialog
                if (filePath) {
                    await writeTextFile(filePath, outputToSave);
                    setSavedPath(filePath);
                    setShowError(false); // Clear any existing error
                    onSave(); // Call the onSave callback to perform post save actions in caller
                }
            } catch (error) {
                console.error("Error saving file:", error);
                setShowError(true);
            }
        }
    };

    return (
        <>
            {allowSave && (
                <>
                    {showError && (
                        <Alert title="Error" color="red">
                            Please enter a filename before saving the output.
                        </Alert>
                    )}
                    <TextInput
                        label={"Output filename"}
                        placeholder={"output.txt"}
                        value={filename}
                        onChange={handleFilenameChange}
                        error={showError ? "Filename is required" : null}
                    />
                    <Button type={"button"} onClick={handleSave} style={{ backgroundColor: "#1C5F4A", color: "white" }}>
                        Save as Text File (.txt)
                    </Button>
                </>
            )}
            {hasSaved && (
                <div className="save-message">
                    Output has been saved! <br />
                    Output save file: {savedPath || `/Deakin-Detonator-Toolkit/OutputFiles/${filename}`}
                </div>
            )}
        </>
    );
}
