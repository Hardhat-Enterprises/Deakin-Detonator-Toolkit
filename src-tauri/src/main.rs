#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod file_handler;
use file_handler::{save_file, fetch_hacker_news};
use std::net::{TcpStream, ToSocketAddrs};
use std::time::Duration;

#[tauri::command]
fn check_target_reachable(host: String, port: u16) -> Result<(), String> {
    let addr = format!("{}:{}", host, port);
    let socket_addr = addr
        .to_socket_addrs()
        .map_err(|_| format!("Unable to reach {}", addr))?
        .next()
        .ok_or_else(|| format!("Unable to reach {}", addr))?;

    match TcpStream::connect_timeout(&socket_addr, Duration::from_secs(3)) {
        Ok(_) => Ok(()),
        Err(e) if e.kind() == std::io::ErrorKind::TimedOut => {
            Err(format!("Connection to {} timed out", addr))
        }
        Err(e) if e.kind() == std::io::ErrorKind::ConnectionRefused => {
            Err(format!("Connection refused at {}", addr))
        }
        Err(_) => Err(format!("Unable to reach {}", addr)),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_file, fetch_hacker_news, check_target_reachable])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}