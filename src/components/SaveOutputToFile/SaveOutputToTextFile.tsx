import { TextInput, Checkbox } from "@mantine/core";
import { BaseDirectory, writeTextFile } from "@tauri-apps/api/fs";
import { useState } from "react";

export function SaveOutputToTextFile(outputToSave: string) {
    const [checkedSaveOutputToFile, setCheckedSaveOutputToFile] = useState(false);
    const [filename, setFilename] = useState("");

    const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFilename = e.currentTarget.value;
        setFilename(newFilename);
    };

    if (outputToSave && filename && checkedSaveOutputToFile) {
        writeTextFile(`./Deakin-Detonator-Toolkit/OutputFiles/` + filename, outputToSave, { dir: BaseDirectory.Home });
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
