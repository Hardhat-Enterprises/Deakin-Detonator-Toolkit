import { Group, Text, useMantineTheme } from '@mantine/core';
import { IconUpload, IconFile, IconX } from '@tabler/icons';
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE, MIME_TYPES } from '@mantine/dropzone';
import { invoke } from '@tauri-apps/api'
import { generateFileName, generateFilePath } from './FileHandler';
import React, { useState } from 'react';

interface DropperProps {
    fileNames: string[];
    setFileNames: React.Dispatch<React.SetStateAction<string[]>>;
    componentName: string;
}

export function Dropper({ fileNames, setFileNames, componentName, ...dropzoneProps }: DropperProps) {
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
                <div>
                    <Text size="xl" inline>
                        Click to select a file
                    </Text>
                </div>
            </Group>
        </Dropzone>
    );
}