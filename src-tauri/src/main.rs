#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod file_handler;
use file_handler::{save_file, fetch_hacker_news};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_file, fetch_hacker_news])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
