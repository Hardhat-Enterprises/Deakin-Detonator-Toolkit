use std::fs;
use std::io::Write;
use std::path::Path;

#[tauri::command]
pub fn save_file(file_data: Vec<u8>, file_path: String, file_name: String) -> Result<String, String> {
    let full_path = format!("{}/{}", file_path, file_name);
    let path = Path::new(&full_path);

    // Check if the file already exists and starts with "DDT-Import"
    if path.exists() {
        // Clear the existing file and write new data
        let mut file = match fs::OpenOptions::new().write(true).truncate(true).open(&full_path) {
            Ok(file) => file,
            Err(_) => return Err("Failed to open file for writing.".to_string()),
        };

        if let Err(_) = file.write_all(&file_data) {
            return Err("Failed to write file data.".to_string());
        }

        return Ok("File written successfully.".to_string());
    }

    // Check if the parent directory exists, create if not
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            if let Err(_) = fs::create_dir_all(parent) {
                return Err("Failed to create directory.".to_string());
            }
        }
    }

    // Write file data to the specified path
    let mut file = match fs::File::create(&full_path) {
        Ok(file) => file,
        Err(_) => return Err("Failed to create file.".to_string()),
    };

    if let Err(_) = file.write_all(&file_data) {
        return Err("Failed to write file data.".to_string());
    }

    Ok("File saved successfully.".to_string())
}