#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod file_handler;
mod ip_insight;

use file_handler::save_file;
use ip_insight::trace_ip_full;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_file, trace_ip_full])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
