use std::fs;
use std::io::Write;
use std::path::Path;
use serde::Serialize;
use rss::Channel;
use reqwest;

#[tauri::command]
pub fn save_file(
    file_data: Vec<u8>,
    file_path: String,
    file_name: String,
) -> Result<String, String> {
    let full_path = format!("{}/{}", file_path, file_name);
    let path = Path::new(&full_path);

    // Check if the file already exists and starts with "DDT-Import"
    if path.exists() {
        // Clear the existing file and write new data
        let mut file = match fs::OpenOptions::new()
            .write(true)
            .truncate(true)
            .open(&full_path)
        {
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

#[derive(Serialize)]
pub struct NewsItem {
    pub title: String,
    pub link: String,
    pub description: String,
    pub pub_date: String,
}

#[tauri::command]
pub async fn fetch_hacker_news() -> Result<Vec<NewsItem>, String> {
    let url = "https://feeds.feedburner.com/TheHackersNews";

    let resp = reqwest::get(url)
        .await
        .map_err(|e| format!("Failed to fetch RSS feed: {}", e))?;

    let body = resp.text().await.map_err(|e| e.to_string())?;

    let channel = Channel::read_from(body.as_bytes()).map_err(|e| e.to_string())?;

    let news = channel
        .items()
        .iter()
        .map(|item| NewsItem {
            title: item.title().unwrap_or("No title").to_string(),
            link: item.link().unwrap_or("#").to_string(),
            description: item.description().unwrap_or("").to_string(),
            pub_date: item.pub_date().unwrap_or("Unknown").to_string(),
        })
        .collect();

    Ok(news)
}
