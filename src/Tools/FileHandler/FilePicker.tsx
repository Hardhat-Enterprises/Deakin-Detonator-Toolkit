import { useMantineTheme, FileInput } from "@mantine/core";
import { invoke } from "@tauri-apps/api";
import { generateFileName, generateFilePath } from "./FileHandler";
import React from "react";

interface FilePickerProps {
    fileNames: string[];
    setFileNames: React.Dispatch<React.SetStateAction<string[]>>;
    componentName: string;
    maxFileNum?: number;
    withAsterisk?: boolean;
    multiple?: boolean;
    labelText?: string;
    placeholderText?: string;
}

export function FilePicker({
    fileNames,
    setFileNames,
    componentName,
    maxFileNum = 1,
    withAsterisk = false,
    multiple = false,
    labelText = "",
    placeholderText = "Upload a file",
}: FilePickerProps) {
    const theme = useMantineTheme();
    const fileDataPath = generateFilePath(componentName);
    const [error, setError] = React.useState<string | null>(null);

    const handleChange = async (payload: File | File[] | null) => {
        if (!payload) {
            setFileNames([]);
            return;
        }

        const files = Array.isArray(payload) ? payload : [payload];
        const fileNamesUpload = files.map((file) => generateFileName(file.name));

        if (multiple && fileNamesUpload.length > maxFileNum) {
            const errorText = `Only ${maxFileNum} files can be imported at a time.`;
            setError(`Error: ${errorText}`);
            return;
        }

        setError(null);
        setFileNames(fileNamesUpload);

        for (let i = 0; i < files.length; i++) {
            await saveFile([files[i]], fileNamesUpload[i], fileDataPath);
        }
    };

    const saveFile = async (files: File[], fileNameUpload: string, filePathUpload: string) => {
        try {
            const file = files[0];
            const reader = new FileReader();

            reader.onload = async (event) => {
                if (event.target?.result) {
                    const fileDataUpload = Array.from(new Uint8Array(event.target.result as ArrayBuffer));
                    await invoke("save_file", {
                        fileData: fileDataUpload,
                        filePath: filePathUpload,
                        fileName: fileNameUpload,
                    });
                }
            };

            reader.onerror = (error) => {
                console.error("Error reading file: ", error);
            };

            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error("Error in save_file function: ", error);
        }
    };

    return (
        <div style={{ textAlign: "center" }}>
            <FileInput
                multiple={multiple}
                clearable
                withAsterisk={withAsterisk}
                label={labelText}
                onChange={handleChange}
                error={error}
                styles={{
                    input: { display: "none" }, // Hide the native input
                }}
            />
            <label
                style={{ cursor: "pointer", display: "inline-block" }}
                onClick={() => {
                    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
                    fileInput?.click(); // Using type assertion to ensure it's an HTMLInputElement
                }}
            >
                <img
                    src="https://static-00.iconduck.com/assets.00/cloud-upload-icon-2048x2048-fej4g14p.png"
                    alt="Upload"
                    width={80}
                    height={80}
                />
                <div style={{ fontSize: "14px", color: "#666" }}>{placeholderText}</div>
            </label>
        </div>
    );
}
