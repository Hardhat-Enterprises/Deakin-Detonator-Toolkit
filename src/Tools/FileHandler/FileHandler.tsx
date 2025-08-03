import { invoke } from "@tauri-apps/api";
import { v4 as uuidv4 } from "uuid";

export function generateFileName(fileName: string, output: boolean = false): string {
    const dateTime = new Date().toISOString().replace(/[-:.]/g, "");
    const uniqueString = uuidv4();
    let generatedFileName = `${fileName}_${dateTime}_${uniqueString}`;
    generatedFileName += output ? "output.txt" : "";
    return generatedFileName;
}

export function generateFilePath(componentName: string): string {
    return "/tmp/ddt/" + componentName;
}
