use rss::Channel;
use serde::Serialize;
use tauri::Manager; 
use reqwest;

mod file_handler; 
use file_handler::save_file;

#[derive(Serialize)]
struct NewsItem {
    title: String,
    link: String,
    description: String,
    pub_date: String,
}

#[tauri::command]
fn fetch_hacker_news() -> Result<Vec<NewsItem>, String> {
    let url = "https://feeds.feedburner.com/TheHackersNews";

    let content = reqwest::blocking::get(url)
        .map_err(|e| e.to_string())?
        .text()
        .map_err(|e| e.to_string())?;

    let channel = Channel::read_from(content.as_bytes()).map_err(|e| e.to_string())?;

    let items = channel
        .items()
        .iter()
        .map(|item| NewsItem {
            title: item.title().unwrap_or("No Title").to_string(),
            link: item.link().unwrap_or("").to_string(),
            description: item.description().unwrap_or("").to_string(),
            pub_date: item.pub_date().unwrap_or("").to_string(),
        })
        .collect();

    Ok(items)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_file, fetch_hacker_news])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
