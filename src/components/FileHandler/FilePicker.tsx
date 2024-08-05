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
    placeholderText: string;
    multiple?: boolean;
    labelText: string;
}

export function FilePicker({
    fileNames,
    setFileNames,
    componentName,
    maxFileNum = 1,
    withAsterisk,
    placeholderText,
    multiple,
    labelText,
    ...fileInputProps
}: FilePickerProps) {
    const theme = useMantineTheme();
    const fileDataPath = generateFilePath(componentName);
    const [error, setError] = React.useState<string | null>(null);

    /**
     *  Handles the change event.
     * @remarks
     * This function is used to handle the onChange event and save the file(s).
     * It exists to enable debugging and a iterative call of the save_file function.
     *
     * @param payload - File(s) to be saved.
     */
    const handleChange = async (payload: File[] | File) => {
        console.log("handleChange called");

        if (!payload) {
            setFileNames([]);
            return;
        }

        // Convert uploaded files to an array so its easier to handle
        let files: File[] = [];
        files = files.concat(payload);

        const fileNamesUpload = files.map((files) => generateFileName(files.name));

        // Limit the number of files to allow imported
        if (multiple && fileNamesUpload.length > maxFileNum) {
            const errorText = `Only ${maxFileNum} files can be imported at a time.`;
            console.log(`Error: ${errorText}`);
            setError(`Error: ${errorText}`);
            return;
        }

        setError(null);
        setFileNames(fileNamesUpload);

        for (let i = 0; i < files.length; i++) {
            await saveFile([files[i]], fileNamesUpload[i], fileDataPath);
        }
    };

    /**
     * Saves the selected file.
     *
     * @remarks
     * This function is used to create a call to the backend (rust) to
     * save a file within the allowed path.
     *
     * @param files - An array of files to be saved.
     * @returns The filepath and file name tuple.
     */
    const saveFile = async (files: File[], fileNameUpload: String, filePathUpload: string) => {
        try {
            console.log("Saving file: ", files);
            const file = files[0];
            const reader = new FileReader();

            reader.onload = async (event) => {
                if (event.target?.result) {
                    const fileDataUpload = Array.from(new Uint8Array(event.target.result as ArrayBuffer));
                    console.log("saving file");
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
        <FileInput
            {...fileInputProps}
            multiple={multiple}
            clearable={true}
            placeholder={placeholderText}
            onChange={handleChange}
            withAsterisk={withAsterisk}
            label={labelText}
            error={error}
        ></FileInput>
    );
}
