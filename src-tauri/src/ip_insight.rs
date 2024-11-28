use std::process::Command;

#[tauri::command]
pub fn trace_ip_full(ip: String) -> Result<String, String> {
    let mut result = String::new();

    // Execute traceroute command
    let traceroute_output = Command::new("traceroute")
        .arg(&ip)
        .output()
        .map_err(|e| format!("Traceroute error: {}", e))?;
    result.push_str("Traceroute Results:\n");
    result.push_str(&String::from_utf8_lossy(&traceroute_output.stdout));

    // Execute whois command
    let whois_output = Command::new("whois")
        .arg(&ip)
        .output()
        .map_err(|e| format!("Whois error: {}", e))?;
    result.push_str("\nWhois Results:\n");
    result.push_str(&String::from_utf8_lossy(&whois_output.stdout));

    // Execute geoiplookup command
    let geoip_output = Command::new("geoiplookup")
        .arg(&ip)
        .output()
        .map_err(|e| format!("GeoIP error: {}", e))?;
    result.push_str("\nGeoIP Results:\n");
    result.push_str(&String::from_utf8_lossy(&geoip_output.stdout));

    Ok(result)
}
