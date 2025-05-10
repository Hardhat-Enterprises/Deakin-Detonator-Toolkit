use std::net::ToSocketAddrs;

#[tauri::command]
fn resolve_hostname(hostname: String) -> Result<String, String> {
    let addr = format!("{}:0", hostname); // Add dummy port
    match addr.to_socket_addrs() {
        Ok(mut addrs) => {
            if let Some(ip) = addrs.next() {
                Ok(ip.ip().to_string())
            } else {
                Err("❌ Could not resolve hostname".into())
            }
        }
        Err(_) => Err("❌ Invalid hostname".into()),
    }
}

mod file_handler;
use file_handler::save_file;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_file,
            resolve_hostname
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
