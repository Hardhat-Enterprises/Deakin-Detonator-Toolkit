import { invoke } from '@tauri-apps/api';
import { v4 as uuidv4 } from 'uuid';

export function generateFileName(fileName: string): string {
    const dateTime = new Date().toISOString().replace(/[-:.]/g, '');
    const uniqueString = uuidv4();
    const generatedFileName = `${fileName}_${dateTime}_${uniqueString}`;
    return generatedFileName;
}

export function generateFilePath(componentName: string): string {
    return "/usr/share/ddt/file_handler/" + componentName;
}