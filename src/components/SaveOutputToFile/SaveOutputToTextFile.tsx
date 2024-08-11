import { TextInput, Checkbox, Button } from "@mantine/core";
import { BaseDirectory, writeTextFile, createDir } from "@tauri-apps/api/fs";
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

    const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFilename = e.currentTarget.value;
        setFilename(newFilename);
    };

    const handleSave = () => {
        if (outputToSave && filename && allowSave) {
            const outputDir = `./Deakin-Detonator-Toolkit/OutputFiles/`;
            createDir(outputDir, { dir: BaseDirectory.Home, recursive: true });
            writeTextFile(outputDir + filename, outputToSave, { dir: BaseDirectory.Home });
            onSave(); // Call the onSave callback to perform post save actions in caller
        }
    };

    return (
        <>
            {allowSave && (
                <>
                    <TextInput
                        label={"Output filename"}
                        placeholder={"output.txt"}
                        value={filename}
                        onChange={handleFilenameChange}
                    />
                    <Button type={"button"} onClick={handleSave} color="teal">
                        Save output to file
                    </Button>
                </>
            )}
            {hasSaved && (
                <div className="save-message">
                    Output has been saved! <br />
                    Output save file: /Deakin-Detonator-Toolkit/OutputFiles/{filename}
                </div>
            )}
        </>
    );
}
