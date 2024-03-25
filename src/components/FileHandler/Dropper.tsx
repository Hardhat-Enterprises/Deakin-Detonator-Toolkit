import { Group, Text, useMantineTheme } from '@mantine/core';
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE, MIME_TYPES } from '@mantine/dropzone';
import { IconFile } from '@tabler/icons';
import { invoke } from '@tauri-apps/api'
import { generateFileName, generateFilePath } from './FileHandler';
import React from 'react';

interface DropperProps {
    fileNames: string[];
    setFileNames: React.Dispatch<React.SetStateAction<string[]>>;
    componentName: string;
    maxFileNum: number;
}

export function Dropper({ fileNames, setFileNames, componentName, maxFileNum, ...dropzoneProps }: DropperProps) {
    const theme = useMantineTheme();
    const fileDatahPath = generateFilePath(componentName);

    /**
     *  Handles the drop event.
     * @remarks
     * This function is used to handle the drop event and save the file.
     * It exists to enable debugging and a iterative call of the save_file function. 
     * 
     * @param files - An array of files to be saved.
     */
    const handle_drop = async (files: File[]) => {
        console.log("handleDrop called");
        const fileNamesUpload = files.map((file) => generateFileName(file.name));
        
        // Limit the number of files to allow imported
        if (fileNamesUpload.length > maxFileNum) {
            console.log(`Only ${maxFileNum} files can be imported at a time.`);
            return;
        }
        
        setFileNames(fileNamesUpload);

        for (let i = 0; i < files.length; i++) {
            await save_file([files[i]], fileNamesUpload[i], fileDatahPath);
        }
    }

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
    const save_file = async (files: File[], fileNameUpload: String, filePathUpload: string) => {
        try {
            console.log("Saving file: ", files); 
            const file = files[0];
            const reader = new FileReader();
        
            reader.onload = async (event) => {
                if (event.target?.result) {
                    const fileDataUpload = Array.from(new Uint8Array(event.target.result as ArrayBuffer));
                    console.log("saving file");
                    await invoke("save_file", { fileData: fileDataUpload, filePath: filePathUpload, fileName: fileNameUpload });
                }
            };
        
            reader.onerror = (error) => {
                console.error("Error reading file: ", error);
            };
        
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error("Error in save_file function: ", error);
        }
    }

    return (
        <Dropzone {...dropzoneProps}
            onDrop={handle_drop}
            onReject={(files) => console.log('rejected files', files)}
            maxSize={3 * 1024 ** 2}
        >
            <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
                {fileNames.length === 0 ? (
                    <div>
                        <Text size="xl" inline>
                            Click to select a file
                        </Text>
                    </div>
                ) : (
                    fileNames.map((fileName) => (
                        <div key={fileName} style={{ display: 'flex', alignItems: 'center' }}>
                            <IconFile size={50} />
                            <Text>{fileName.split('_')[0]}</Text>
                        </div>
                    ))
                )}
            </Group>
        </Dropzone>
    );
}