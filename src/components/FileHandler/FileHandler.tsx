import { v4 as uuidv4 } from 'uuid';

class FileHandler {
    generateFileName(name: string): string {
        const dateTime = new Date().toISOString().replace(/[-:.]/g, '');
        const uniqueString = uuidv4();
        const fileName = `${name}_${dateTime}_${uniqueString}`;
        return fileName;
    }
}

export default FileHandler;